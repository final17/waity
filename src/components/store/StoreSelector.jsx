// src/components/store/StoreSelector.jsx
const StoreSelector = ({ stores, selectedStore, onSelect }) => (
    <div className="space-y-4">
        {stores.map(store => (
            <div
                key={store.id}
                onClick={() => onSelect(store)}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 ${
                    selectedStore?.id === store.id ? 'border-2 border-blue-500' : ''
                }`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg">{store.title}</h3>
                        <p className="text-sm text-gray-600">{store.address}</p>
                        <div className="mt-2 text-xs text-gray-500">
                            영업시간: {store.openTime} ~ {store.closeTime}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                            store.isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            {store.isOpen ? '영업중' : '영업종료'}
                        </span>
                        {store.lastOrder && (
                            <span className="mt-1 text-xs text-red-500">
                                라스트오더 {store.lastOrder}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default StoreSelector;