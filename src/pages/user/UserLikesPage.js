import { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import StoreCard from '../../components/store/StoreCard';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

const UserLikesPage = () => {
    const [likedStores, setLikedStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchLikedStores = async () => {
        try {
            setLoading(true);
            const response = await fetchAPI(
                `${API_ENDPOINTS.store.getLikedStores}?page=${page}&size=10`
            );

            console.log('Liked stores response:', response);

            if (page === 0) {
                setLikedStores(response.data.content);
            } else {
                setLikedStores(prev => [...prev, ...response.data.content]);
            }

            setHasMore(!response.data.last);
        } catch (error) {
            console.error('좋아요 목록을 불러오는데 실패했습니다:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLikedStores();
    }, [page]);

    const handleStoreLike = async (storeId) => {
        try {
            await fetchAPI(API_ENDPOINTS.store.toggleLike(storeId), {
                method: 'PATCH',
            });
            // 좋아요 취소 후 목록 새로고침
            setPage(0);
            fetchLikedStores();
        } catch (error) {
            console.error('좋아요 처리 중 오류가 발생했습니다:', error);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="좋아요한 맛집" />

            <div className="pt-14 p-4">
                {loading && page === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : likedStores.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        좋아요한 맛집이 없습니다
                    </div>
                ) : (
                    <div className="space-y-4">
                        {likedStores.map(store => (
                            <StoreCard
                                key={store.id}
                                store={store}
                                onLikeClick={handleStoreLike}
                            />
                        ))}

                        {hasMore && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={loadMore}
                                    className="px-4 py-2 bg-white border rounded-md text-gray-600 hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    {loading ? '로딩 중...' : '더보기'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserLikesPage;