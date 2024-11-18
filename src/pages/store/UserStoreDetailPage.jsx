import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Phone, Users, Share2 } from 'lucide-react';
import Header from '../../components/common/Header';
import MenuList from '../../components/menu/MenuList';
import ReviewList from '../../components/review/ReviewList';
import StoreBlogNewsModal from '../../components/store/StoreBlogNewsModal';
import NearbyStores from '../../components/store/NearbyStores';
import Rating from '../../components/common/Rating';
import { useUserStore } from '../../hooks/useStore';
import { useWaiting } from '../../hooks/useWaiting';
import { STORE_PLACEHOLDER } from '../../constants/images';
import WaitingButton from '../../components/waiting/WaitingButton';
import ReservationButton from '../../components/reservation/ReservationButton';
import { DateTime } from 'luxon'; // 시간 비교를 위해 Luxon 사용

const UserStoreDetailPage = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const { store, loading, error, fetchStoreDetail } = useUserStore();
    const { checkWaitingStatus } = useWaiting();
    const [isWaiting, setIsWaiting] = useState(false);
    const [isWithinOperatingHours, setIsWithinOperatingHours] = useState(false); // 운영 시간 여부 상태
    const [activeTab, setActiveTab] = useState('menu');
    const [showShareModal, setShowShareModal] = useState(false);
    const [initialized, setInitialized] = useState(false);

    // 매장 상세 정보와 웨이팅 상태 초기화
    useEffect(() => {
        if (storeId && !initialized) {
            fetchStoreDetail(storeId);
            setInitialized(true);
        }
    }, [storeId, initialized, fetchStoreDetail]);

    useEffect(() => {
        if (store?.openTime && store?.closeTime) {
            try {
                const now = DateTime.now().setZone('Asia/Seoul'); // 현재 한국 시간
                const openTime = DateTime.fromFormat(store.openTime, 'HH:mm:ss'); // 오픈 시간
                const closeTime = DateTime.fromFormat(store.closeTime, 'HH:mm:ss'); // 마감 시간
                const isOperating = now >= openTime && now <= closeTime;
                
                console.log(isOperating)
                console.log(openTime)
                console.log(closeTime)
                setIsWithinOperatingHours(isOperating);
                console.log(`waiting: ${isWithinOperatingHours}}`)
            } catch (error) {
                console.error('시간 비교 중 오류 발생:', error);
            }
        }
    }, [store]);
    

    // 웨이팅 상태 확인 및 초기화
    useEffect(() => {
        const fetchWaitingStatus = async () => {
            const status = await checkWaitingStatus(storeId);
            setIsWaiting(status);
        };

        if (storeId) {
            fetchWaitingStatus();
        }
    }, [storeId, checkWaitingStatus]);

    const handleWaitingUpdate = (newStatus) => {
        setIsWaiting(newStatus);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: store?.title,
                    text: store?.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
                setShowShareModal(true);
            }
        } else {
            setShowShareModal(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header title="매장 상세" />
                <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                </div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header title="매장 상세" />
                <div className="p-4 text-center text-red-500">
                    {error || '매장 정보를 찾을 수 없습니다.'}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title={store.title}
                rightButton={
                    <button
                        onClick={handleShare}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        <Share2 className="w-6 h-6 text-gray-700" />
                    </button>
                }
            />

            <div className="pt-14 pb-safe">
                {/* 매장 이미지 */}
                <div className="relative aspect-video bg-gray-200">
                    <img
                        src={store.image || STORE_PLACEHOLDER}
                        alt={store.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            console.log('Image load failed:', store.image);
                            e.target.src = STORE_PLACEHOLDER;
                        }}
                    />
                    {store.isDeleted && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="px-4 py-2 bg-red-500 text-white rounded-lg">
                                현재 운영하지 않는 매장입니다
                            </span>
                        </div>
                    )}
                </div>

                {/* 매장 정보 */}
                <div className="bg-white px-4 py-5">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{store.title}</h1>
                            {store.districtCategory && (
                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                                    {store.districtCategory.name}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center">
                            <Rating
                                value={store.rating}
                                readonly
                                size="sm"
                                showCount
                                count={store.reviewCount}
                            />
                        </div>
                    </div>

                    {store.description && (
                        <p className="text-gray-600 text-sm mb-4">{store.description}</p>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                            <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">영업 시간</p>
                                <p className="text-sm">
                                    {store.openTime} - {store.closeTime}
                                    {store.lastOrder && (
                                        <span className="text-red-500">
                                            <br />
                                            라스트오더 {store.lastOrder}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">테이블</p>
                                <p className="text-sm">
                                    총 {store.tableCount}개 / 예약 가능{' '}
                                    {store.reservationTableCount}개
                                    {store.turnover && (
                                        <span className="text-gray-500">
                                            <br />
                                            평균 {store.turnover} 소요
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">주소</p>
                                <p className="text-sm">{store.address}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">전화번호</p>
                                <a
                                    href={`tel:${store.phoneNumber}`}
                                    className="text-sm text-blue-500"
                                >
                                    {store.phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 웨이팅 및 예약 버튼 */}
                    {!store.isDeleted && (
                        <div className="mt-3 flex justify-between gap-2">
                            <div className="flex-1">
                                <WaitingButton
                                    storeId={storeId}
                                    isWaiting={isWaiting}
                                    onWaitingUpdate={handleWaitingUpdate}
                                    disabled={!isWithinOperatingHours} // 운영 시간에만 활성화
                                />
                            </div>
                            <div className="flex-1">
                                <ReservationButton store={store} />
                            </div>
                        </div>
                    )}
                </div>

                {/* 탭 메뉴 */}
                <div className="sticky top-14 bg-white border-b z-40">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'menu'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-500 border-transparent'
                            }`}
                        >
                            메뉴
                        </button>
                        <button
                            onClick={() => setActiveTab('review')}
                            className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'review'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-500 border-transparent'
                            }`}
                        >
                            리뷰
                        </button>
                        <button
                            onClick={() => setActiveTab('blog')}
                            className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'blog'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-500 border-transparent'
                            }`}
                        >
                            방문후기
                        </button>
                        <button
                            onClick={() => setActiveTab('nearby')}
                            className={`flex-1 py-4 text-sm font-medium border-b-2 ${
                                activeTab === 'nearby'
                                    ? 'text-blue-600 border-blue-600'
                                    : 'text-gray-500 border-transparent'
                            }`}
                        >
                            주변맛집
                        </button>
                    </div>
                </div>

                {/* 탭 컨텐츠 */}
                <div>
                    {activeTab === 'menu' ? (
                        <MenuList storeId={storeId} isOwner={false} />
                    ) : activeTab === 'review' ? (
                        <ReviewList storeId={storeId} />
                    ) : activeTab === 'blog' ? (
                        <StoreBlogNewsModal store={store} />
                    ) : (
                        <NearbyStores store={store} />
                    )}
                </div>
            </div>

            {/* 공유하기 모달 */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium mb-4">공유하기</h3>
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    setShowShareModal(false);
                                }}
                                className="flex-1 p-4 border rounded-lg hover:bg-gray-50"
                            >
                                링크 복사
                            </button>
                        </div>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserStoreDetailPage;
