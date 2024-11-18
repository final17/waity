import { Clock, MapPin, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STORE_PLACEHOLDER } from '../../constants/images';
import Rating from '../common/Rating';

const StoreCard = ({ store }) => {
    const navigate = useNavigate();
    console.log('Store Data:', store); // 데이터 구조 확인

    if (!store) return null;

    const {
        id,
        image,
        title = '',
        description = '',
        averageRating = 0,  // rating 대신 averageRating 사용
        reviewCount = 0,
        address = '',
        openTime = '09:00:00',
        closeTime = '22:00:00',
        lastOrder = '21:00:00',
        isOpen = false,
        distance = null,
        view = 0,
        deposit = 0,
        districtCategory
    } = store;

    const formatTime = (time) => {
        try {
            return time.substring(0, 5);
        } catch {
            return '00:00';
        }
    };

    const formatRating = (value) => {
        const numericRating = Number(value) || 0;
        return numericRating.toFixed(1);
    };

    const formatDistance = (value) => {
        if (typeof value !== 'number') return null;
        return value < 1 ?
            `${(value * 1000).toFixed(0)}m` :
            `${value.toFixed(1)}km`;
    };

    return (
        <div onClick={() => navigate(`/stores/${id}`)} className="bg-white border-b last:border-b-0 cursor-pointer hover:bg-gray-50">
            <div className="relative aspect-video">
                <img
                    src={image || STORE_PLACEHOLDER}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.src = STORE_PLACEHOLDER;
                    }}
                />
                {distance !== null && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-60 rounded text-white text-xs">
                        {formatDistance(distance)}
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-medium text-gray-900">{title}</h3>
                        {districtCategory && (
                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                              {districtCategory.name}
                          </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <Rating
                                value={Number(averageRating)}
                                readonly={true}
                                size="sm"
                                showCount={true}
                                count={reviewCount}
                            />
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                            <Eye className="w-4 h-4 mr-1" />
                            {view}
                        </div>
                    </div>
                </div>

                {description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {description}
                    </p>
                )}

                <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {formatTime(openTime)} - {formatTime(closeTime)}
                      </span>
                        {lastOrder && (
                            <span className="ml-2 text-red-500">
                              (LO {formatTime(lastOrder)})
                          </span>
                        )}
                        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded ${
                            isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isOpen ? '영업중' : '영업종료'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="line-clamp-1">{address}</span>
                    </div>
                </div>

                {deposit > 0 && (
                    <div className="mt-2 text-sm text-blue-600 font-medium">
                        예약금: {deposit.toLocaleString()}원
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreCard;