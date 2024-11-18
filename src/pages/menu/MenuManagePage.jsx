import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import ImageUpload from '../../components/common/ImageUpload';
import { useMenu } from '../../hooks/useMenu';
import { useOwnerStore } from '../../hooks/useStore';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

const MenuManagePage = () => {
    const navigate = useNavigate();
    const { stores, fetchStores, loading: storeLoading, error: storeError } = useOwnerStore();
    const { loading: menuLoading, createMenu } = useMenu();

    const [initialized, setInitialized] = useState(false);
    const [selectedStore, setSelectedStore] = useState(null);
    const [allergies, setAllergies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        allergyIds: [],
        category: '메인',
        images: [],
        isAvailable: true
    });

    const categories = ['메인', '사이드', '음료', '디저트'];

    // 필터링된 알레르기 목록
    const filteredAllergies = allergies.filter(allergy =>
        allergy.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    // 알레르기 목록 가져오기
    useEffect(() => {
        const fetchAllergies = async () => {
            try {
                const response = await fetchAPI(API_ENDPOINTS.allergy.list);
                // 응답이 바로 배열로 오므로 response.data가 아닌 response를 사용
                console.log('Allergies loaded:', response); // 데이터 확인용
                setAllergies(response || []);
            } catch (err) {
                console.error('Failed to fetch allergies:', err);
            }
        };

        fetchAllergies();
    }, []);

    // 매장 목록 가져오기
    useEffect(() => {
        const initializePage = async () => {
            if (!initialized) {
                await fetchStores();
                setInitialized(true);
            }
        };
        initializePage();
    }, [initialized, fetchStores]);

    const handleStoreSelect = (store) => {
        setSelectedStore(store);
    };

    const handleAllergyChange = (allergyId) => {
        setFormData(prev => {
            const newAllergyIds = prev.allergyIds.includes(allergyId)
                ? prev.allergyIds.filter(id => id !== allergyId)
                : [...prev.allergyIds, allergyId];

            return {
                ...prev,
                allergyIds: newAllergyIds
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedStore) {
            alert('매장을 선택해주세요.');
            return;
        }

        // 데이터 유효성 검사
        if (!formData.name?.trim()) {
            alert('메뉴 이름을 입력해주세요.');
            return;
        }

        const price = Number(formData.price);
        if (isNaN(price) || price <= 0) {
            alert('유효한 가격을 입력해주세요.');
            return;
        }

        try {
            const menuData = {
                name: formData.name.trim(),
                price: price,
                allergyIds: formData.allergyIds,
                images: formData.images
            };

            await createMenu(selectedStore.id, menuData);
            // 경로 수정
            navigate('/owner/stores');  // 또는 정확한 경로로 수정
        } catch (error) {
            console.error('메뉴 처리 중 오류 발생:', error);
            alert(error.message);
        }
    };

    // 매장 선택 화면
    if (!selectedStore) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <Header title="매장 선택" />
                <div className="pt-14">
                    <h2 className="text-lg font-medium mb-4">메뉴를 등록할 매장을 선택해주세요</h2>
                    {storeLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : storeError ? (
                        <div className="p-4 text-center text-red-500">{storeError}</div>
                    ) : (
                        <div className="space-y-4">
                            {stores.map(store => (
                                <div
                                    key={store.id}
                                    onClick={() => handleStoreSelect(store)}
                                    className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
                                >
                                    <h3 className="font-medium">{store.title}</h3>
                                    <p className="text-sm text-gray-500">{store.address}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // 메뉴 등록 폼
    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="새 메뉴 추가" subtitle={selectedStore.title} />
            <div className="pt-14 p-4">
                <form onSubmit={handleSubmit} className="space-y-6 pb-24">
                    {/* 이미지 업로드 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            메뉴 이미지
                        </label>
                        <ImageUpload
                            images={formData.images}
                            onChange={(images) => setFormData({ ...formData, images })}
                            maxImages={1}
                            aspectRatio="4:3"
                        />
                    </div>

                    {/* 메뉴 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            메뉴 이름
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="메뉴 이름을 입력하세요"
                            required
                        />
                    </div>

                    {/* 가격 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            가격
                        </label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="가격을 입력하세요"
                            required
                        />
                    </div>

                    {/* 카테고리 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            카테고리
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 메뉴 설명 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            메뉴 설명
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="메뉴에 대한 설명을 입력하세요"
                            rows={3}
                        />
                    </div>

                    {/* 알레르기 정보 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            알레르기 정보
                        </label>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="알레르기 원료를 검색하세요 (예: 우유, 계란, 땅콩...)"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />

                            {searchTerm && (
                                <div className="border border-gray-300 rounded-lg">
                                    <div className="max-h-48 overflow-y-auto">
                                        {filteredAllergies.length > 0 ? (
                                            <div className="divide-y">
                                                {filteredAllergies.map(allergy => (
                                                    <label
                                                        key={allergy.id}
                                                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.allergyIds.includes(allergy.id)}
                                                            onChange={() => handleAllergyChange(allergy.id)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{allergy.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 text-center text-sm text-gray-500">
                                                검색 결과가 없습니다
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formData.allergyIds.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.allergyIds.map(id => {
                                        const allergy = allergies.find(a => a.id === id);
                                        if (!allergy) return null;
                                        return (
                                            <span
                                                key={id}
                                                className="inline-flex items-center px-2.5 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800"
                                            >
                                                {allergy.name}
                                                <button
                                                    type="button"
                                                    onClick={() => handleAllergyChange(id)}
                                                    className="ml-1.5 hover:text-blue-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 판매 여부 */}
                    <div className="flex items-center">
                        <label className="block text-sm font-medium text-gray-700 mr-4">
                            판매 가능 여부
                        </label>
                        <input
                            type="checkbox"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                            판매 중
                        </span>
                    </div>

                    {/* 저장 버튼 */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full py-3 px-4 border border-transparent text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={menuLoading || storeLoading}
                        >
                            {menuLoading ? '저장 중...' : '메뉴 추가'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuManagePage;