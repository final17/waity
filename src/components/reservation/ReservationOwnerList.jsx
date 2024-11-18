import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, fetchAPI, fetchGET } from "../../constants/api";
import { RESERVATION_TYPE, RESERVATION_STATUS, METHOD } from "../../constants/const";
import { ToastContainer, toast } from 'react-toastify';
import { auth } from "../../lib/auth";

const ReservationOwnerList = ({ ...props }) => {
    const { storeId } = props;
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        handleReservationList();
    }, []);

    const handleReservationList = async () => {
        try {
            const url = API_ENDPOINTS.reservation.ownerList;
            const response = await fetchGET(url, {
                params: {
                    storeId: storeId,
                    type: RESERVATION_TYPE.RESERVATION,
                    page: 1,
                    size: 10
                }
            });
            if (response.status === 200) {
                setReservations(response.data.content);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("예약 처리 중 오류가 발생했습니다.");
            console.error("예약 처리 중 오류 발생:", error);
        }
    };

    const convertStatus = (status) => {
        switch (status) {
            case RESERVATION_STATUS.RESERVATION:
                return "예약대기";
            case RESERVATION_STATUS.CANCEL:
                return "예약취소";
            case RESERVATION_STATUS.APPLY:
                return "예약승인";
            case RESERVATION_STATUS.COMPLETE:
                return "방문완료";
            default:
                return status;
        }
    };

    const handleApprove = async (reservation) => {
        try {
            const url = API_ENDPOINTS.reservation.apply(reservation.reserveId);
            const response = await fetchAPI(url, {
                method: METHOD.PATCH,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.getAccessToken()
                }
            });
            if (response.status === 200) {
                toast.info(response.message);
                // 예약 상태 업데이트
                setReservations(prevReservations =>
                    prevReservations.map(res =>
                        res.reserveId === reservation.reserveId ? { ...res, status: RESERVATION_STATUS.APPLY } : res
                    )
                );
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("예약 처리 중 오류가 발생했습니다.");
            console.error("예약 처리 중 오류 발생:", error);
        }
    };

    const handleReject = async (reservation) => {
        try {
            const url = API_ENDPOINTS.reservation.refuse(reservation.reserveId);
            const response = await fetchAPI(url, {
                method: METHOD.PATCH,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth.getAccessToken()
                },
                body: JSON.stringify({
                    cancelReason: '가게 사정'
                })
            });
            if (response.status === 200) {
                toast.info(response.message);
                // 예약 상태 업데이트
                setReservations(prevReservations =>
                    prevReservations.map(res =>
                        res.reserveId === reservation.reserveId ? { ...res, status: RESERVATION_STATUS.CANCEL } : res
                    )
                );
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("예약 처리 중 오류가 발생했습니다.");
            console.error("예약 처리 중 오류 발생:", error);
        }
    };

    const handleComplete = async (reservation) => {
        const url = API_ENDPOINTS.reservation.complete(reservation.reserveId);
        const response = await fetchAPI(url, {
            method: METHOD.PATCH,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': auth.getAccessToken()
            }
        });
        if (response.status === 200) {
            toast.info(response.message);
            // 예약 상태 업데이트
            setReservations(prevReservations =>
                prevReservations.map(res =>
                    res.reserveId === reservation.reserveId ? { ...res, status: RESERVATION_STATUS.COMPLETE } : res
                )
            );
        } else {
            toast.error(response.message);
        }
    };

    return (
        <div className="w-full p-4 bg-gray-50 flex justify-center">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 w-full max-w-xl">
                {reservations.map((reservation) => (
                    <div
                        key={reservation.orderId}
                        className={`bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow border ${reservation.status === RESERVATION_STATUS.CANCEL ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <div className="mb-2">
                            <p className="text-lg font-semibold text-gray-800">예약 번호: {reservation.reservationNo}</p>
                            <p className="text-xs text-gray-600">예약 날짜: {reservation.reservationDate}</p>
                            <p className="text-xs text-gray-600">예약 시간: {reservation.reservationTime}</p>
                        </div>
                        <div className="text-gray-700 space-y-1">
                            <p className="text-xs">인원: {reservation.numberPeople}명</p>
                            <p className="text-xs">금액: {reservation.paymentAmount.toLocaleString()} 원</p>
                            <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${reservation.paymentYN ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {reservation.paymentYN ? '결제 완료' : '미결제'}
                            </p>
                            <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${reservation.status === RESERVATION_STATUS.COMPLETE ? 'bg-blue-100 text-blue-700' : reservation.status === RESERVATION_STATUS.CANCEL ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {convertStatus(reservation.status)}
                            </p>
                        </div>
                        <div className="flex justify-end mt-4">
                            {reservation.paymentYN && reservation.status === RESERVATION_STATUS.RESERVATION && (
                                <>
                                    <button onClick={() => handleApprove(reservation)} className="bg-sky-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition">예약 승인하기</button>
                                    <button onClick={() => handleReject(reservation)} className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-700 transition ml-2">예약 거절하기</button>
                                </>
                            )}
                            {reservation.paymentYN && reservation.status === RESERVATION_STATUS.APPLY && (
                                <>
                                    <button onClick={() => handleComplete(reservation)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">방문 완료</button>
                                    <button onClick={() => handleReject(reservation)} className="bg-red-400 text-white px-3 py-1 rounded hover:bg-red-700 transition ml-2">예약 거절하기</button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer /> {/* 토스트 컨테이너 추가 */}
        </div>
    );
};

export default ReservationOwnerList;
