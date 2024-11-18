import { useNavigate } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';

const MenuSection = ({ store, menus, loading }) => {
    const navigate = useNavigate();

    if (!store) {
        return (
            <div className="text-center py-8 text-gray-500">
                매장을 선택해주세요.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">메뉴 목록</h3>
                <button
                    onClick={() => navigate(`/stores/${store.id}/menus/create`)}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    메뉴 등록
                </button>
            </div>

            <div className="space-y-4">
                {menus?.length > 0 ? (
                    menus.map(menu => (
                        <div
                            key={menu.id}
                            className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4"
                        >
                            <div className="flex-1">
                                <h4 className="font-medium">{menu.name}</h4>
                                {menu.allergies && menu.allergies.length > 0 && (
                                    <p className="text-sm text-red-500">
                                        알레르기: {menu.allergies.join(', ')}
                                    </p>
                                )}
                                <p className="text-sm font-medium text-blue-600">
                                    {menu.price?.toLocaleString()}원
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/stores/${store.id}/menus/${menu.id}/edit`)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
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

export default MenuSection;