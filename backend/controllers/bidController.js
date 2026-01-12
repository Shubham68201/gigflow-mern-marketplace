import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import mongoose from 'mongoose';

// @desc    Submit a bid
// @route   POST /api/bids
// @access  Private
export const submitBid = async (req, res, next) => {
  try {
    const { gigId, message, price } = req.body;

    // Check if gig exists
    const gig = await Gig.findById(gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Check if gig is still open
    if (gig.status === 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'This gig has already been assigned'
      });
    }

    // Prevent owner from bidding on their own gig
    if (gig.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot bid on your own gig'
      });
    }

    // Check if user already bid
    const existingBid = await Bid.findOne({
      gig: gigId,
      freelancer: req.user._id
    });

    if (existingBid) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a bid for this gig'
      });
    }

    // Create bid
    const bid = await Bid.create({
      gig: gigId,
      freelancer: req.user._id,
      message,
      price
    });

    await bid.populate('freelancer', 'name email');

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bids for a gig
// @route   GET /api/bids/:gigId
// @access  Private (Gig owner only)
export const getBidsForGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found'
      });
    }

    // Make sure user is gig owner
    if (gig.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view bids for this gig'
      });
    }

    const bids = await Bid.find({ gig: req.params.gigId })
      .populate('freelancer', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my bids
// @route   GET /api/bids/my-bids
// @access  Private
export const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ freelancer: req.user._id })
      .populate('gig')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Hire a freelancer (CRITICAL LOGIC WITH TRANSACTIONS)
// @route   PATCH /api/bids/:bidId/hire
// @access  Private (Gig owner only)
export const hireBid = async (req, res, next) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Find the bid
    const bid = await Bid.findById(req.params.bidId)
      .populate('gig')
      .session(session);

    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const gig = await Gig.findById(bid.gig._id).session(session);

    // Verify user is gig owner
    if (gig.owner.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to hire for this gig'
      });
    }

    // Check if gig is already assigned
    if (gig.status === 'assigned') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'This gig has already been assigned'
      });
    }

    // Update the gig status and assign to freelancer
    gig.status = 'assigned';
    gig.assignedTo = bid.freelancer;
    await gig.save({ session });

    // Update the selected bid to hired
    bid.status = 'hired';
    await bid.save({ session });

    // Reject all other bids for this gig
    await Bid.updateMany(
      {
        gig: gig._id,
        _id: { $ne: bid._id },
        status: 'pending'
      },
      { status: 'rejected' },
      { session }
    );

    await session.commitTransaction();

    // Populate the response
    await bid.populate('freelancer', 'name email');

    res.status(200).json({
      success: true,
      message: 'Freelancer hired successfully',
      data: {
        bid,
        gig
      }
    });

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};