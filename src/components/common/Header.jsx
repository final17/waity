import { Menu, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { SideMenu } from './SideMenu';


const Header = ({
                    title,
                    showBack = true,
                    showMenu = true,
                    rightButton = null,
                    transparent = false,
                    className = ''
                }) => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user } = useAuthContext();

    return (
        <div className="relative">
            <header className={`fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-40 ${
                transparent ? 'bg-transparent' : 'bg-white border-b'
            } ${className}`}>
                {/* 왼쪽: 뒤로가기 버튼 */}
                <div className="w-10">
                    {showBack && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 rounded-full hover:bg-gray-100/50"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-700" />
                        </button>
                    )}
                </div>

                {/* 중앙: 타이틀 */}
                <h1 className="font-medium text-lg flex-1 text-center truncate px-4">
                    {title}
                </h1>

                {/* 오른쪽: 메뉴 버튼 */}
                <div className="w-10 flex justify-end">
                    {rightButton || (showMenu && (
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 -mr-2 rounded-full hover:bg-gray-100/50"
                        >
                            <Menu className="w-6 h-6 text-gray-700" />
                        </button>
                    ))}
                </div>
            </header>

            {/* 사이드 메뉴 */}
            <SideMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </div>
    );
};

export default Header;