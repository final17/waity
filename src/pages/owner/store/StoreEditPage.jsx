import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../../components/common/Header';
import StoreForm from '../../../components/store/StoreForm';
import { useOwnerStore } from '../../../hooks/useStore';

const StoreEditPage = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const { store, loading, error, fetchStoreDetail } = useOwnerStore();

    useEffect(() => {
        if (storeId) {
            fetchStoreDetail(storeId);
        }
    }, [storeId, fetchStoreDetail]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header title="매장 정보 수정" />
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header title="매장 정보 수정" />
                <div className="p-4 text-center text-red-500">
                    {error || '매장 정보를 찾을 수 없습니다.'}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="매장 정보 수정" />
            <div className="pt-14">
                <StoreForm initialData={store} />
            </div>
        </div>
    );
};

export default StoreEditPage;