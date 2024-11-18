import React, { useState } from 'react';
import HourlyStatistics from './HourlyStatistics';
import DailyStatistics from './DailyStatistics';
import MonthlyStatistics from './MonthlyStatistics';

const WaitingStatistics = ({ storeId }) => {
    const [activeTab, setActiveTab] = useState('hourly'); // 'hourly', 'daily', 'monthly'

    return (
        <div>
            {/* 헤더 */}
            <header className="mb-6 text-center bg-gradient-to-r from-blue-500 to-purple-600 py-6 rounded-lg shadow-lg mt-10">
                <h1 className="text-4xl font-extrabold text-white tracking-wide">
                    <span role="img" aria-label="chart">📊</span> 웨이팅 통계
                </h1>
                <p className="text-white mt-2 text-sm">
                    시간대별, 일별, 월별 통계를 확인하세요.
                </p>
            </header>

            {/* 탭 버튼 */}
            <div className="flex justify-center space-x-4 mb-6">
                <button
                    className={`px-6 py-2 rounded-full text-sm font-bold transition ${
                        activeTab === 'hourly' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setActiveTab('hourly')}
                >
                    시간대별
                </button>
                <button
                    className={`px-6 py-2 rounded-full text-sm font-bold transition ${
                        activeTab === 'daily' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setActiveTab('daily')}
                >
                    일별
                </button>
                <button
                    className={`px-6 py-2 rounded-full text-sm font-bold transition ${
                        activeTab === 'monthly' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setActiveTab('monthly')}
                >
                    월별
                </button>
            </div>

            {/* 통계 내용 */}
            {activeTab === 'hourly' && <HourlyStatistics storeId={storeId} />}
            {activeTab === 'daily' && <DailyStatistics storeId={storeId} />}
            {activeTab === 'monthly' && <MonthlyStatistics storeId={storeId} />}
        </div>
    );
};

export default WaitingStatistics;
