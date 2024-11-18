import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';

const StoreForm = ({ initialData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        districtCategoryCode: initialData?.districtCategoryCode || '',
        description: initialData?.description || '',
        openTime: initialData?.openTime || '09:00',
        lastOrder: initialData?.lastOrder || '20:00',
        closeTime: initialData?.closeTime || '21:00',
        turnover: initialData?.turnover || '01:00',
        reservationTableCount: initialData?.reservationTableCount || 3,
        tableCount: initialData?.tableCount || 10,
        phoneNumber: initialData?.phoneNumber || '',
        address: initialData?.address || '',
        deposit: initialData?.deposit || 10000,
        latitude: initialData?.latitude || null,
        longitude: initialData?.longitude || null
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialData?.image || null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // 카테고리 관련 상태
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedMainCategory, setSelectedMainCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetchAPI(`${API_ENDPOINTS.categories}?type=DISTRICT`, { method: 'GET' });
                const mainCats = response.data.filter(cat => cat.depth === 1);
                const subCats = response.data.filter(cat => cat.depth === 2);
                
                // 한글 가나다 순으로 정렬
                subCats.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    
                setMainCategories(mainCats);
                setSubCategories(subCats);

                // 기본으로 첫 번째 대분류를 선택하도록 설정
                if (mainCats.length > 0) {
                    const firstMainCat = mainCats[0];
                    setSelectedMainCategory(firstMainCat);

                    // 중분류가 없는 경우 대분류 코드로 설정
                    const hasSubCategories = subCats.some(sub => sub.path.startsWith(firstMainCat.path));
                    setFormData(prev => ({
                        ...prev,
                        districtCategoryCode: hasSubCategories ? '' : firstMainCat.code
                    }));
                }
            } catch (err) {
                console.error("카테고리 불러오기 에러:", err);
            }
        };
        fetchCategories();
    }, []);

    const handleMainCategoryChange = (e) => {
        const mainCategoryCode = e.target.value;
        const mainCategory = mainCategories.find(cat => cat.code === mainCategoryCode);

        setSelectedMainCategory(mainCategory);
        setSelectedSubCategory(null); // 중분류 초기화

        // 중분류가 없는 경우 바로 대분류 코드 설정
        const relatedSubCategories = subCategories.filter(sub => sub.path.startsWith(mainCategory.path));
        if (relatedSubCategories.length === 0) {
            setFormData(prev => ({ ...prev, districtCategoryCode: mainCategoryCode }));
        } else {
            setFormData(prev => ({ ...prev, districtCategoryCode: '' })); // 초기화
        }
    };

    const handleSubCategoryChange = (e) => {
        const subCategoryCode = e.target.value;
        const subCategory = subCategories.find(sub => sub.code === subCategoryCode);

        setSelectedSubCategory(subCategory);
        setFormData(prev => ({ ...prev, districtCategoryCode: subCategoryCode }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddressComplete = async (data) => {
        const { address } = data;

        // Promise로 감싸서 비동기 처리
        const getCoords = () => {
            return new Promise((resolve) => {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.addressSearch(address, (result, status) => {
                    if (status === window.kakao.maps.services.Status.OK) {
                        resolve(result[0]);
                    }
                });
            });
        };

        try {
            const coords = await getCoords();
            setFormData(prev => ({
                ...prev,
                address: address,
                latitude: parseFloat(coords.y),
                longitude: parseFloat(coords.x)
            }));
            setShowAddressModal(false);
        } catch (error) {
            console.error('주소 좌표 변환 실패:', error);
        }
    };

    const handleSubmit = async (e) => {
        console.log("sub")
        e.preventDefault();
        if (!validateForm()) return;

        // 중분류가 없는 경우 대분류의 code를 설정
        if (!selectedSubCategory) {
            setFormData(prev => ({ ...prev, districtCategoryCode: selectedMainCategory.code }));
        }

        setLoading(true);

        try {
            const formDataToSend = new FormData();
            const storeRequestDto = {
                title: formData.title,
                districtCategoryCode: formData.districtCategoryCode || "",
                description: formData.description,
                openTime: formData.openTime,
                lastOrder: formData.lastOrder,
                closeTime: formData.closeTime,
                turnover: formData.turnover,
                reservationTableCount: parseInt(formData.reservationTableCount),
                tableCount: parseInt(formData.tableCount),
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                deposit: parseInt(formData.deposit),
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude)
            };

            const storeRequestDtoBlob = new Blob(
                [JSON.stringify(storeRequestDto)],
                { type: 'application/json' }
            );

            formDataToSend.append('storeRequestDto', storeRequestDtoBlob);

            if (selectedImage) {
                formDataToSend.append('image', selectedImage);
            }

            const response = await fetchAPI(
                initialData ? API_ENDPOINTS.store.update(initialData.id) : API_ENDPOINTS.store.create,
                {
                    method: initialData ? 'PUT' : 'POST',
                    body: formDataToSend
                }
            );
            
            if (response.status === 200) {
                console.log("!!")
                alert('매장이 등록되었습니다.');
                navigate('/');
            }
        } catch (error) {
            console.error('Store submission error:', error);
            alert('매장 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            alert('매장명을 입력해주세요.');
            return false;
        }
        if (!formData.address || !formData.latitude || !formData.longitude) {
            alert('주소를 선택해주세요.');
            return false;
        }
        if (formData.tableCount < formData.reservationTableCount) {
            alert('예약 가능 테이블 수는 총 테이블 수를 초과할 수 없습니다.');
            return false;
        }
        if (!formData.districtCategoryCode) {
            alert('카테고리를 선택해주세요.');
            return false;
        }
        return true;
    };

    return (
        <div className="relative">
            <div className="max-w-2xl mx-auto p-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 이미지 업로드 */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">매장 이미지</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="cursor-pointer">
                                            <span className="text-blue-600 hover:text-blue-500">이미지 업로드</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (최대 10MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 기본 정보 */}
                    <div className="bg-white rounded-lg shadow p-4 space-y-4">
                        <h3 className="text-lg font-medium">기본 정보</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">매장명</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* 지역 카테고리 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">지역 카테고리 선택</label>
                            <select
                                value={selectedMainCategory?.code || ''}
                                onChange={handleMainCategoryChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                {mainCategories.map((main) => (
                                    <option key={main.code} value={main.code}>{main.name}</option>
                                ))}
                            </select>

                            {/* 중분류 선택: 중분류가 있는 대분류만 표시 */}
                            {selectedMainCategory && subCategories.some(sub => sub.path.startsWith(selectedMainCategory.path)) && (
                                <select
                                    value={selectedSubCategory?.code || ''}
                                    onChange={handleSubCategoryChange}
                                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">중분류 선택</option>
                                    {subCategories
                                        .filter((sub) => sub.path.startsWith(selectedMainCategory.path))
                                        .map((sub) => (
                                            <option key={sub.code} value={sub.code}>{sub.name}</option>
                                        ))}
                                </select>
                            )}
                        </div>

                        {/* 선택된 카테고리 표시 */}
                        <p className="text-sm text-gray-500 mt-2">
                            선택된 경로: {selectedSubCategory ? selectedSubCategory.path : selectedMainCategory?.path}
                        </p>
                    </div>

                    {/* 영업 정보 */}
                    <div className="bg-white rounded-lg shadow p-4 space-y-4">
                        <h3 className="text-lg font-medium">영업 정보</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">오픈 시간</label>
                                <input
                                    type="time"
                                    value={formData.openTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, openTime: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">마감 시간</label>
                                <input
                                    type="time"
                                    value={formData.closeTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, closeTime: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">라스트 오더</label>
                                <input
                                    type="time"
                                    value={formData.lastOrder}
                                    onChange={(e) => setFormData(prev => ({ ...prev, lastOrder: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">평균 식사 시간</label>
                                <input
                                    type="time"
                                    value={formData.turnover}
                                    onChange={(e) => setFormData(prev => ({ ...prev, turnover: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">총 테이블 수</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={formData.tableCount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tableCount: parseInt(e.target.value) }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">예약 가능 테이블</label>
                                <input
                                    type="number"
                                    min={0}
                                    max={formData.tableCount}
                                    value={formData.reservationTableCount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reservationTableCount: parseInt(e.target.value) }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">예약금</label>
                            <input
                                type="number"
                                min={0}
                                step={1000}
                                value={formData.deposit}
                                onChange={(e) => setFormData(prev => ({ ...prev, deposit: parseInt(e.target.value) }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {/* 연락처 정보 */}
                    <div className="bg-white rounded-lg shadow p-4 space-y-4">
                        <h3 className="text-lg font-medium">연락처 정보</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">전화번호</label>
                            <input
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">주소</label>
                            <div className="mt-1 flex gap-2">
                                <input
                                    type="text"
                                    value={formData.address}
                                    readOnly
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                                    placeholder="주소 찾기를 클릭하세요"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 whitespace-nowrap"
                                >
                                    주소 찾기
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 제출 버튼 */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-white rounded-md ${
                                loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                    처리중...
                                </div>
                            ) : initialData ? '수정하기' : '등록하기'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 주소 검색 모달 */}
            {showAddressModal && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddressModal(false)} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg">
                        <div className="p-4">
                            <DaumPostcode
                                onComplete={handleAddressComplete}
                                autoClose
                                style={{ height: 400 }}
                            />
                        </div>
                        <div className="p-4 border-t flex justify-end">
                            <button
                                onClick={() => setShowAddressModal(false)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoreForm;
