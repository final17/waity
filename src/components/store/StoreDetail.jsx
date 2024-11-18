import { useState } from 'react';
import { Clock, MapPin, Phone, Users, Share2 } from 'lucide-react';
import Header from '../common/Header';
import MenuList from '../menu/MenuList';
import ReviewList from '../review/ReviewList';
import Rating from '../common/Rating';

const StoreDetail = ({ store, isOwner }) => {
    const [activeTab, setActiveTab] = useState('menu');
    const [showReservationModal, setShowReservationModal] = useState(false);

    if (!store) return null;

    const {
        title,
        image,
        rating,
        reviewCount,
        description,
        openTime,
        closeTime,
        lastOrder,
        turnover,
        address,
        phoneNumber,
        reservationTableCount,
        tableCount
    } = store;

    const formatTime = (time) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: title,
                text: description,
                url: window.location.href
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title={title}
                rightButton={
                    <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full">
                        <Share2 className="w-6 h-6 text-gray-700" />
                    </button>
                }
            />

            <div className="pb-safe">
                {/* 매장 이미지 */}
                <div className="relative aspect-video">
                    <img
                        src={image || '/placeholder-store.jpg'}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* 매장 정보 */}
                <div className="bg-white px-4 py-5">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        <div className="flex items-center">
                            <Rating value={rating} readonly size="sm" showCount count={reviewCount} />
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{description}</p>

                    <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                            <Clock className="w-5 h-5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">영업 시간</p>
                                <p className="text-sm">
                                    {formatTime(openTime)} - {formatTime(closeTime)}
                                    <br />
                                    <span className="text-red-500">
                                        라스트오더 {formatTime(lastOrder)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">테이블</p>
                                <p className="text-sm">
                                    총 {tableCount}개 / 예약 가능 {reservationTableCount}개
                                    <br />
                                    <span className="text-gray-500">
                                        평균 {turnover} 소요
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">주소</p>
                                <p className="text-sm">{address}</p>
                            </div>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">전화번호</p>
                                <a href={`tel:${phoneNumber}`} className="text-sm text-blue-500">
                                    {phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* 예약/웨이팅 버튼 */}
                    {!isOwner && (
                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowReservationModal(true)}
                                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium"
                            >
                                예약하기
                            </button>
                            <button className="flex-1 border border-blue-500 text-blue-500 py-3 rounded-lg font-medium">
                                웨이팅
                            </button>
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
                    </div>
                </div>

                {/* 탭 컨텐츠 */}
                <div>
                    {activeTab === 'menu' ? (
                        <MenuList storeId={store.id} isOwner={isOwner} />
                    ) : (
                        <ReviewList storeId={store.id} />
                    )}
                </div>
            </div>

            {/* 예약 모달 */}
            {showReservationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    {/* 예약 모달 컴포넌트 */}
                </div>
            )}
        </div>
    );
};

export default StoreDetail;