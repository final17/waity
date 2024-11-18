import { toast } from 'react-toastify';

const API_BASE = 'https://waity.shop';

export const API_ENDPOINTS = {
    auth: {
        signup: `${API_BASE}/api/v2/auth/signup`,
        login: `${API_BASE}/api/v2/auth/login`,
        logout: `${API_BASE}/api/v2/auth/logout`,
        reissue: `${API_BASE}/api/v2/auth/reissue`,
        checkEmail: `${API_BASE}/api/v2/auth/email/check`,
        checkNickname: `${API_BASE}/api/v2/auth/nickname/check`,
    },
    categories: `${API_BASE}/api/categories`,
    store: {
        list: `${API_BASE}/api/v1/user/stores`,
        detail: (id) => `${API_BASE}/api/v1/user/stores/${id}`,
        myStore: `${API_BASE}/api/v1/owner/stores/my`,
        create: `${API_BASE}/api/v1/owner/stores`,
        update: (id) => `${API_BASE}/api/v1/owner/stores/${id}`,
        delete: (id) => `${API_BASE}/api/v1/owner/stores/${id}`,
    },
    menu: {
        list: (storeId) => `${API_BASE}/api/v2/stores/${storeId}/menus`,
        ownerList: (storeId) => `${API_BASE}/api/v1/owner/stores/${storeId}/menus`,
        create: (storeId) => `${API_BASE}/api/v1/owner/stores/${storeId}/menus`,
        detail: (storeId, menuId) => `${API_BASE}/api/v2/stores/${storeId}/menus/${menuId}`,
        update: (storeId, menuId) => `${API_BASE}/api/v1/owner/stores/${storeId}/menus/${menuId}`,
        delete: (storeId, menuId) => `${API_BASE}/api/v1/owner/stores/${storeId}/menus/${menuId}`

    },
    search: {
        autocomplete: `${API_BASE}/api/search/autocomplete`,
        search: `${API_BASE}/api/search`
    },
    waiting: {
        connect: (storeId) => `${API_BASE}/api/v2/user/stores/${storeId}/waitings/connection`,
        add: (storeId) => `${API_BASE}/api/v2/user/stores/${storeId}/waitings`,
        cancel: (storeId) => `${API_BASE}/api/v2/user/stores/${storeId}/waitings`,
        list: (storeId) => `${API_BASE}/api/v2/owner/stores/${storeId}/waitings/list`,
        check: (storeId) => `${API_BASE}/api/v2/user/stores/${storeId}/waitings`,
        ownerList: (storeId) => `${API_BASE}/api/v2/owner/stores/${storeId}/waitings/list`,
        poll: (storeId) => `${API_BASE}/api/v2/owner/stores/${storeId}/waitings/poll`,
        completed: `${API_BASE}/api/v2/user/waitings/completed`,
        clear: (storeId) => `${API_BASE}/api/v2/owner/stores/${storeId}/waitings/clear`,
        statistics: {
            daily: (storeId) => `${API_BASE}/api/v1/owner/stores/${storeId}/waitings/statistics/daily`,
            dailyRange: (storeId) => `${API_BASE}/api/v1/owner/stores/${storeId}/waitings/statistics/daily/range`,
            monthly: (storeId) => `${API_BASE}/api/v1/owner/stores/${storeId}/waitings/statistics/monthly`,
            hourly: (storeId) => `${API_BASE}/api/v1/owner/stores/${storeId}/waitings/statistics/hourly`
        }
    },
    review: {
        create: (storeId, menuId) => `${API_BASE}/api/v1/reviews/${storeId}/${menuId}`,
        createWaiting: (storeId) => `${API_BASE}/api/v1/reviews/${storeId}/waiting`,
        update: (reviewId) => `${API_BASE}/api/v1/reviews/${reviewId}`,
        delete: (reviewId) => `${API_BASE}/api/v1/reviews/${reviewId}`,
        store: (storeId) => `${API_BASE}/api/v1/reviews/store/${storeId}`,
        menu: (menuId) => `${API_BASE}/api/v1/reviews/${menuId}`,
        menus: (reservationId) => `${API_BASE}/api/v1/reviews/reservations/${reservationId}/menus`,
        userReviews: `${API_BASE}/api/v1/reviews/my`  // 사용자 리뷰 엔드포인트 추가
    },
    allergy: {
        list: `${API_BASE}/api/v2/allergies`
    },
    crawler: {
        blog: `${API_BASE}/api/v1/crawler/blog`,
        news: `${API_BASE}/api/v1/crawler/news`,
        keywords: `${API_BASE}/api/v1/crawler/keywords` // 키워드 생성 엔드포인트 추가
    },
    reservation: {
        // 사용자 예약 조회
        list: `${API_BASE}/api/v2/reservations`,
        // 예약 취소
        cancel: (storeId, reservationId) =>
            `${API_BASE}/api/v2/store/${storeId}/reservation/${reservationId}`,
        // 사장님 예약 관리
        ownerList: `${API_BASE}/api/v2/reservation-management`,
        refuse: (reservationId) =>
            `${API_BASE}/api/v2/reservation-management/${reservationId}/refusal`,
        apply: (reservationId) =>
            `${API_BASE}/api/v2/reservation-management/${reservationId}/apply`,
        complete: (reservationId) =>
            `${API_BASE}/api/v2/reservation-management/${reservationId}/complete`,
        menus: (reservationId) => `${API_BASE}/api/v1/reviews/reservations/${reservationId}/menus` // 여기 추가

    },
    cart: {
        add: (storeId) => `${API_BASE}/api/v2/store/${storeId}/cart`,
        list: (storeId) => `${API_BASE}/api/v2/store/${storeId}/cart`
    },
    payment: {
        prepare: `${API_BASE}/api/v2/payment/prepare`,
        success: `${API_BASE}/api/v2/payment/success`,
        fail: `${API_BASE}/api/v2/payment/fail`
    },
    settlement: {
        summary: (storeId) => `${API_BASE}/api/v2/store/${storeId}/settlement/summary`
    }
};

