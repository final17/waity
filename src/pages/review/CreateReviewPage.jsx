import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Star, X, Camera, AlertCircle } from 'lucide-react';
import Header from '../../components/common/Header';
import { useReview } from '../../hooks/useReview';
import { API_ENDPOINTS } from '../../constants/api';

const CreateReviewPage = () => {
    const { storeId, menuId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isWaiting = location.search.includes('type=WAIT');
    const { createReview, loading, error: reviewError } = useReview();
    const [storeInfo, setStoreInfo] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        rating: 5,
        images: []
    });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchStoreInfo = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_ENDPOINTS.store.detail(storeId)}`, {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('매장 정보를 불러오는데 실패했습니다.');
                }
                const data = await response.json();
                setStoreInfo(data);
            } catch (err) {
                console.error('Failed to fetch store info:', err);
                setError('매장 정보를 불러오는데 실패했습니다.');
            }
        };

        fetchStoreInfo();
    }, [storeId]);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (formData.images.length + files.length > 5) {
            setError('이미지는 최대 5장까지만 업로드할 수 있습니다.');
            return;
        }

        const newImages = [...formData.images];
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                setError('이미지 크기는 10MB를 초과할 수 없습니다.');
                return;
            }
            newImages.push(file);
        });

        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (!formData.title.trim()) {
                throw new Error('제목을 입력해주세요.');
            }
            if (!formData.content.trim()) {
                throw new Error('리뷰 내용을 입력해주세요.');
            }

            const isWaiting = new URLSearchParams(location.search).get('type') === 'WAIT';

            if (!isWaiting && !menuId) {
                throw new Error('메뉴 정보가 없습니다.');
            }

            await createReview(storeId, menuId, formData, isWaiting);
            navigate(-1);
        } catch (err) {
            setError(err.message || '리뷰 작성에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-50">
            <Header
                title="리뷰 작성하기"
                leftButton={
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-6 h-6 text-gray-700" />
                    </button>
                }
            />

            <div className="pt-14 pb-safe h-full overflow-auto">
                {storeInfo && (
                    <div className="p-4 bg-gray-50 border-b">
                        <h2 className="font-bold text-lg">{storeInfo.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{storeInfo.address}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-4 space-y-6">
                    <div className="flex flex-col items-center py-6 bg-gray-50 rounded-lg">
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                    className="p-1"
                                >
                                    <Star
                                        className={`w-8 h-8 ${
                                            star <= formData.rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            매장의 전반적인 만족도를 평가해주세요
                        </p>
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="제목을 입력해주세요"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            maxLength={50}
                        />
                        <p className="mt-1 text-xs text-gray-500 text-right">
                            {formData.title.length}/50
                        </p>
                    </div>

                    <div>
                       <textarea
                           placeholder="리뷰 내용을 작성해주세요&#13;&#10;- 직접 방문한 솔직한 리뷰를 남겨주세요&#13;&#10;- 매장의 분위기, 서비스 등 자세한 평가는 다른 고객에게 도움이 됩니다"
                           value={formData.content}
                           onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                           rows={6}
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                           maxLength={1000}
                       />
                        <p className="mt-1 text-xs text-gray-500 text-right">
                            {formData.content.length}/1000
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                            사진 첨부하기
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {formData.images.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200"
                                >
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newImages = [...formData.images];
                                            newImages.splice(index, 1);
                                            setFormData({ ...formData, images: newImages });
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ))}
                            {formData.images.length < 5 && (
                                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50">
                                    <Camera className="w-6 h-6 text-gray-400" />
                                    <span className="mt-1 text-xs text-gray-500">
                                       {formData.images.length}/5
                                   </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            JPG, PNG 파일 최대 5장까지 업로드 가능합니다
                        </p>
                    </div>

                    {(error || reviewError) && (
                        <div className="flex items-center p-4 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-sm text-red-600">{error || reviewError}</p>
                        </div>
                    )}

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                        <button
                            type="submit"
                            disabled={submitting || loading}
                            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting || loading ? '등록 중...' : '리뷰 등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateReviewPage;