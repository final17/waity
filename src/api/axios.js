// 이거 안씀
// 이거 안씀
// 이거 안씀
// 이거 안씀
// 이거 안씀
// 이거 안씀
// 이거 안씀
// 이거 안씀

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    }
});

// 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            // 요청 시 Bearer 접두사 추가
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
api.interceptors.response.use(
    (response) => {
        // 응답에 토큰이 포함되어 있다면 Bearer 제거 후 저장
        const newToken = response.headers?.authorization;
        if (newToken) {
            const cleanToken = newToken.replace('Bearer ', '');
            localStorage.setItem('accessToken', cleanToken);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;