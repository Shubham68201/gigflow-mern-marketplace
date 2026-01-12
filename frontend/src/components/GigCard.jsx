import { Link } from 'react-router-dom';
import { DollarSign, User, Calendar } from 'lucide-react';

const GigCard = ({ gig }) => {
  const getStatusColor = (status) => {
    return status === 'open' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Link to={`/gigs/${gig._id}`}>
      <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {gig.title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(gig.status)}`}>
            {gig.status}
          </span>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {gig.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-gray-900">${gig.budget}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{gig.owner?.name || 'Unknown'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(gig.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;