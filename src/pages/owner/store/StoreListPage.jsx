import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';
import Header from '../../../components/common/Header';
import { useOwnerStore } from '../../../hooks/useStore';

const StoreListPage = () => {
    const navigate = useNavigate();
    const { stores, loading, error, fetchStores } = useOwnerStore();
    const [selectedTab, setSelectedTab] = useState('all');  // all, active, deleted

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const filteredStores = stores.filter(store => {
        if (selectedTab === 'active') return !store.isDeleted;
        if (selectedTab === 'deleted') return store.isDeleted;
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header title="내 매장 관리" />
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="내 매장 관리"
                rightButton={
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/owner/stores/create')}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <Plus className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                            onClick={() => navigate('/owner/settings')}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <Settings className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                }
            />

            <div className="p-4">
                {/* 상태 필터 */}
                <div className="flex gap-2 mb-4">
                    {[
                        { id: 'all', label: '전체' },
                        { id: 'active', label: '운영중' },
                        { id: 'deleted', label: '운영중단' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedTab(tab.id)}
                            className={`px-4 py-2 rounded-full text-sm ${
                                selectedTab === tab.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filteredStores.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">등록된 매장이 없습니다</p>
                        <button
                            onClick={() => navigate('/owner/stores/create')}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            매장 등록하기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredStores.map(store => (
                            <div
                                key={store.id}
                                onClick={() => navigate(`/owner/stores/${store.id}`)}
                                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 
                                    ${store.isDeleted ? 'opacity-50' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-lg">{store.title}</h3>
                                            {store.isDeleted && (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                                                    운영중단
                                                </span>
                                            )}
                                        </div>
                                        {store.districtCategory && (
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                                                {store.districtCategory.name}
                                            </span>
                                        )}
                                        <p className="text-sm text-gray-500 mt-2">{store.address}</p>
                                        <div className="mt-2 text-xs text-gray-500">
                                            영업시간: {store.openTime} - {store.closeTime}
                                            <br />
                                            {store.lastOrder && `라스트오더: ${store.lastOrder}`}
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <div className="text-right text-gray-500">
                                            조회 {store.view}
                                        </div>
                                        <div className="text-right text-gray-500">
                                            리뷰 {store.reviewCount}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreListPage;