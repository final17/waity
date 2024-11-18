import React from 'react';
import Header from '../../../components/common/Header';
import StoreForm from '../../../components/store/StoreForm';

const StoreCreate = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="매장 등록" />
            <div className="pt-14"> {/* 헤더 높이만큼 패딩 추가 */}
                <StoreForm />
            </div>
        </div>
    );
};

export default StoreCreate;