import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, MessageSquare, Star } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../../constants/images';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';
import Rating from '../common/Rating';

const MenuCard = ({ menu, isOwner, onEdit, onDelete }) => {
    const [showReviews, setShowReviews] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0
    });

    const {
        id,
        name = '메뉴명 없음',
        price = 0,
        allergies = null,
        imageUrl = null
    } = menu;

    useEffect(() => {
        const fetchReviewStats = async () => {
            try {
                const response = await fetchAPI(`${API_ENDPOINTS.review.menu(id)}?page=0&size=1`);
                if (response.totalElements > 0) {
                    const reviews = response.content;
                    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                    setStats({
                        averageRating: (totalRating / reviews.length).toFixed(1),
                        totalReviews: response.totalElements
                    });
                }
            } catch (err) {
                console.error('Failed to fetch review stats:', err);
            }
        };

        if (id) {
            fetchReviewStats();
        }
    }, [id]);

    const handleReviewClick = async (e) => {
        e.stopPropagation();
        if (!showReviews) {
            setLoading(true);
            try {
                const response = await fetchAPI(`${API_ENDPOINTS.review.menu(id)}?page=0&size=3`);
                if (response.content) {
                    setReviews(response.content);
                }
            } catch (err) {
                console.error('Failed to fetch reviews:', err);
            } finally {
                setLoading(false);
            }
        }
        setShowReviews(!showReviews);
    };

    return (
        <div className="bg-white border-b last:border-b-0">
            <div className="p-4 flex items-start gap-4">
                {/* 메뉴 이미지 */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                        src={imageUrl || PLACEHOLDER_IMAGE}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                        }}
                    />
                </div>

                {/* 메뉴 정보 */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 break-words">{name}</h3>
                            {allergies && (
                                <p className="mt-1 text-xs text-red-500">
                                    알레르기: {allergies}
                                </p>
                            )}
                            <p className="mt-2 text-lg font-bold text-blue-600">
                                {Number(price).toLocaleString()}원
                            </p>

                            {/* 리뷰 통계 */}
                            {stats.totalReviews > 0 && (
                                <button
                                    onClick={handleReviewClick}
                                    className="mt-2 flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <div className="flex items-center">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="ml-1">{stats.averageRating}</span>
                                    </div>
                                    <MessageSquare className="w-4 h-4" />
                                    <span>리뷰 {stats.totalReviews}</span>
                                </button>
                            )}
                        </div>

                        {/* 관리자 버튼 */}
                        {isOwner && (
                            <div className="flex gap-2 ml-4" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit?.(menu);
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.(id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 리뷰 섹션 */}
            {showReviews && (
                <div className="px-4 py-2 bg-gray-50" onClick={e => e.stopPropagation()}>
                    {loading ? (
                        <div className="py-4 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <div key={review.id} className="p-3 bg-white rounded-lg">
                                    <div className="flex justify-between items-start">
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
                                    </div>
                                    <h4 className="font-medium mt-2">{review.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{review.content}</p>

                                    {/* 리뷰 이미지 */}
                                    {review.imageUrls && review.imageUrls.length > 0 && (
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            {review.imageUrls.map((url, index) => (
                                                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                                    <img
                                                        src={url}
                                                        alt={`리뷰 이미지 ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {reviews.length > 0 && (
                                <button
                                    onClick={() => setShowReviews(false)}
                                    className="w-full py-2 text-sm text-blue-500 hover:text-blue-600"
                                >
                                    접기
                                </button>
                            )}
                            {reviews.length === 0 && (
                                <div className="py-4 text-center text-gray-500 text-sm">
                                    아직 리뷰가 없습니다.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MenuCard;