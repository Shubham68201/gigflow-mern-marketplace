import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGigs } from '../store/slices/gigSlice';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { Layers, DollarSign, Calendar, Eye, PlusCircle } from 'lucide-react';

const MyGigs = () => {
  const dispatch = useDispatch();
  const { gigs, loading } = useSelector((state) => state.gigs);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchGigs());
  }, [dispatch]);

  if (loading || !user) return <Loading />;

const myGigs = (gigs || []).filter(gig => gig.owner?._id === user._id);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    return status === 'open' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <Layers className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Gigs</h1>
        </div>
        <Link to="/gigs/create" className="btn-primary flex items-center space-x-2">
          <PlusCircle className="h-5 w-5" />
          <span>Post New Gig</span>
        </Link>
      </div>

      {myGigs.length === 0 ? (
        <div className="card text-center py-12">
          <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">You haven't posted any gigs yet.</p>
          <Link to="/gigs/create" className="btn-primary inline-block">
            Post Your First Gig
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myGigs.map((gig) => (
            <div key={gig._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link 
                    to={`/gigs/${gig._id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {gig.title}
                  </Link>
                </div>
                
                <span className={`px-4 py-2 rounded-lg border font-medium text-sm ${getStatusColor(gig.status)}`}>
                  {gig.status.toUpperCase()}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{gig.description}</p>

              {gig.status === 'assigned' && gig.assignedTo && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    <strong>Assigned to:</strong> {gig.assignedTo.name} ({gig.assignedTo.email})
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-semibold text-gray-900">${gig.budget}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Posted</p>
                      <p className="font-semibold text-gray-900">{formatDate(gig.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/gigs/${gig._id}`}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {myGigs.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          <p>Total Gigs Posted: {myGigs.length}</p>
          <div className="flex justify-center space-x-6 mt-2 text-sm">
            <span>Open: {myGigs.filter(g => g.status === 'open').length}</span>
            <span>Assigned: {myGigs.filter(g => g.status === 'assigned').length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGigs;