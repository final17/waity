import { useState } from 'react';
import Header from '../../components/common/Header';
import ReviewCard from '../../components/review/ReviewCard';
import { useReview } from '../../hooks/useReview';

const ReviewManagePage = () => {
    const [filterType, setFilterType] = useState('all'); // all, unreplied, replied
    const { reviews, loading, error } = useReview();

    const filterButtons = [
        { type: 'all', label: '전체 리뷰' },
        { type: 'unreplied', label: '미답변' },
        { type: 'replied', label: '답변 완료' }
    ];

    const getFilteredReviews = () => {
        switch (filterType) {
            case 'unreplied':
                return reviews.filter(review => !review.reply);
            case 'replied':
                return reviews.filter(review => review.reply);
            default:
                return reviews;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="리뷰 관리" showBack={false} />

            <div className="pt-14">
                {/* 리뷰 통계 */}
                <div className="bg-white p-4 border-b">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-500">총 리뷰</p>
                            <p className="text-xl font-bold">{reviews.length}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">평균 평점</p>
                            <p className="text-xl font-bold text-yellow-500">
                                {(reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length || 0).toFixed(1)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">미답변</p>
                            <p className="text-xl font-bold text-red-500">
                                {reviews.filter(review => !review.reply).length}
                            </p>
                        </div>
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
                    <div className="p-4 text-center text-gray-500">
                        {filterType === 'unreplied'
                            ? '미답변 리뷰가 없습니다.'
                            : filterType === 'replied'
                                ? '답변 완료된 리뷰가 없습니다.'
                                : '리뷰가 없습니다.'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {getFilteredReviews().map(review => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                isOwner={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewManagePage;