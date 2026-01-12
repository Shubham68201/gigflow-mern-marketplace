import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigById } from '../store/slices/gigSlice';
import { submitBid, fetchBidsForGig, hireBid } from '../store/slices/bidSlice';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import { DollarSign, User, Calendar, MessageSquare, CheckCircle, XCircle } from 'lucide-react';

const GigDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  
  const { currentGig, loading: gigLoading } = useSelector((state) => state.gigs);
  const { bids, loading: bidLoading } = useSelector((state) => state.bids);
  const { user } = useSelector((state) => state.auth);

  const [showBidForm, setShowBidForm] = useState(false);
  const [bidForm, setBidForm] = useState({ message: '', price: '' });

  const isOwner = currentGig?.owner?._id === user?._id;
  const hasAlreadyBid = bids.some(bid => bid.freelancer._id === user?._id);

  useEffect(() => {
    dispatch(fetchGigById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (isOwner && currentGig) {
      dispatch(fetchBidsForGig(id));
    }
  }, [dispatch, id, isOwner, currentGig]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (!bidForm.message || !bidForm.price) {
      toast.error('Please fill in all fields');
      return;
    }

    if (bidForm.price <= 0) {
      toast.error('Bid price must be greater than 0');
      return;
    }

    try {
      await dispatch(submitBid({
        gigId: id,
        message: bidForm.message,
        price: Number(bidForm.price)
      })).unwrap();
      
      toast.success('Bid submitted successfully!');
      setBidForm({ message: '', price: '' });
      setShowBidForm(false);
    } catch (error) {
      toast.error(error || 'Failed to submit bid');
    }
  };

  const handleHire = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer?')) {
      return;
    }

    try {
      await dispatch(hireBid(bidId)).unwrap();
      toast.success('Freelancer hired successfully!');
      dispatch(fetchGigById(id));
    } catch (error) {
      toast.error(error || 'Failed to hire freelancer');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-green-100 text-green-800',
      assigned: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-4 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getBidStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare },
      hired: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const { color, icon: Icon } = config[status];
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${color} flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{status.toUpperCase()}</span>
      </span>
    );
  };

  if (gigLoading) return <Loading />;

  if (!currentGig) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Gig not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gig Details */}
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{currentGig.title}</h1>
          {getStatusBadge(currentGig.status)}
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-600 whitespace-pre-line">{currentGig.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-semibold text-gray-900">${currentGig.budget}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Posted by</p>
              <p className="font-semibold text-gray-900">{currentGig.owner?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Posted on</p>
              <p className="font-semibold text-gray-900">{formatDate(currentGig.createdAt)}</p>
            </div>
          </div>
        </div>

        {currentGig.status === 'assigned' && currentGig.assignedTo && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              <strong>Assigned to:</strong> {currentGig.assignedTo.name}
            </p>
          </div>
        )}
      </div>

      {/* Bid Section for Freelancers */}
      {!isOwner && currentGig.status === 'open' && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Your Bid</h2>
          
          {hasAlreadyBid ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">You have already submitted a bid for this gig.</p>
            </div>
          ) : showBidForm ? (
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Proposal
                </label>
                <textarea
                  value={bidForm.message}
                  onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                  className="input-field resize-none"
                  rows="4"
                  placeholder="Explain why you're the best fit for this project..."
                  maxLength={1000}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Bid Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={bidForm.price}
                    onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })}
                    className="input-field pl-8"
                    placeholder="450"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary" disabled={bidLoading}>
                  {bidLoading ? 'Submitting...' : 'Submit Bid'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowBidForm(true)} className="btn-primary">
              Place a Bid
            </button>
          )}
        </div>
      )}

      {/* Bids List for Owner */}
      {isOwner && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Bids Received ({bids.length})
          </h2>

          {bidLoading ? (
            <Loading />
          ) : bids.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bids received yet.</p>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div key={bid._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{bid.freelancer.name}</h3>
                      <p className="text-sm text-gray-500">{bid.freelancer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary-600">${bid.price}</p>
                      {getBidStatusBadge(bid.status)}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{bid.message}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Submitted on {formatDate(bid.createdAt)}
                    </p>
                    
                    {bid.status === 'pending' && currentGig.status === 'open' && (
                      <button
                        onClick={() => handleHire(bid._id)}
                        className="btn-primary"
                        disabled={bidLoading}
                      >
                        Hire
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetails;