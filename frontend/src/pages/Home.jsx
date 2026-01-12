import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigs, setSearchQuery } from '../store/slices/gigSlice';
import GigCard from '../components/GigCard';
import Loading from '../components/Loading';
import { Search } from 'lucide-react';

const Home = () => {
  const dispatch = useDispatch();
  const { gigs, loading, searchQuery } = useSelector((state) => state.gigs);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    dispatch(fetchGigs(searchQuery));
  }, [dispatch, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchQuery(localSearch));
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    dispatch(setSearchQuery(''));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Find Your Next <span className="text-primary-600">Opportunity</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with clients and freelancers on the best gig marketplace
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs by title or description..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Gigs Grid */}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Gigs'}
            </h2>
            <span className="text-gray-600">
              {gigs.length} {gigs.length === 1 ? 'gig' : 'gigs'} found
            </span>
          </div>

          {gigs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {searchQuery 
                  ? 'No gigs found matching your search.' 
                  : 'No gigs available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gigs.map((gig) => (
                <GigCard key={gig._id} gig={gig} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;