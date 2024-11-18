import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart } from 'lucide-react';
import Header from '../../../components/common/Header';
import { useUserStore } from '../../../hooks/useStore';
import StoreCard from '../../../components/store/StoreCard';

const UserStoreListPage = () => {
    const navigate = useNavigate();
    const { stores, loading, error, fetchStores } = useUserStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');

    // 지역 카테고리 목록
    const categories = [
        { code: '전체', name: '전체' },
        { code: 'GANGNAM', name: '강남' },
        { code: 'HONGDAE', name: '홍대' },
        { code: 'ITAEWON', name: '이태원' }
    ];

    useEffect(() => {
        fetchStores();
    }, [fetchStores]);

    const filterStores = (stores) => {
        if (!Array.isArray(stores)) return [];

        return stores.filter(store => {
            if (!store || store.isDeleted) return false;

            const matchesSearch = store.title?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === '전체' ||
                store.districtCategory?.code === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/stores/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="웨이티"
                rightButton={
                    <button
                        onClick={() => navigate('/stores/likes')}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <Heart className="w-6 h-6 text-gray-700" />
                    </button>
                }
            />

            <div className="pt-14">
                {/* 검색 영역 */}
                <div className="sticky top-14 bg-white border-b z-10">
                    <form onSubmit={handleSearch} className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="맛집을 검색해보세요"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </form>

                    {/* 지역 카테고리 */}
                    <div className="px-4 pb-3 overflow-x-auto hide-scrollbar">
                        <div className="flex space-x-2">
                            {categories.map(category => (
                                <button
                                    key={category.code}
                                    onClick={() => setSelectedCategory(category.code)}
                                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                                        selectedCategory === category.code
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 매장 목록 */}
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">
                            {error}
                        </div>
                    ) : filterStores(stores).length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            표시할 매장이 없습니다
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filterStores(stores).map(store => (
                                <StoreCard
                                    key={store.id}
                                    store={store}
                                    onClick={() => navigate(`/stores/${store.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserStoreListPage;