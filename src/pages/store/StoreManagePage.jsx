import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import Header from '../../components/common/Header';
import StoreSelector from '../../components/store/StoreSelector';
import MenuTabContent from '../../components/menu/MenuTabContent';
import WaitingManagement from '../../components/waiting/WaitingManagement';
import { useOwnerStore } from '../../hooks/useStore';
import { useWaiting } from '../../hooks/useWaiting';
import ReservationOwnerList from "../../components/reservation/ReservationOwnerList";
import Dashboard from "../../components/dashboard/Dashboard";

const StoreManagePage = () => {
    const navigate = useNavigate();
    const { stores, fetchStores, loading: storeLoading, error: storeError } = useOwnerStore();
    const { getWaitingList } = useWaiting();

    const [selectedTab, setSelectedTab] = useState('overview');
    const [selectedStore, setSelectedStore] = useState(null);
    const [todayStats, setTodayStats] = useState({
        reservations: 0,
        waiting: 0,
        completed: 0,
        canceled: 0
    });

    useEffect(() => {
        fetchStores();
    }, []);

    // 웨이팅 통계 조회
    // useEffect(() => {
    //     if (!selectedStore) return;
    //
    //     const fetchWaitingStats = async () => {
    //         try {
    //             const waitingData = await getWaitingList(selectedStore.id);
    //             setTodayStats(prev => ({
    //                 ...prev,
    //                 waiting: waitingData.totalWaitingNumber || 0
    //             }));
    //         } catch (error) {
    //             console.error('Failed to fetch waiting stats:', error);
    //         }
    //     };
    //
    //     fetchWaitingStats();
    //     const interval = setInterval(fetchWaitingStats, 10000);
    //     return () => clearInterval(interval);
    // }, [selectedStore, getWaitingList]);

    const tabs = [
        { id: 'overview', label: '개요' },
        { id: 'reservations', label: '예약' },
        { id: 'waiting', label: '웨이팅' },
        { id: 'menu', label: '메뉴' }
    ];

    // 매장이 선택되지 않았을 때의 화면
    if (!selectedStore) {
        return (
            <div className="relative bg-gray-50">
                <Header
                    title="매장 관리"
                    rightButton={
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <Settings className="w-6 h-6 text-gray-700" />
                        </button>
                    }
                />
                <div className="relative z-0 pt-14 px-4">
                    <StoreSelector
                        stores={stores}
                        selectedStore={selectedStore}
                        onSelect={setSelectedStore}
                        loading={storeLoading}
                        error={storeError}
                    />
                </div>
            </div>
        );
    } else {


        return (
            <div className="relative bg-gray-50">
                <Header
                    title="매장 관리"
                    rightButton={
                        <button
                            onClick={() => navigate('/settings')}
                            className="p-2 rounded-full hover:bg-gray-100"
                        >
                            <Settings className="w-6 h-6 text-gray-700" />
                        </button>
                    }
                />
                <div className="relative z-0 pt-14">
                    {/* 탭 메뉴 */}
                    <div className="bg-white border-b sticky top-14 z-10">
                        <div className="flex">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                                        selectedTab === tab.id
                                            ? 'text-blue-600 border-blue-600'
                                            : 'text-gray-500 border-transparent'
                                    }`}
                                >
                                    {tab.label}
                                    {tab.id === 'waiting' && todayStats.waiting > 0 && (
                                        <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                                        {todayStats.waiting}
                                    </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 탭 콘텐츠 */}
                    <div className="relative z-0">
                        {selectedTab === 'menu' && (
                            <MenuTabContent
                                storeId={selectedStore.id}
                                key={selectedStore.id}
                            />
                        )}
                        {selectedTab === 'waiting' && (
                            <WaitingManagement
                                storeId={selectedStore.id}
                                onStatsUpdate={(total) => setTodayStats(prev => ({
                                    ...prev,
                                    waiting: total
                                }))}
                            />
                        )}
                        {selectedTab === 'overview' && (
                            <Dashboard
                                storeId={selectedStore.id}
                            />
                        )}
                        {selectedTab === 'reservations' && (
                            <ReservationOwnerList
                                storeId={selectedStore.id}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
};

export default StoreManagePage;