import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard } from 'lucide-react';
import Header from '../../components/common/Header';
import { API_ENDPOINTS } from '../../constants/api';
import { useAuthContext } from '../../contexts/AuthContext';

const ReservationType = {
    WAIT: 'WAIT',
    RESERVATION: 'RESERVATION'
};

const ReservationStatus = {
    RESERVATION: 'RESERVATION',
    CANCEL: 'CANCEL',
    APPLY: 'APPLY',
    COMPLETE: 'COMPLETE'
};

const PaymentStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

const ReservationHistoryPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthContext();
    const [activeType, setActiveType] = useState(ReservationType.RESERVATION);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [menuList, setMenuList] = useState([]);
    const [showMenuModal, setShowMenuModal] = useState(false);

    useEffect(() => {
        console.log('Is Authenticated:', isAuthenticated);
        console.log('User:', user);
        console.log('Token:', localStorage.getItem('accessToken'));

        if (isAuthenticated) {
            fetchReservations();
        }
    }, [activeType, isAuthenticated]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('인증이 필요합니다.');
            }

            const params = new URLSearchParams({
                type: activeType,
                page: 1,
                size: 10
            });

            const response = await fetch(`${API_ENDPOINTS.reservation.list}?${params}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            const responseData = await response.json();
            console.log('Server response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.message || '예약 목록을 불러오는데 실패했습니다.');
            }

            if (responseData.data && responseData.data.content) {
                setReservations(responseData.data.content);
            } else {
                setReservations([]);
            }

        } catch (error) {
            console.error('Failed to fetch reservations:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (storeId, reservationId) => {
        if (!window.confirm('예약을 취소하시겠습니까? 결제된 금액은 자동으로 환불됩니다.')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(
                API_ENDPOINTS.reservation.cancel(storeId, reservationId),
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cancelReason: '사용자 취소'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('예약 취소에 실패했습니다.');
            }

            await fetchReservations();
            alert('예약이 취소되었습니다.');
        } catch (error) {
            console.error('Failed to cancel:', error);
            alert(error.message);
        }
    };

    const handleReviewClick = async (reservation) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_ENDPOINTS.review.menus(reservation.reserveId)}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('메뉴 목록을 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            console.log('Menu response data structure:', data);
            if (!data.data || data.data.length === 0) {
                alert('등록된 메뉴가 없습니다.');
                return;
            }

            setMenuList(data.data);
            setSelectedReservation(reservation);
            setShowMenuModal(true);
        } catch (error) {
            console.error('Failed to fetch menus:', error);
            alert(error.message);
        }
    };

    const getPaymentText = (amount, yn) => {
        if (yn) {
            return `${amount.toLocaleString()}원 결제완료`;
        } else {
            return "결제정보 없음";
        }
    };

    const getPaymentClass = (status) => {
        switch (status) {
            case PaymentStatus.COMPLETED:
                return 'bg-green-100 text-green-800';
            case PaymentStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800';
            case PaymentStatus.CANCELLED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case ReservationStatus.RESERVATION:
                return '예약중';
            case ReservationStatus.APPLY:
                return '승인됨';
            case ReservationStatus.COMPLETE:
                return '방문완료';
            case ReservationStatus.CANCEL:
                return '취소됨';
            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case ReservationStatus.RESERVATION:
                return 'bg-yellow-100 text-yellow-800';
            case ReservationStatus.APPLY:
                return 'bg-green-100 text-green-800';
            case ReservationStatus.COMPLETE:
                return 'bg-blue-100 text-blue-800';
            case ReservationStatus.CANCEL:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const MenuSelectionModal = () => (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
            <div className="relative bg-white w-11/12 max-w-md mx-auto rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold mb-4">리뷰를 작성할 메뉴를 선택해주세요</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {menuList.map((menu) => (
                        <button
                            key={menu.id}
                            onClick={() => {
                                setShowMenuModal(false);
                                navigate(`/reviews/create/${selectedReservation.storeId}/${menu.id}`);
                            }}
                            className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="font-medium">{menu.name}</div>
                            <div className="text-sm text-gray-500 mt-1">
                                {menu.price?.toLocaleString()}원
                            </div>
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setShowMenuModal(false)}
                    className="w-full mt-4 py-3 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                >
                    닫기
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="예약/웨이팅 내역"
                leftButton={
                    <button onClick={() => navigate(-1)} className="p-2">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                }
            />

            <div className="pt-14">
                <div className="bg-white border-b">
                    <div className="flex">
                        <button
                            onClick={() => setActiveType(ReservationType.RESERVATION)}
                            className={`flex-1 py-3 text-center font-medium border-b-2 ${
                                activeType === ReservationType.RESERVATION
                                    ? 'border-blue-500 text-blue-500'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            예약
                        </button>
                        <button
                            onClick={() => setActiveType(ReservationType.WAIT)}
                            className={`flex-1 py-3 text-center font-medium border-b-2 ${
                                activeType === ReservationType.WAIT
                                    ? 'border-blue-500 text-blue-500'
                                    : 'border-transparent text-gray-500'
                            }`}
                        >
                            웨이팅
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-4">
                            {error}
                        </div>
                    ) : reservations.length === 0 ? (
                        <div className="text-center text-gray-500 p-4">
                            {activeType === ReservationType.WAIT ? '웨이팅' : '예약'} 내역이 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reservations.map((reservation) => (
                                <div key={reservation.reservationId} className="bg-white rounded-lg p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-medium text-lg">
                                                {reservation.storeName}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                <span>
                                                    {new Date(reservation.reservationDate).toLocaleDateString()} {reservation.reservationTime}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {reservation.numberPeople}명
                                            </div>
                                            {activeType === ReservationType.WAIT && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    대기번호: {reservation.reservationNo}번
                                                </div>
                                            )}
                                            {reservation.paymentAmount && reservation.type === ReservationType.RESERVATION && (
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <CreditCard className="w-4 h-4 mr-1" />
                                                    <span className={getPaymentClass(reservation.paymentStatus)}>
                                                        {getPaymentText(reservation.paymentAmount, reservation.paymentYN)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm font-medium ${
                                                getStatusClass(reservation.status)
                                            }`}
                                        >
                                            {getStatusText(reservation.status)}
                                        </span>
                                    </div>

                                    {reservation.status === ReservationStatus.COMPLETE && !reservation.hasReview && (
                                        <button
                                            onClick={() => handleReviewClick(reservation)}
                                            className="w-full mt-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                                        >
                                            리뷰 작성
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showMenuModal && <MenuSelectionModal />}
        </div>
    );
};

export default ReservationHistoryPage;