import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useUserStore } from '../../../hooks/useStore';
import StoreCard from '../../../components/store/StoreCard';

const StoreLikePage = () => {
    const navigate = useNavigate();
    const { likedStores, loading, error, fetchLikedStores } = useUserStore();

    useEffect(() => {
        fetchLikedStores();
    }, [fetchLikedStores]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="fixed top-0 left-0 right-0 bg-white border-b z-50">
                <div className="flex items-center p-2">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="ml-2 text-lg font-medium">찜한 매장</h1>
                </div>
            </div>

            <div className="pt-16 p-4">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">
                        {error}
                    </div>
                ) : likedStores.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 mb-4">찜한 매장이 없습니다</p>
                        <button
                            onClick={() => navigate('/stores')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            매장 둘러보기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {likedStores.map(store => (
                            <StoreCard
                                key={store.id}
                                store={store}
                                onClick={() => navigate(`/stores/${store.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreLikePage;