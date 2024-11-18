import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MenuCard from './MenuCard';
import { PLACEHOLDER_IMAGE } from '../../constants/images';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';
import { auth } from '../../lib/auth';

const MenuList = ({ storeId, isOwner = false }) => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchMenus = async () => {
            if (!storeId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const endpoint = isOwner
                    ? API_ENDPOINTS.menu.ownerList(storeId)
                    : API_ENDPOINTS.menu.list(storeId);

                const response = await fetchAPI(endpoint);
                const menuData = response.data || [];
                setMenus(menuData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch menus:', err);
                setError(err.message || '메뉴를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchMenus();
    }, [storeId, isOwner]);

    const handleMenuClick = (menu) => {
        const userRole = auth.getUserRole();
        if (userRole === "ROLE_USER") {
            setQuantity(1);
            setSelectedMenu(menu);
        }
    };

    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    const addToCart = async (menu, quantity) => {
        try {
            setLoading(true);

            const data = {
                "menus": [
                    {
                        "menuId": menu.id,
                        "menuCnt": quantity
                    }
                ]
            };

            const url = API_ENDPOINTS.cart.add(storeId);
            const response = await fetchAPI(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.getAccessToken()
                },
                body: JSON.stringify(data)
            });

            if (response.status === 200) {
                console.log(response.message);
                setSelectedMenu(null);
                setError(null);
            }
        } catch (err) {
            console.error('Failed to add to cart:', err);
            setError(err.message || '장바구니에 추가하는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="pb-safe">
            <div className="divide-y divide-gray-200">
                {menus.length > 0 ? (
                    menus.map((menu) => (
                        <div key={menu.id} onClick={() => handleMenuClick(menu)}>
                            <MenuCard
                                menu={menu}
                                isOwner={isOwner}
                                onEdit={() => {}}
                                onDelete={() => {}}
                            />
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        등록된 메뉴가 없습니다.
                    </div>
                )}
            </div>

            {selectedMenu && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">{selectedMenu.name}</h2>
                            <button
                                onClick={() => setSelectedMenu(null)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-6">
                                <img
                                    src={selectedMenu.imageUrl || PLACEHOLDER_IMAGE}
                                    alt={selectedMenu.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                />
                            </div>
                            <div className="space-y-4">
                                <p className="text-2xl font-bold text-blue-600">
                                    {Number(selectedMenu.price).toLocaleString()}원
                                </p>
                                {selectedMenu.description && (
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-1">설명</h3>
                                        <p className="text-gray-600">{selectedMenu.description}</p>
                                    </div>
                                )}
                                {selectedMenu.allergies && (
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-1">알레르기 정보</h3>
                                        <p className="text-red-500">{selectedMenu.allergies.join(', ')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t">
                            <div className="flex items-center justify-between mb-4">
                                <label className="font-medium text-gray-900">개수:</label>
                                <div className="flex items-center">
                                    <button
                                        onClick={decreaseQuantity}
                                        className="p-2 bg-gray-200 rounded-l-md hover:bg-gray-300"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        readOnly
                                        className="w-16 p-2 border-t border-b border-gray-300 text-center"
                                    />
                                    <button
                                        onClick={increaseQuantity}
                                        className="p-2 bg-gray-200 rounded-r-md hover:bg-gray-300"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={() => addToCart(selectedMenu, quantity)}
                                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                장바구니에 담기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuList;