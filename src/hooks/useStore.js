// hooks/useStore.js
import { useState, useCallback } from 'react';
import { API_ENDPOINTS, fetchAPI } from '../constants/api';
import { STORE_PLACEHOLDER } from '../constants/images';


const isStoreOpen = (openTime, closeTime) => {
    if (!openTime || !closeTime) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    return currentTime >= openMinutes && currentTime <= closeMinutes;
};

const convertImageUrl = (imageUrl) => {
    if (!imageUrl) return STORE_PLACEHOLDER;

    // S3 URL을 CloudFront URL로 변환
    if (imageUrl.includes('final17-bucket.s3')) {
        const key = imageUrl.split('.com/')[1];
        return `https://d1bmwiwkiumqh6.cloudfront.net/${key}`;
    }

    return imageUrl;
};

const processStoreData = (store) => ({
    ...store,
    rating: store.rating || 0,
    reviewCount: store.reviewCount || 0,
    isOpen: isStoreOpen(store.openTime, store.closeTime),
    image: convertImageUrl(store.image),  // 이미지 URL 변환 로직 추가
    user: store.userOneResponseDto,
    districtCategory: store.districtCategory || null
});

export const useOwnerStore = () => {
    const [stores, setStores] = useState([]);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.store.myStore);
            const storeList = response.data?.content || [];
            setStores(storeList.map(processStoreData));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreDetail = async (storeId) => {
        if (!storeId) return;

        try {
            setLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.store.detail(storeId));
            setStore(processStoreData(response.data));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createStore = async (storeData) => {
        try {
            setLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.store.create, {
                method: 'POST',
                body: JSON.stringify(storeData)
            });
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateStore = async (storeId, storeData) => {
        if (!storeId) return;

        try {
            setLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.store.update(storeId), {
                method: 'PUT',
                body: JSON.stringify(storeData)
            });
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteStore = async (storeId) => {
        if (!storeId) return;

        try {
            setLoading(true);
            await fetchAPI(API_ENDPOINTS.store.delete(storeId), {
                method: 'DELETE'
            });
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        stores,
        store,
        loading,
        error,
        fetchStores,
        fetchStoreDetail,
        createStore,
        updateStore,
        deleteStore,
        setStore
    };
};

export const useUserStore = () => {
    const [stores, setStores] = useState([]);
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchStores = async (keyword, filters = {}) => {
        try {
            console.log(API_ENDPOINTS.search.search)
            // POST 요청으로 keyword와 filters를 RequestBody로 전송
            const response = await fetchAPI(API_ENDPOINTS.search.search, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    keyword,
                    filters: {
                        districtCategories: filters.districtCategories || [],
                        cuisineCategories: filters.cuisineCategories || []
                    },
                    size: 10 // 검색 결과 수 제한
                })
            });
            return response.data.stores;
        } catch (error) {
            console.error('Search API Error:', error);
            throw error;
        }
    };

    const fetchStores = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.store.list);
            const storeList = response.data?.content || [];
            setStores(storeList.map(store => ({
                ...processStoreData(store),
                distance: store.distance || null
            })));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [loading]); // loading을 dependency로 추가

    const fetchStoreDetail = async (storeId) => {
        if (!storeId) return;

        try {
            setLoading(true);
            const response = await fetchAPI(API_ENDPOINTS.store.detail(storeId));
            setStore(processStoreData(response.data));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        stores,
        store,
        loading,
        error,
        searchStores,
        fetchStores,
        fetchStoreDetail,
        setStore
    };
};
