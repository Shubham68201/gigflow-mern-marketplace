import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  bids: [],
  myBids: [],
  loading: false,
  error: null,
};

// Submit bid
export const submitBid = createAsyncThunk(
  'bids/submitBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/bids', bidData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get bids for a gig (owner only)
export const fetchBidsForGig = createAsyncThunk(
  'bids/fetchBidsForGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/bids/${gigId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get my bids
export const fetchMyBids = createAsyncThunk(
  'bids/fetchMyBids',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/bids/my-bids');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Hire freelancer
export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async (bidId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/bids/${bidId}/hire`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const bidSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    clearBids: (state) => {
      state.bids = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit bid
      .addCase(submitBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitBid.fulfilled, (state, action) => {
        state.loading = false;
        state.myBids.unshift(action.payload);
      })
      .addCase(submitBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch bids for gig
      .addCase(fetchBidsForGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        state.loading = false;
        state.bids = action.payload;
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch my bids
      .addCase(fetchMyBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBids.fulfilled, (state, action) => {
        state.loading = false;
        state.myBids = action.payload;
      })
      .addCase(fetchMyBids.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Hire bid
      .addCase(hireBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        state.loading = false;
        // Update the bids array to reflect hired status
        state.bids = state.bids.map(bid => 
          bid._id === action.payload.bid._id 
            ? { ...bid, status: 'hired' }
            : bid.status === 'pending' 
              ? { ...bid, status: 'rejected' }
              : bid
        );
      })
      .addCase(hireBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBids, clearError } = bidSlice.actions;
export default bidSlice.reducer;