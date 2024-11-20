import { useState, useEffect } from 'react';
import { Plus, Settings } from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';
import MenuManageModal from './MenuManageModal';

import { fetchAPI, API_ENDPOINTS } from '../../constants/api';
import {useNavigate} from "react-router-dom";

const MenuCard = ({ menu, storeId, onDelete, onSubmit }) => {
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    const handleDelete = async () => {
        const confirmDelete = window.confirm(`${menu.name} 메뉴를 삭제하시겠습니까?`);
        if (confirmDelete) {
            await onDelete(menu.id);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            {menu.imageUrl && (
                <img
                    src={menu.imageUrl}
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
            <div className="flex gap-2">
                <button
                    onClick={openModal}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
                <button
                    onClick={handleDelete}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                    삭제
                </button>
            </div>
            <MenuManageModal
                isOpen={isModalOpen}
                onClose={closeModal}
                menu={menu}
                storeId={storeId}
                onSubmit={onSubmit}
            />
        </div>
    );
};

const MenuTabContent = ({ storeId }) => {
    const { menus = [], loading, error, fetchOwnerMenus } = useMenu();
    const navigate = useNavigate();
    useEffect(() => {
        fetchOwnerMenus(storeId);
    }, [storeId, fetchOwnerMenus]);

    const handleDeleteMenu = async (menuId) => {
        try {
            await fetchAPI(API_ENDPOINTS.menu.delete(storeId, menuId), {
                method: 'DELETE',
            });
            alert('메뉴가 성공적으로 삭제되었습니다.');
            await fetchOwnerMenus(storeId);
        } catch (error) {
            console.error('메뉴 삭제 오류:', error);
            alert('메뉴 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleUpdateMenu = async (menuId, updatedMenuData) => {
        try {
    
            await fetchAPI(API_ENDPOINTS.menu.update(storeId, menuId), {
                method: 'PUT',
                body: updatedMenuData,
            });
    
            alert('메뉴가 성공적으로 수정되었습니다.');
            await fetchOwnerMenus(storeId);
        } catch (error) {
            console.error('메뉴 수정 오류:', error);
            alert('메뉴 수정에 실패했습니다. 다시 시도해주세요.');
        }
    };

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
                    <Plus className="w-4 h-4"/>
                    메뉴 등록
                </button>
            </div>

            <div className="space-y-4">
                {menus.length > 0 ? (
                    menus.map((menu) => (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            storeId={storeId}
                            onDelete={handleDeleteMenu}
                            onSubmit={handleUpdateMenu}
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
