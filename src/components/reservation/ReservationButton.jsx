import { useState, useEffect } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { API_ENDPOINTS, fetchGET } from "../../constants/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // 토스트 스타일 추가

const ReservationButton = ({ store }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState("");
    const [selectedPeople, setSelectedPeople] = useState(1);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const generateRandomString = () => window.btoa(Math.random()).slice(0, 20);
    const clientKey = "test_ck_Poxy1XQL8RaXybvzaGLkr7nO5Wml";
    const customerKey = generateRandomString();
    const [payment, setPayment] = useState(null);
    const [totalAmount , setTotalAmount] = useState(0);

    useEffect(() => {
        async function fetchPayment() {
            try {
                const tossPayments = await loadTossPayments(clientKey);
                const payment = tossPayments.payment({ customerKey });
                setPayment(payment);
            } catch (error) {
                console.error("Error fetching payment:", error);
            }
        }
        fetchPayment();
    }, []);

    useEffect(() => {
        generateAvailableTimes(store.openTime, store.closeTime, store.turnover);
    }, [store]);

    useEffect(() => {
        getCartInfo();
        setSelectedDate(new Date());
        setSelectedTime("");
        setSelectedPeople(1);
        document.body.style.overflow = isModalOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);


    const calculateTotalAmount = (carts) => {
        return carts.reduce((total, item) => {
            return total + (item.cnt * item.price); // 각 항목의 수량과 가격을 곱하여 총합에 더하기
        }, 0);
    };

    const getCartInfo = async () => {
        const url = API_ENDPOINTS.cart.list(store.id);
        try{
            const response = await fetchGET(url);
            if (response.status === 200) {
                setTotalAmount(calculateTotalAmount(response.data));
            }
        } catch(e) {
            toast.error(e.message);
        }
    }

    const generateAvailableTimes = (openTime, closeTime, turnover) => {
        const times = [];
        const open = new Date(`1970-01-01T${openTime}`);
        const close = new Date(`1970-01-01T${closeTime}`);
        const turnoverMinutes = parseTime(turnover);

        for (let time = open; time <= close; time.setMinutes(time.getMinutes() + turnoverMinutes)) {
            times.push(time.toTimeString().slice(0, 5));
        }
        setAvailableTimes(times);
    };

    const parseTime = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const formatDateToYYYYMMDD = (date) => {
        return date.toISOString().split("T")[0];
    };

    const handleReservation = async () => {
        if (selectedTime && selectedPeople > 0) {
            const formattedDate = formatDateToYYYYMMDD(selectedDate);
            const formattedTime = selectedTime + ":00";
            try {
                const url = API_ENDPOINTS.payment.prepare;
                const response = await fetchGET(url, {
                    params: {
                        storeId : store.id,
                        date : formattedDate,
                        time : formattedTime,
                        numberPeople : selectedPeople,
                        amount : totalAmount,
                        orderName : store.title
                    }
                });

                console.log(response);

                if (response.status === 200 && payment) {
                    const data = response.data;
                    const amount = {
                        currency: "KRW",
                        value: data.amount,
                    };

                    await payment.requestPayment({
                        method: "CARD", // 카드 및 간편결제
                        amount,
                        orderId: data.orderId,
                        orderName: data.orderName,
                        successUrl: API_ENDPOINTS.payment.success + window.location.search,
                        failUrl: API_ENDPOINTS.payment.fail + window.location.search,
                        card: {
                            useEscrow: false,
                            flowMode: "DEFAULT",
                            useCardPoint: false,
                            useAppCardOnly: false,
                        },
                    });
                    setIsModalOpen(false); // 모달 닫기
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                // 오류 발생 시
                toast.error("예약 처리 중 오류가 발생했습니다.");
                console.error("예약 처리 중 오류 발생:", error);
            }
        } else {
            toast.warn("시간과 인원을 선택해주세요.");
        }
    };

    return (
        <div className="w-full p-4 pb-safe">
            <button
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                onClick={() => setIsModalOpen(true)}
            >
                예약하기
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h2 className="text-lg font-bold mb-4">예약하기</h2>
                        <div className="mb-4">
                            <label className="block mb-1">예약 날짜:</label>
                            <input
                                type="date"
                                value={selectedDate.toISOString().split("T")[0]}
                                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">예약 시간:</label>
                            <div className="relative">
                                <button
                                    className="w-full border rounded p-2 text-left"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    {selectedTime || "시간 선택"}
                                </button>
                                {isDropdownOpen && (
                                    <div
                                        className="absolute w-full border border-gray-300 bg-white rounded shadow-md max-h-60 overflow-auto z-10">
                                        {availableTimes.map((time, index) => (
                                            <div
                                                key={index}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => {
                                                    setSelectedTime(time);
                                                    setIsDropdownOpen(false);
                                                }}
                                            >
                                                {time}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">예약 인원:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedPeople}
                                onChange={(e) => setSelectedPeople(Number(e.target.value))}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1">예약 금액:{totalAmount.toLocaleString()}원</label>
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-1/2 bg-gray-300 p-2 rounded"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleReservation}
                                className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            >
                                예약 완료
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer/> {/* 토스트 컨테이너 추가 */}
        </div>
    );
};

export default ReservationButton;
