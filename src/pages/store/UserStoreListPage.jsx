import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Header from '../../components/common/Header';
import StoreCard from '../../components/store/StoreCard';
import { useUserStore } from '../../hooks/useStore';
import { useDebounce } from '../../hooks/useDebounce';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

const UserStoreListPage = () => {
    const navigate = useNavigate();
    const { stores, loading, error, fetchStores } = useUserStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [autocompleteResults, setAutocompleteResults] = useState([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (!initialized) {
            fetchStores();
            setInitialized(true);
        }
    }, [initialized]);

    useEffect(() => {
        const fetchAutocomplete = async () => {
            if (debouncedSearchTerm.trim()) {
                try {
                    const url = `${API_ENDPOINTS.search.autocomplete}?keyword=${encodeURIComponent(debouncedSearchTerm)}`;
                    const response = await fetchAPI(url, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' },
                    });

                    setAutocompleteResults(response.data.stores);
                    setShowAutocomplete(true);
                } catch (err) {
                    console.error("자동완성 API 에러:", err);
                }
            } else {
                setAutocompleteResults([]);
                setShowAutocomplete(false);
            }
        };

        fetchAutocomplete();
    }, [debouncedSearchTerm]);

    const filterStores = useCallback((storeList) => {
        if (!Array.isArray(storeList)) return [];
        return storeList.filter(store => {
            if (!store || store.isDeleted) return false;
            return store.title?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/stores/search?q=${encodeURIComponent(searchTerm)}`);
            setShowAutocomplete(false);  // 검색 시 자동완성 리스트 닫기
        }
    };

    const handleAutocompleteClick = (store) => {
        navigate(`/stores/${store.id}`);
        setShowAutocomplete(false); // 클릭 시 자동완성 리스트 닫기
    };

    // 일치하는 부분을 하이라이트하는 함수
    const highlightMatch = (text, highlight) => {
        if (!highlight.trim()) return text;
        const regex = new RegExp(`(${highlight})`, 'gi'); // 대소문자 무시
        const parts = text.split(regex);
        return parts.map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
                <span key={index} className="text-blue-500 font-semibold">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="웨이티" showBack={false} showMenu={true} />

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
                                onFocus={() => setShowAutocomplete(true)} // 입력 시 자동완성 리스트 표시
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </form>

                    {/* 자동완성 리스트 */}
                    {showAutocomplete && autocompleteResults.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white border border-t-0 shadow-lg z-20">
                            {autocompleteResults.map(store => (
                                <div
                                    key={store.id}
                                    onClick={() => handleAutocompleteClick(store)}
                                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                >
                                    <img src={store.image} alt={store.title} className="w-12 h-12 object-cover rounded mr-3" />
                                    <div>
                                        {/* 하이라이트 적용 */}
                                        <p className="text-gray-800 font-medium">
                                            {highlightMatch(store.title, searchTerm)}
                                        </p>
                                        <p className="text-gray-500 text-sm">{store.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 매장 목록 */}
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">{error}</div>
                    ) : filterStores(stores).length === 0 ? (
                        <div className="text-center py-20 text-gray-500">표시할 매장이 없습니다</div>
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