export const fetchAPI = async (url, options = {}) => {
    return await makeRequest(url, {
        ...options,
        method: options.method || 'GET'
    });
};

export const fetchGET = async (url, options = {}) => {
    const params = options.params ? new URLSearchParams(options.params).toString() : '';
    const finalUrl = params ? `${url}?${params}` : url;

    return await makeRequest(finalUrl, {
        ...options,
        method: 'GET'
    });
};

// API 요청 및 리프레시 토큰 처리
const makeRequest = async (url, options) => {
    let token = localStorage.getItem('accessToken');

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...(!(options.body instanceof FormData) && {
                    'Content-Type': 'application/json'
                }),
                ...(token && { Authorization: `${token}` }),
                ...options.headers
            }
        });

        if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
                // 새 토큰으로 재요청
                options.headers = {
                    ...options.headers,
                    Authorization: `${newToken}`
                };
                return await fetch(url, options).then(handleResponse);
            } else {
                handleSessionExpired();
                throw new Error('인증이 만료되었습니다.');
            }
        }

        return await handleResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// 응답 처리
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server Error:', errorData);
        throw new Error(errorData.message || 'API 요청에 실패했습니다.');
    }

    return await response.json();
};

// Refresh Token으로 Access Token 갱신
const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
        handleSessionExpired();
        return null;
    }

    try {
        const response = await fetch(API_ENDPOINTS.auth.reissue, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Refresh-Token': refreshToken
            }
        });

        if (response.ok) {
            const data = await response.json();
            const { accessToken, refreshToken: newRefreshToken } = data.data;

            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            return accessToken;
        } else {
            handleSessionExpired();
            return null;
        }
    } catch (error) {
        console.error('Failed to refresh token:', error);
        handleSessionExpired();
        return null;
    }
};



// 세션 만료 처리 (로그아웃 및 로그인 페이지 이동)
const handleSessionExpired = () => {
    toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
};