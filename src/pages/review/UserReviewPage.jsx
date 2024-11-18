import { useState, useEffect } from 'react';
import Header from '../../components/common/Header';
import ReviewCard from '../../components/review/ReviewCard';
import { useReview } from '../../hooks/useReview';
import { ArrowLeft } from 'lucide-react';

const UserReviewPage = () => {
    const { reviews, loading, error, pagination, fetchUserReviews } = useReview();
    const [filterType, setFilterType] = useState('all'); // all, recent, highRating, lowRating
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingCounts: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        }
    });

    useEffect(() => {
        fetchUserReviews();
    }, [fetchUserReviews]);

    // 리뷰 데이터가 변경될 때마다 통계 업데이트
    useEffect(() => {
        if (!reviews || reviews.length === 0) {
            setStats({
                totalReviews: 0,
                averageRating: 0,
                ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            });
            return;
        }

        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / totalReviews).toFixed(1);

        const ratingCounts = reviews.reduce((acc, review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1;
            return acc;
        }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

        setStats({
            totalReviews,
            averageRating,
            ratingCounts
        });
    }, [reviews]);

    const filterButtons = [
        { type: 'all', label: '전체' },
        { type: 'recent', label: '최신순' },
        { type: 'highRating', label: '높은 평점순' },
        { type: 'lowRating', label: '낮은 평점순' }
    ];

    const getFilteredReviews = () => {
        if (!reviews || reviews.length === 0) return [];

        let filteredReviews = [...reviews];

        switch (filterType) {
            case 'recent':
                return filteredReviews.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );
            case 'highRating':
                return filteredReviews.sort((a, b) => b.rating - a.rating);
            case 'lowRating':
                return filteredReviews.sort((a, b) => a.rating - b.rating);
            default:
                return filteredReviews;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="내 리뷰"
                leftButton={
                    <button onClick={() => window.history.back()} className="p-2">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                }
            />

            <div className="pt-14">
                {/* 리뷰 통계 */}
                <div className="bg-white p-4 mb-2">
                    <div className="text-center">
                        <p className="text-lg font-bold">전체 평점</p>
                        <p className="text-3xl font-bold text-yellow-500 mt-2">
                            {stats.averageRating}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            총 {stats.totalReviews}개의 리뷰
                        </p>
                    </div>

                    {/* 평점 분포 */}
                    <div className="mt-4 space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => (
                            <div key={rating} className="flex items-center">
                                <span className="w-12 text-sm text-gray-600">
                                    {rating}점
                                </span>
                                <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400"
                                        style={{
                                            width: `${stats.totalReviews > 0
                                                ? (stats.ratingCounts[rating] / stats.totalReviews) * 100
                                                : 0}%`
                                        }}
                                    />
                                </div>
                                <span className="w-12 text-sm text-gray-600 text-right">
                                    {stats.ratingCounts[rating]}개
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 필터 버튼 */}
                <div className="bg-white border-b">
                    <div className="flex p-2">
                        {filterButtons.map(button => (
                            <button
                                key={button.type}
                                onClick={() => setFilterType(button.type)}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg mx-1 ${
                                    filterType === button.type
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 리뷰 목록 */}
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">
                        리뷰를 불러오는데 실패했습니다.
                    </div>
                ) : getFilteredReviews().length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        작성한 리뷰가 없습니다.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 bg-white">
                        {getFilteredReviews().map(review => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                isOwner={true}
                            />
                        ))}
                    </div>
                )}

                {/* 더보기 버튼 */}
                {pagination.hasNext && !loading && (
                    <div className="p-4">
                        <button
                            onClick={() => fetchUserReviews(pagination.currentPage + 1)}
                            className="w-full py-3 bg-white text-blue-500 rounded-lg border border-blue-500 font-medium hover:bg-blue-50"
                        >
                            더보기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserReviewPage;