import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBids } from '../store/slices/bidSlice';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import { FileText, DollarSign, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const MyBids = () => {
  const dispatch = useDispatch();
  const { myBids, loading } = useSelector((state) => state.bids);

  useEffect(() => {
    dispatch(fetchMyBids());
  }, [dispatch]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        text: 'Pending'
      },
      hired: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        text: 'Hired'
      },
      rejected: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        text: 'Rejected'
      }
    };
    return config[status];
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <FileText className="h-8 w-8 text-primary-600" />
        <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
      </div>

      {myBids.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-4">You haven't submitted any bids yet.</p>
          <Link to="/" className="btn-primary inline-block">
            Browse Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myBids.map((bid) => {
            const statusConfig = getStatusConfig(bid.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={bid._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link 
                      to={`/gigs/${bid.gig._id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {bid.gig.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Budget: ${bid.gig.budget}
                    </p>
                  </div>
                  
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${statusConfig.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="font-medium">{statusConfig.text}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Your Proposal:</p>
                  <p className="text-gray-600">{bid.message}</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Your Bid</p>
                        <p className="font-semibold text-gray-900">${bid.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Submitted</p>
                        <p className="font-semibold text-gray-900">{formatDate(bid.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <Link 
                    to={`/gigs/${bid.gig._id}`}
                    className="btn-secondary"
                  >
                    View Gig
                  </Link>
                </div>

                {bid.status === 'hired' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      🎉 Congratulations! You've been hired for this project.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {myBids.length > 0 && (
        <div className="mt-6 text-center text-gray-600">
          <p>Total Bids: {myBids.length}</p>
          <div className="flex justify-center space-x-6 mt-2 text-sm">
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Pending: {myBids.filter(b => b.status === 'pending').length}</span>
            </span>
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Hired: {myBids.filter(b => b.status === 'hired').length}</span>
            </span>
            <span className="flex items-center space-x-1">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>Rejected: {myBids.filter(b => b.status === 'rejected').length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBids;