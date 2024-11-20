import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

export const SideMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, setUser, setIsAuthenticated } = useAuthContext();
    const [userStores, setUserStores] = useState([]);
    const [initialized, setInitialized] = useState(false);

    const menuItems = [
        { label: '홈', path: '/' },
        { label: '내 정보', path: '/profile' },
        { label: '예약 내역', path: '/reservations' },
        { label: '리뷰 관리', path: '/user/reviews' },
        { label: '좋아요 목록', path: '/likes' },
        { label: '챗봇(FAQ)', path: '/chatbot' },
        { label: '설정', path: '/settings' },
    ];

    useEffect(() => {
        if (!initialized && user) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            }
            if (user.userRole === 'ROLE_OWNER') {
                fetchUserStores();
            }
            setInitialized(true);
        }
    }, [user, setUser, setIsAuthenticated, initialized]);

    const fetchUserStores = async () => {
        try {
            const response = await fetchAPI(API_ENDPOINTS.store.myStore);
            console.log('User stores:', response);
            if (response.data?.content) {
                setUserStores(response.data.content);
            }
        } catch (error) {
            console.error('Failed to fetch user stores:', error);
        }
    };

    const getOwnerMenuItems = () => {
        const defaultItems = [
            { label: '매장 관리', path: '/owner/stores' },
            { label: '매장 등록', path: '/owner/stores/create' },
        ];

        // 매장이 있는 경우에만 웨이팅/예약 관리 메뉴 추가
        // if (userStores.length > 0) {
        //     return [
        //         ...defaultItems,
        //         {
        //             label: '웨이팅 관리',
        //             path: `/owner/stores/${userStores[0].id}/waiting`,
        //             needsStore: true
        //         },
        //         {
        //             label: '예약 관리',
        //             path: `/owner/stores/${userStores[0].id}/reservations`,
        //             needsStore: true
        //         }
        //     ];
        // }

        return defaultItems;
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
        onClose();
    };

    const handleMenuClick = (item) => {
        if (item.needsStore && userStores.length === 0) {
            alert('먼저 매장을 등록해주세요.');
            return;
        }
        navigate(item.path);
        onClose();
    };

    return (
        <div className="relative z-50">
            {/* 오버레이 */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 ${
                    isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* 사이드 메뉴 */}
            <div
                className={`fixed top-0 right-0 h-full w-64 bg-white transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* 메뉴 헤더 */}
                <div className="p-4 border-b">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 absolute right-2 top-2"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="mt-6">
                        {user ? (
                            <div>
                                <p className="font-bold text-lg">{user.email}</p>
                                <p className="text-sm text-gray-500">{user.userNickname}</p>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="text-blue-500 font-medium"
                                onClick={onClose}
                            >
                                로그인하기
                            </Link>
                        )}
                    </div>
                </div>

                {/* 메뉴 아이템 */}
                <div className="flex-1 overflow-y-auto">
                    {/* 일반 메뉴 */}
                    <div className="py-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleMenuClick(item)}
                                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                            >
                                {item.label}
                            </button>
                        ))}

                        {/* 일반 유저의 경우 설정 메뉴 다음에 로그아웃 표시 */}
                        {user && user.userRole !== 'ROLE_OWNER' && (
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50"
                            >
                                로그아웃
                            </button>
                        )}
                    </div>

                    {/* 사장님 메뉴 */}
                    {user?.userRole === 'ROLE_OWNER' && (
                        <>
                            <div className="my-2 border-t border-gray-200" />
                            <p className="px-4 py-2 text-sm text-gray-500">사장님 메뉴</p>
                            {getOwnerMenuItems().map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => handleMenuClick(item)}
                                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-100"
                                >
                                    {item.label}
                                </button>
                            ))}
                            {/* 사장님의 경우 예약 관리 메뉴 다음에 로그아웃 표시 */}
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-50"
                            >
                                로그아웃
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SideMenu;