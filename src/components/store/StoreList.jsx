import { useState, useEffect } from 'react';
import StoreCard from './StoreCard';

const OwnerStoreList = ({ stores, onSelect }) => {
    return (
        <div className="space-y-4">
            {stores.map(store => (
                <div
                    key={store.id}
                    onClick={() => onSelect(store)}
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <h3 className="font-medium text-lg">{store.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{store.address}</p>
                    <div className="mt-2 text-xs text-gray-500">
                        영업시간: {store.openTime} - {store.closeTime}
                    </div>
                </div>
            ))}
        </div>
    );
};

const StoreList = ({ stores, loading, error }) => {
    const [filteredStores, setFilteredStores] = useState([]);
    const [sortType, setSortType] = useState('rating'); // rating, distance, review

    useEffect(() => {
        if (!stores) return;

        let sorted = [...stores];
        switch (sortType) {
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'distance':
                sorted.sort((a, b) => a.distance - b.distance);
                break;
            case 'review':
                sorted.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            default:
                break;
        }
        setFilteredStores(sorted);
    }, [stores, sortType]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                {error}
            </div>
        );
    }

    if (!filteredStores.length) {
        return (
            <div className="p-4 text-center text-gray-500">
                표시할 매장이 없습니다
            </div>
        );
    }

    return (
        <div>
            {/* 정렬 옵션 */}
            <div className="p-4 flex gap-2 border-b bg-white sticky top-0 z-10">
                {[
                    { id: 'rating', label: '평점순' },
                    { id: 'distance', label: '거리순' },
                    { id: 'review', label: '리뷰순' }
                ].map(option => (
                    <button
                        key={option.id}
                        onClick={() => setSortType(option.id)}
                        className={`px-3 py-1 rounded-full text-sm ${
                            sortType === option.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* 매장 목록 */}
            <div className="divide-y divide-gray-200">
                {filteredStores.map(store => (
                    <StoreCard key={store.id} store={store} />
                ))}
            </div>
        </div>
    );
};

export default StoreList;