import { useState, useCallback } from 'react';
import { API_ENDPOINTS } from '../constants/api';

export const useMenu = () => {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOwnerMenus = useCallback(async (storeId) => {
        if (!storeId || loading) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('인증 토큰이 없습니다.');
            }

            const response = await fetch(API_ENDPOINTS.menu.ownerList(storeId), {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('메뉴 목록을 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            const menuList = data?.data || [];

            setMenus(prev => {
                const isSame = JSON.stringify(prev) === JSON.stringify(menuList);
                return isSame ? prev : menuList;
            });

        } catch (err) {
            console.error('Failed to fetch owner menus:', err);
            setError(err.message);
            setMenus([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const createMenu = useCallback(async (storeId, menuData) => {
        if (!storeId || loading) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            const formData = new FormData();

            // 필드별로 FormData에 개별 추가
            formData.append('name', menuData.name);
            formData.append('price', Number(menuData.price));

            if (menuData.allergyIds && menuData.allergyIds.length > 0) {
                menuData.allergyIds.forEach(id => formData.append('allergyIds', id));
            }

            if (menuData.images?.[0]?.file) {
                formData.append('image', menuData.images[0].file);
            }

            const response = await fetch(API_ENDPOINTS.menu.create(storeId), {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server Error Details:', errorData);
                throw new Error(errorData.message || '메뉴 생성에 실패했습니다.');
            }

            const data = await response.json();
            await fetchOwnerMenus(storeId);
            return data;

        } catch (err) {
            console.error('Failed to create menu:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchOwnerMenus]);



    const updateMenu = useCallback(async (storeId, menuId, menuData) => {
        if (!storeId || !menuId || loading) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(API_ENDPOINTS.menu.update(storeId, menuId), {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: menuData.name,
                    price: parseInt(menuData.price),
                    description: menuData.description || "",
                    allergyIds: menuData.allergyIds || []
                })
            });

            if (!response.ok) {
                throw new Error('메뉴 수정에 실패했습니다.');
            }

            const data = await response.json();
            await fetchOwnerMenus(storeId);
            return data;

        } catch (err) {
            console.error('Failed to update menu:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchOwnerMenus]);

    return {
        menus,
        loading,
        error,
        fetchOwnerMenus,
        createMenu,
        updateMenu
    };
};