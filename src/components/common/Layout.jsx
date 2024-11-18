import { useLocation, Link } from 'react-router-dom';
import { useCallback } from 'react';
import { Home, Search, Bell, User } from 'lucide-react';

const Layout = ({ children }) => {
    const location = useLocation();
    const isOwnerPage = location.pathname.startsWith('/owner');

    const navigationItems = [
        { icon: Home, label: '홈', path: '/' },
        { icon: Search, label: '검색', path: '/search' },
        { icon: Bell, label: '알림', path: '/notifications' },
        { icon: User, label: '내정보', path: '/profile' }
    ];

    const isActive = useCallback((path) => {
        return location.pathname.startsWith(path);
    }, [location]);

    return (
        <div className="min-h-screen bg-gray-50">
            <main className={`${!isOwnerPage ? 'pb-16' : 'pb-safe'}`}>
                {children}
            </main>

            {!isOwnerPage && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t h-16 flex items-center px-4 z-50">
                    <div className="w-full flex justify-around items-center max-w-xl mx-auto">
                        {navigationItems.map(({ icon: Icon, label, path }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex flex-col items-center px-3 py-2 ${
                                    isActive(path) ? 'text-blue-500' : 'text-gray-500'
                                }`}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs mt-1">{label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
        </div>
    );
};

export default Layout;