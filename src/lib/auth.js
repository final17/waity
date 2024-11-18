const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

const getAccessToken = () => {
    return localStorage.getItem('accessToken');
};

const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
};

// JWT 디코딩 함수 추가
const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload;
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

// 현재 사용자 역할 가져오기 함수 추가
const getUserRole = () => {
    const token = getAccessToken();
    if (!token) return null;

    const decodedToken = decodeToken(token);
    // 토큰에서 role 정보 가져오기 (실제 키는 토큰 구조에 따라 수정 필요)
    return decodedToken?.role || decodedToken?.userRole || decodedToken?.authorities;
};

export const auth = {
    setTokens,
    clearTokens,
    getAccessToken,
    getRefreshToken,
    decodeToken,
    getUserRole,
};