import React from 'react';
import Header from '../../components/common/Header';
import StoreForm from '../../components/store/StoreForm';

const StoreCreatePage = () => {
    return (
        <div className="relative bg-gray-50">
            <Header
                title="매장 등록"
                showBack={true}
            />
            <main className="relative z-0 pt-14">
                <StoreForm />
            </main>
        </div>
    );
};

export default StoreCreatePage;