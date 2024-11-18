import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // 앱 초기화 시 토큰 확인
        const initializeAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // 토큰 유효성 검사 또는 사용자 정보 가져오기
                    const userInfo = localStorage.getItem('user');
                    if (userInfo) {
                        setUser(JSON.parse(userInfo));
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                }
            }
            setInitialized(true);
        };

        initializeAuth();
    }, []);

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    const value = {
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};