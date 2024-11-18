import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

// 보호된 라우트 컴포넌트
export const ProtectedRoute = () => {
    const { isAuthenticated, user } = useAuthContext();
    const token = localStorage.getItem('accessToken');

    // 토큰이 없거나 인증되지 않은 경우
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

// 로그인 전용 라우트 컴포넌트 (로그인했으면 홈으로)
export const AuthRoute = ({ children }) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
        return <Navigate to="/" replace />;
    }

    return children;
};