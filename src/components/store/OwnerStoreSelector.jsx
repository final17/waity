import React from 'react';

const OwnerStoreSelector = ({ stores = [], onSelect }) => {
    if (!Array.isArray(stores)) {
        console.error('stores is not an array:', stores);
        return null;
    }

    if (stores.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                등록된 매장이 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {stores.map(store => (
                <div
                    key={store.id}
                    onClick={() => onSelect(store)}
                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <h3 className="font-medium text-lg">{store.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{store.address}</p>
                    <div className="mt-2 text-xs text-gray-500">
                        영업시간: {store.openTime} - {store.closeTime}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OwnerStoreSelector;