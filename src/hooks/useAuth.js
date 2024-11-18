import { useState } from 'react';
import { API_ENDPOINTS } from '../constants/api';
import { auth } from '../lib/auth';
import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setUser, setIsAuthenticated } = useAuthContext();

    const signup = async (userData) => {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.auth.signup, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials) => {
        console.log("login");
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.auth.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            const accessToken = data.data.accessToken;
            const refreshToken = data.data.refreshToken;

            // 토큰 저장
            auth.setTokens(accessToken, refreshToken);

            // 토큰에서 role 가져오기
            const userRole = auth.getUserRole();

            // 사용자 정보를 localStorage에도 저장
            const userInfo = {
                id: data.data.id,
                email: data.data.email,
                userNickname: data.data.userNickname,
                userRole: userRole  // 토큰에서 가져온 role 사용
            };

            localStorage.setItem('user', JSON.stringify(userInfo));

            // Context 업데이트
            setUser(userInfo);
            setIsAuthenticated(true);

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        console.log("logout");
        setIsLoading(true);
        try {
            await fetch(API_ENDPOINTS.auth.logout, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.getAccessToken()}`,
                },
            });

            // 토큰과 사용자 정보 모두 제거
            auth.clearTokens();
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        signup,
        login,
        logout,
    };
};