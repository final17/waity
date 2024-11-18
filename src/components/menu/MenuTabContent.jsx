import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';

const MenuCard = ({ menu, storeId }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            {menu.image && (
                <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-16 h-16 object-cover rounded"
                />
            )}
            <div className="flex-1">
                <h4 className="font-medium">{menu.name}</h4>
                {menu.description && (
                    <p className="text-sm text-gray-500">{menu.description}</p>
                )}
                <p className="text-sm font-medium text-blue-600">
                    {menu.price?.toLocaleString()}원
                </p>
                {menu.allergies && menu.allergies.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">
                        알레르기: {menu.allergies.join(', ')}
                    </p>
                )}
            </div>
            <button
                onClick={() => navigate(`/stores/${storeId}/menus/${menu.id}/edit`)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <Settings className="w-5 h-5" />
            </button>
        </div>
    );
};

const MenuTabContent = ({ storeId }) => {
    const { menus = [], loading, error, fetchOwnerMenus } = useMenu();
    const navigate = useNavigate();

    useEffect(() => {
        let isSubscribed = true;

        const loadMenus = async () => {
            if (storeId && isSubscribed) {
                await fetchOwnerMenus(storeId);
            }
        };

        loadMenus();

        return () => {
            isSubscribed = false;
        };
    }, [storeId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => navigate(`/owner/stores/${storeId}/menus/create`)}  // 'owner/' 추가
                    className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    메뉴 등록
                </button>
            </div>

            <div className="space-y-4">
                {Array.isArray(menus) && menus.length > 0 ? (
                    menus.map(menu => (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            storeId={storeId}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        등록된 메뉴가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuTabContent;