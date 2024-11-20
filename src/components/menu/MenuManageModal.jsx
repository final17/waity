import { useState, useEffect } from 'react';
import ImageUpload from '../common/ImageUpload';
import { fetchAPI, API_ENDPOINTS } from '../../constants/api';

const MenuManageModal = ({ isOpen, onClose, menu, storeId, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: menu?.name || '',
        price: menu?.price || '',
        allergyIds: menu?.allergyIds || [],
        images: menu?.images || [],
    });

    const [allergies, setAllergies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // 알레르기 데이터 가져오기
    useEffect(() => {
        const fetchAllergies = async () => {
            try {
                const response = await fetchAPI(API_ENDPOINTS.allergy.list);
                setAllergies(response || []);
            } catch (error) {
                console.error('알레르기 데이터 가져오기 오류:', error);
            }
        };
        fetchAllergies();
    }, []);

    const handleAllergyChange = (allergyId) => {
        setFormData((prev) => {
            const newAllergyIds = prev.allergyIds.includes(allergyId)
                ? prev.allergyIds.filter((id) => id !== allergyId)
                : [...prev.allergyIds, allergyId];
            return { ...prev, allergyIds: newAllergyIds };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name?.trim()) {
            alert('메뉴 이름을 입력해주세요.');
            return;
        }

        const price = Number(formData.price);
        if (isNaN(price) || price <= 0) {
            alert('유효한 가격을 입력해주세요.');
            return;
        }

        const menuData = new FormData();
        menuData.append('id', menu.id); // DTO의 id 필드와 매핑
        menuData.append('name', formData.name.trim());
        menuData.append('price', price);

        formData.allergyIds.forEach((id) => {
            menuData.append('allergyIds', id);
        });

        if (formData.images[0]?.file) {
            // File 객체만 추가
            menuData.append('image', formData.images[0].file);
        } else {
            console.warn('No valid image file found in formData.images');
        }

        console.log('FormData entries:', Array.from(menuData.entries()));

        try {
            await onSubmit(menu.id, menuData);
            onClose();
        } catch (error) {
            console.error('메뉴 처리 중 오류 발생:', error);
            alert('메뉴 등록/수정에 실패했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-full">
                <h2 className="text-lg font-medium mb-4">메뉴 등록</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 이미지 업로드 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">메뉴 이미지</label>
                        <ImageUpload
                            images={formData.images}
                            onChange={(images) => setFormData({ ...formData, images })}
                            maxImages={1}
                            aspectRatio="4:3"
                        />
                    </div>

                    {/* 메뉴 이름 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">메뉴 이름</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="메뉴 이름을 입력하세요"
                            required
                        />
                    </div>

                    {/* 가격 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">가격</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="가격을 입력하세요"
                            required
                        />
                    </div>

                    {/* 알레르기 정보 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">알레르기 정보</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="알레르기 원료를 검색하세요"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                        <div className="max-h-48 overflow-y-auto mt-2">
                            {allergies
                                .filter((allergy) =>
                                    allergy.name.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((allergy) => (
                                    <label key={allergy.id} className="flex items-center p-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.allergyIds.includes(allergy.id)}
                                            onChange={() => handleAllergyChange(allergy.id)}
                                            className="h-4 w-4 mr-2"
                                        />
                                        {allergy.name}
                                    </label>
                                ))}
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuManageModal;
