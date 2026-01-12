import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

const initialState = {
  gigs: [],
  currentGig: null,
  loading: false,
  error: null,
  searchQuery: '',
};

// Get all gigs
export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async (searchQuery = '', { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/gigs?search=${searchQuery}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get single gig
export const fetchGigById = createAsyncThunk(
  'gigs/fetchGigById',
  async (gigId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/gigs/${gigId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create gig
export const createGig = createAsyncThunk(
  'gigs/createGig',
  async (gigData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/gigs', gigData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update gig
export const updateGig = createAsyncThunk(
  'gigs/updateGig',
  async ({ gigId, gigData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/gigs/${gigId}`, gigData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete gig
export const deleteGig = createAsyncThunk(
  'gigs/deleteGig',
  async (gigId, { rejectWithValue }) => {
    try {
      await api.delete(`/gigs/${gigId}`);
      return gigId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const gigSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearCurrentGig: (state) => {
      state.currentGig = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch gigs
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs = action.payload;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch single gig
      .addCase(fetchGigById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGig = action.payload;
      })
      .addCase(fetchGigById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create gig
      .addCase(createGig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.loading = false;
        state.gigs.unshift(action.payload);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update gig
      .addCase(updateGig.fulfilled, (state, action) => {
        const index = state.gigs.findIndex(g => g._id === action.payload._id);
        if (index !== -1) {
          state.gigs[index] = action.payload;
        }
        if (state.currentGig?._id === action.payload._id) {
          state.currentGig = action.payload;
        }
      })
      // Delete gig
      .addCase(deleteGig.fulfilled, (state, action) => {
        state.gigs = state.gigs.filter(g => g._id !== action.payload);
      });
  },
});

export const { setSearchQuery, clearCurrentGig, clearError } = gigSlice.actions;
export default gigSlice.reducer;