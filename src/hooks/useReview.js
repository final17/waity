import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../constants/api';

export const useReview = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        hasNext: false
    });

    const fetchReviews = useCallback(async (menuId, page = 0) => {
        if (!menuId) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const response = await fetch(`${API_ENDPOINTS.review.list(menuId)}?page=${page}&size=10`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('리뷰 목록을 불러오는데 실패했습니다.');
            }

            const data = await response.json();

            if (!data || !data.content) {
                setReviews([]);
                setPagination({
                    currentPage: 0,
                    totalPages: 0,
                    hasNext: false
                });
                return;
            }

            setReviews(prev => page === 0 ? data.content : [...prev, ...data.content]);
            setPagination({
                currentPage: data.number || 0,
                totalPages: data.totalPages || 0,
                hasNext: !data.last
            });

        } catch (err) {
            console.error('Failed to fetch reviews:', err);
            setError(err.message);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUserReviews = useCallback(async (page = 0) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const response = await fetch(`${API_ENDPOINTS.review.userReviews}?page=${page}&size=10`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('리뷰 목록을 불러오는데 실패했습니다.');
            }

            const data = await response.json();

            if (!data || !data.content) {
                setReviews([]);
                setPagination({
                    currentPage: 0,
                    totalPages: 0,
                    hasNext: false
                });
                return;
            }

            setReviews(prev => page === 0 ? data.content : [...prev, ...data.content]);
            setPagination({
                currentPage: data.number || 0,
                totalPages: data.totalPages || 0,
                hasNext: !data.last
            });

        } catch (err) {
            console.error('Failed to fetch user reviews:', err);
            setError(err.message);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createReview = useCallback(async (storeId, menuId, reviewData, isWaiting = false) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const formData = new FormData();
            formData.append('title', reviewData.title);
            formData.append('content', reviewData.content);
            formData.append('rating', reviewData.rating);

            if (reviewData.images && reviewData.images.length > 0) {
                reviewData.images.forEach(image => {
                    formData.append('images', image);
                });
            }

            // 웨이팅인 경우와 예약인 경우 다른 endpoint 사용
            const endpoint = isWaiting
                ? API_ENDPOINTS.review.createWaiting(storeId)
                : API_ENDPOINTS.review.create(storeId, menuId);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || '리뷰 작성에 실패했습니다.');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Failed to create review:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateReview = useCallback(async (reviewId, updateDto) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const formData = new FormData();
            formData.append('title', updateDto.title);
            formData.append('content', updateDto.content);
            formData.append('rating', updateDto.rating);

            if (updateDto.images && updateDto.images.length > 0) {
                updateDto.images.forEach(image => {
                    formData.append('images', image);
                });
            }

            const response = await fetch(API_ENDPOINTS.review.update(reviewId), {
                method: 'PUT',
                headers: {
                    'Authorization': token
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || '리뷰 수정에 실패했습니다.');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Failed to update review:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteReview = useCallback(async (reviewId) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const response = await fetch(API_ENDPOINTS.review.delete(reviewId), {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('리뷰 삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error('Failed to delete review:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        reviews,
        loading,
        error,
        pagination,
        fetchReviews,
        fetchUserReviews,
        createReview,
        updateReview,
        deleteReview
    };
};

export default useReview;