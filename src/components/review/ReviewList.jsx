import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';
import Rating from '../common/Rating';
import { PLACEHOLDER_IMAGE } from '../../constants/images';

// ReviewList.jsx의 getImageUrl 함수 수정
const getImageUrl = (imageUrl) => {
    if (!imageUrl) return PLACEHOLDER_IMAGE;
    if (imageUrl.startsWith('http')) return imageUrl;
    // 환경변수를 사용하여 이미지 URL 생성
    return `${process.env.REACT_APP_IMAGE_URL}/${imageUrl}`;
};

const ReviewList = ({ storeId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0
    });

    useEffect(() => {
        const fetchReviews = async () => {
            if (!storeId || loading) return;

            setLoading(true);
            try {
                const response = await fetchAPI(`${API_ENDPOINTS.review.store(storeId)}?page=${page}&size=10`);
                console.log('Review response:', response);

                // 첫 페이지일 때만 통계 계산
                if (page === 0) {
                    const totalRating = response.content.reduce((sum, review) => sum + review.rating, 0);
                    setStats({
                        averageRating: response.totalElements > 0 ? (totalRating / response.content.length).toFixed(1) : 0,
                        totalReviews: response.totalElements
                    });
                }

                // 기존 리뷰에 새 리뷰 추가
                setReviews(prev =>
                    page === 0 ? response.content : [...prev, ...response.content]
                );
                setHasMore(!response.last);
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [storeId, page]);

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return (
        <div className="bg-white">
            {/* 평점 요약 */}
            <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <Rating
                                value={Number(stats.averageRating)}
                                readonly
                                size="lg"
                            />
                            <span className="text-2xl font-bold">
                                {stats.averageRating}
                            </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            총 {stats.totalReviews}개의 리뷰
                        </div>
                    </div>
                </div>
            </div>

            {/* 리뷰 목록 */}
            <div className="divide-y divide-gray-200">
                {reviews.map((review) => (
                    <div key={review.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{review.nickname}</span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="mt-1">
                                    <Rating value={review.rating} readonly size="sm" />
                                </div>
                            </div>
                            {review.reservationDate && (
                                <span className="text-sm text-gray-500">
                                    방문일: {new Date(review.reservationDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>

                        {review.title && (
                            <h4 className="font-medium mb-2">{review.title}</h4>
                        )}
                        <p className="text-gray-600 whitespace-pre-line">{review.content}</p>

                        {/* 리뷰 이미지 */}
                        {review.imageUrls && review.imageUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {review.imageUrls.map((url, index) => (
                                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                        <img
                                            src={getImageUrl(url)}
                                            alt={`리뷰 이미지 ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = PLACEHOLDER_IMAGE;
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* 로딩 상태 */}
                {loading && (
                    <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                    </div>
                )}

                {/* 더보기 버튼 */}
                {hasMore && !loading && (
                    <button
                        onClick={loadMore}
                        className="w-full py-4 text-blue-500 hover:bg-gray-50 font-medium"
                    >
                        더 보기
                    </button>
                )}

                {/* 빈 상태 */}
                {!loading && reviews.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        아직 리뷰가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;