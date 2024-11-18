import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, Filter, X } from 'lucide-react';
import { useUserStore } from '../../hooks/useStore';
import { useDebounce } from '../../hooks/useDebounce';
import StoreCard from '../../components/store/StoreCard';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

const StoreSearchPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { searchStores, loading, error } = useUserStore();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [searchResults, setSearchResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [autocompleteResults, setAutocompleteResults] = useState([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        const savedSearches = localStorage.getItem('recentSearches');
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
        }

        if (searchParams.get('q')) {
            handleSearch(searchParams.get('q'));
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetchAPI(`${API_ENDPOINTS.categories}?type=DISTRICT`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                const mainCats = response.data.filter(cat => cat.depth === 1);
                const subCats = response.data.filter(cat => cat.depth === 2);
                setMainCategories(mainCats);
                setSubCategories(subCats);
            } catch (err) {
                console.error("카테고리 불러오기 에러:", err);
            }
        };
        fetchCategories();
    }, []);

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
                    setShowFilterMenu(false);  // 자동완성 결과가 표시되면 필터창 닫기
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

    const highlightMatch = (text) => {
        const regex = new RegExp(`(${debouncedSearchTerm})`, 'gi');
        return text.split(regex).map((part, index) => 
            part.toLowerCase() === debouncedSearchTerm.toLowerCase() ? (
                <span key={index} className="text-blue-600 font-bold">{part}</span>
            ) : (
                part
            )
        );
    };

    const handleSubCategoryClick = (subCategory) => {
        if (selectedFilters.some(filter => filter.code === subCategory.code)) {
            setSelectedFilters(selectedFilters.filter(filter => filter.code !== subCategory.code));
        } else {
            setSelectedFilters([...selectedFilters, subCategory]);
        }
    };

    const handleSelectAllSubcategories = (mainCategory) => {
        const relatedSubCategories = subCategories.filter(sub => sub.path.startsWith(mainCategory.path));
        
        if (relatedSubCategories.length === 0) {
            // 중분류가 없는 경우, 대분류만 선택
            if (selectedFilters.some(filter => filter.code === mainCategory.code)) {
                setSelectedFilters(selectedFilters.filter(filter => filter.code !== mainCategory.code));
            } else {
                setSelectedFilters([...selectedFilters, mainCategory]);
            }
        } else {
            // 모든 중분류 선택/해제
            const allSelected = relatedSubCategories.every(sub => selectedFilters.some(filter => filter.code === sub.code));
            if (allSelected) {
                // 이미 모두 선택된 경우: 해당 중분류를 필터에서 제거
                setSelectedFilters(selectedFilters.filter(filter => !relatedSubCategories.some(sub => sub.code === filter.code)));
            } else {
                // 선택되지 않은 중분류 추가
                const newSelections = relatedSubCategories.filter(sub => !selectedFilters.some(filter => filter.code === sub.code));
                setSelectedFilters([...selectedFilters, ...newSelections]);
            }
        }
    };

    const handleCategoryClick = (category) => {
        const relatedSubCategories = subCategories.filter(sub => sub.path.startsWith(category.path));

        if (relatedSubCategories.length === 0) {
            // 중분류가 없으면 대분류를 바로 필터에 추가 또는 제거
            if (selectedFilters.some(filter => filter.code === category.code)) {
                setSelectedFilters(selectedFilters.filter(filter => filter.code !== category.code));
            } else {
                setSelectedFilters([...selectedFilters, category]);
            }
        } else {
            // 중분류가 있는 경우, 대분류만 선택 상태로 설정
            setSelectedCategory(category === selectedCategory ? null : category);
        }
    };

    const removeFilter = (code) => {
        setSelectedFilters(selectedFilters.filter(filter => filter.code !== code));
    };

    const resetFilters = () => {
        setSelectedFilters([]);
    };

    const handleSearch = async (term) => {
        if (!term.trim()) return;

        try {
            const districtFilter = selectedFilters.map(filter => filter.code);
            const results = await searchStores(term, {
                districtCategories: districtFilter,
                cuisineCategories: []
            });
            setSearchResults(results);
            setShowAutocomplete(false); // 검색 시 자동완성 닫기
            setShowFilterMenu(false);   // 검색 시 필터창 닫기

            const newRecentSearches = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
            setRecentSearches(newRecentSearches);
            localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(searchTerm);
    };

    // 결과 보기 버튼 클릭 시 필터 검색 실행 및 필터 창 닫기
    const handleFilterSearch = () => {
        handleSearch(searchTerm);  // 현재 검색어로 검색 실행
        setShowFilterMenu(false);  // 필터 창 닫기
    };

    // 검색어 입력 시 필터 메뉴를 닫도록 설정
    const handleSearchInputChange = (e) => {
        setSearchTerm(e.target.value);
        if (showFilterMenu) {
            setShowFilterMenu(false);  // 필터 메뉴를 닫습니다.
        }
    };

    const handleAutocompleteClick = (store) => {
        navigate(`/stores/${store.id}`);
        setShowAutocomplete(false);
        setShowFilterMenu(false);  // 가게 클릭 시 필터창도 닫기
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 right-0 bg-white border-b z-50">
                <form onSubmit={handleSubmit} className="flex items-center p-2 gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={handleSearchInputChange}
                            placeholder="매장명 검색"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onFocus={() => { 
                                setShowAutocomplete(true); 
                                setShowFilterMenu(false);  // 검색어 입력 시 필터창 닫기
                            }}
                            autoFocus
                        />
                        {showAutocomplete && autocompleteResults.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-t-0 shadow-lg z-20">
                                <div className="p-2 flex justify-between items-center">
                                    <span className="text-gray-600 text-sm">자동완성 결과</span>
                                    <button onClick={() => setShowAutocomplete(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {autocompleteResults.map(store => (
                                    <div
                                        key={store.id}
                                        onClick={() => handleAutocompleteClick(store)}
                                        className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                    >
                                        <img src={store.image} alt={store.title} className="w-12 h-12 object-cover rounded mr-3" />
                                        <div>
                                            <p className="text-gray-800 font-medium">{highlightMatch(store.title)}</p>
                                            <p className="text-gray-500 text-sm">{store.address}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        검색
                    </button>
                    <button type="button" onClick={() => setShowFilterMenu(!showFilterMenu)} className="p-2 bg-gray-200 rounded-full">
                        <Filter className="w-5 h-5 text-gray-600" />
                    </button>
                </form>
            </div>

            <div className="pt-16 p-4">
                <div className="p-2 flex flex-wrap gap-2">
                    {selectedFilters.map((filter) => (
                        <span
                            key={filter.code}
                            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full cursor-pointer"
                            onClick={() => removeFilter(filter.code)}
                        >
                            {filter.name} ×
                        </span>
                    ))}
                </div>

                {showFilterMenu && (
                    <div className="absolute left-4 right-4 mt-2 bg-white border shadow-lg z-20 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-700">지역</h3>
                            <button onClick={resetFilters} className="text-sm text-gray-500 hover:text-gray-700">초기화</button>
                        </div>

                        <div className="flex gap-3 mt-4 flex-wrap">
                            {mainCategories.map((category) => (
                                <button
                                    key={category.code}
                                    className={`px-3 py-1 rounded-full ${selectedCategory === category ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        {selectedCategory && (
                            <div className="mt-4 p-4 bg-gray-200 rounded-lg flex flex-wrap gap-2">
                                {subCategories.some(subCat => subCat.path.startsWith(selectedCategory.path)) && (
                                    <button
                                        className={`bg-white text-gray-700 px-3 py-1 rounded-full hover:bg-blue-100 ${
                                            selectedFilters.some(filter => filter.code === selectedCategory.code) ? 'bg-blue-400 text-white' : ''
                                        }`}
                                        onClick={() => handleSelectAllSubcategories(selectedCategory)}
                                    >
                                        {selectedCategory.name} 전체
                                    </button>
                                )}
                                {subCategories
                                    .filter((subCat) => subCat.path.startsWith(selectedCategory.path))
                                    .map((subCategory) => (
                                        <button
                                            key={subCategory.code}
                                            className={`px-3 py-1 rounded-full cursor-pointer ${
                                                selectedFilters.some(filter => filter.code === subCategory.code)
                                                    ? 'bg-blue-400 text-white' // 중분류 선택 색상 변경
                                                    : 'bg-white text-gray-700 hover:bg-blue-100'
                                            }`}
                                            onClick={() => handleSubCategoryClick(subCategory)}
                                        >
                                            {subCategory.name}
                                        </button>
                                    ))}
                            </div>
                        )}

                        {/* 결과 보기 버튼 추가 */}
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={handleFilterSearch}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                결과 보기
                            </button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">{error}</div>
                ) : searchResults.length > 0 ? (
                    <div className="space-y-4">
                        <div className="text-sm text-gray-500 mb-2">
                            검색결과 {searchResults.length}개
                        </div>
                        {searchResults.map(store => (
                            <StoreCard
                                key={store.id}
                                store={store}
                                onClick={() => navigate(`/stores/${store.id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">검색 결과가 없습니다</div>
                )}
            </div>
        </div>
    );
};

export default StoreSearchPage;
