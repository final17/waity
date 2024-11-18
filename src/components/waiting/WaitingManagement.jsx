import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

const WaitingManagement = ({ storeId, onStatsUpdate }) => {
    const [waitingList, setWaitingList] = useState({ totalWaitingNumber: 0, userIds: [] });
    const [loading, setLoading] = useState(true);
    const [cutline, setCutline] = useState('');
    const { user } = useAuthContext();

    const fetchWaitingList = async () => {
        if (!storeId) return;

        try {
            const response = await fetchAPI(API_ENDPOINTS.waiting.ownerList(storeId));
            setWaitingList(response.data);
            onStatsUpdate?.(response.data.totalWaitingNumber);
        } catch (error) {
            console.error('Failed to fetch waiting list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePollFirst = async () => {
        try {
            await fetchAPI(API_ENDPOINTS.waiting.poll(storeId), {
                method: 'POST'
            });
            fetchWaitingList();
        } catch (error) {
            console.error('Failed to poll first user:', error);
            alert('처리에 실패했습니다.');
        }
    };

    const handleClearFromRank = async () => {
        if (!window.confirm(`웨이팅을 모두 마감하시겠습니까?`)) return;

        try {
            await fetchAPI(`${API_ENDPOINTS.waiting.clear(storeId)}?cutline=${0}`, {
                method: 'DELETE'
            });
            fetchWaitingList();
            alert('마감 처리되었습니다.');
            setCutline('');
        } catch (error) {
            console.error('Failed to clear waiting list:', error);
            alert('마감 처리에 실패했습니다.');
        }
    };

    useEffect(() => {
        if (storeId) {
            fetchWaitingList();
            const interval = setInterval(fetchWaitingList, 10000);
            return () => clearInterval(interval);
        }
    }, [storeId]);

    if (!storeId) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-4 max-w-2xl mx-auto">
            {/* 웨이팅 통계 */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="text-lg font-medium mb-2">현재 웨이팅</h2>
                <p className="text-2xl font-bold text-blue-600">
                    {waitingList.totalWaitingNumber || 0}팀
                </p>
            </div>

            {/* 웨이팅 리스트 */}
            <div className="space-y-4">
                {waitingList.userIds?.length > 0 ? (
                    waitingList.userIds.map((waiting, index) => (
                        <div key={waiting.userId} className="bg-white rounded-lg shadow p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-lg font-medium">
                                        {waiting.rank}번
                                    </span>
                                    <span className="ml-2 text-gray-500">
                                        #{waiting.userId}
                                    </span>
                                </div>
                                {index === 0 && (
                                    <button
                                        onClick={handlePollFirst}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        입장
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        대기 중인 손님이 없습니다.
                    </div>
                )}
            </div>

            {/* 마감 처리 */}
            {waitingList.totalWaitingNumber > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-medium mb-4">웨이팅 마감</h3>
                    <div className="flex gap-2">
          
                        <button
                            onClick={() => handleClearFromRank()}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            마감처리
                        </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        모든 웨이팅이 마감됩니다.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WaitingManagement;