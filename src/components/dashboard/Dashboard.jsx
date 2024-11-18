import React, {useEffect, useState} from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, LineController, BarController} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {formatDate} from '../../common/common'
import {RESERVATION_TYPE , RESERVATION_STATUS, SUMMARY_DATE} from '../../constants/const';
import {API_ENDPOINTS, fetchGET} from "../../constants/api";
import {toast} from "react-toastify";
import WaitingStatistics from './WaitingDashboard'; // 추가된 모듈

// 필요한 스케일 및 요소 등록
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, LineController, BarController);

const Dashboard = ({ ...props }) => {
    const { storeId } = props;
    const [summaryType, setSummaryType] = useState(SUMMARY_DATE.DAY);
    const [startDate, setStartDate] = useState(formatDate(new Date() , 'yyyy-mm-dd'));
    const [endDate, setEndDate] = useState(formatDate(new Date() , 'yyyy-mm-dd'));
    const [reservationCount , setReservationCount] = useState(0);
    const [waitingCount , setWaitingCount] = useState(0);
    const [labels , setLabels] = useState([]);
    const [amts , setAmts] = useState([]);
    const [fees , setFees] = useState([]);

    useEffect(() => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        // 날짜 포맷팅
        setStartDate(formatDate(sevenDaysAgo, 'yyyy-mm-dd'));
        setEndDate(formatDate(today, 'yyyy-mm-dd'));

        fetchTodayReservationCount();
        fetchWaitingCount();
    }, []);

    useEffect(() => {
        fetchSummarySettlement();
    } , [startDate , endDate])


    useEffect(() => {
        if (summaryType === SUMMARY_DATE.WEEK) {
            // 주일 때 시작일과 종료일을 설정
            const today = new Date();
            const weekNumber = Math.ceil(((today - new Date(today.getFullYear(), 0, 1)) / 86400000 + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7);
            const year = today.getFullYear();
            setStartDate(`${year}-${weekNumber}`);
            setEndDate(`${year}-${weekNumber}`);
        } else if (summaryType === SUMMARY_DATE.MONTH) {
            // 월일 때 시작일과 종료일을 설정
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            setStartDate(`${year}-${month}`);
            setEndDate(`${year}-${month}`);
        } else {
            // 일일 때 오늘 날짜
            setStartDate(formatDate(new Date(), 'yyyy-mm-dd'));
            setEndDate(formatDate(new Date(), 'yyyy-mm-dd'));
        }
    }, [summaryType]);

    const fetchWaitingCount = async() => {
        try {
            const response = await fetchGET(API_ENDPOINTS.waiting.ownerList(storeId), {
            });
            if (response.status === 200) {
                console.log(response.data);
                setWaitingCount(response.data.totalWaitingNumber);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("예약 처리 중 오류가 발생했습니다.");
            console.error("예약 처리 중 오류 발생:", error);
        }
    }

    const fetchTodayReservationCount = async () => {
        try {
            const url = API_ENDPOINTS.reservation.ownerList;
            const response = await fetchGET(url, {
                params: {
                    storeId: storeId,
                    type: RESERVATION_TYPE.RESERVATION,
                    status: RESERVATION_STATUS.APPLY
                }
            });
            if (response.status === 200) {
                console.log(response.data);
                setReservationCount(response.data.totalElements);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("예약 처리 중 오류가 발생했습니다.");
            console.error("예약 처리 중 오류 발생:", error);
        }
    }

    const fetchSummarySettlement = async () => {
        try {
            const url = API_ENDPOINTS.settlement.summary(storeId);
            const response = await fetchGET(url, {
                params: {
                    summaryType: summaryType,
                    startDt: startDate,
                    endDt: endDate
                }
            });

            if (response.status === 200) {
                console.log(response.data);
                generate(startDate , endDate , response.data);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("예약 처리 중 오류가 발생했습니다.");
            console.error("예약 처리 중 오류 발생:", error);
        }
    }

    const generate = (startDt, endDt, summaryData) => {
        const labels = [];
        const amts = [];
        const transactions = [];
        let idx = 0;

        if (summaryType === SUMMARY_DATE.DAY) {
            // 일별 데이터 처리
            const sdt = new Date(startDt);
            const edt = new Date(endDt);
            for (let date = sdt; date <= edt; date.setDate(date.getDate() + 1)) {
                const formattedDate = formatDate(date, 'yyyy-mm-dd');
                if (idx < summaryData.length && formattedDate === summaryData[idx].summaryDate) {
                    amts.push(summaryData[idx].totalAmount);
                    transactions.push(summaryData[idx].totalFee);
                    idx++;
                } else {
                    amts.push(0);
                    transactions.push(0);
                }
                labels.push(formattedDate);
            }
        } else if (summaryType === SUMMARY_DATE.WEEK) {
            // 주별 데이터 처리
            const [startYear, startWeek] = startDt.split('-').map(Number);
            const [endYear, endWeek] = endDt.split('-').map(Number);

            // 주 범위 반복
            for (let year = startYear; year <= endYear; year++) {
                const weekStart = year === startYear ? startWeek : 1;
                const weekEnd = year === endYear ? endWeek : 52; // assuming 52 weeks in a year

                for (let week = weekStart; week <= weekEnd; week++) {
                    const formattedWeek = `${year}-${String(week).padStart(2, '0')}`;

                    if (idx < summaryData.length && formattedWeek === summaryData[idx].summaryDate) {
                        amts.push(summaryData[idx].totalAmount);
                        transactions.push(summaryData[idx].totalFee);
                        idx++;
                    } else {
                        amts.push(0);
                        transactions.push(0);
                    }
                    labels.push(formattedWeek);
                }
            }
        } else if (summaryType === SUMMARY_DATE.MONTH) {
            // 월별 데이터 처리
            const startMonth = new Date(startDt);
            const endMonth = new Date(endDt);

            for (let date = startMonth; date <= endMonth; date.setMonth(date.getMonth() + 1)) {
                const formattedMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (idx < summaryData.length && formattedMonth === summaryData[idx].summaryDate) {
                    amts.push(summaryData[idx].totalAmount);
                    transactions.push(summaryData[idx].totalFee);
                    idx++;
                } else {
                    amts.push(0);
                    transactions.push(0);
                }
                labels.push(formattedMonth);
            }
        }

        setLabels(labels);
        setAmts(amts);
        setFees(transactions);
    };

    const data = {
        labels: labels, // 생성된 라벨 사용
        datasets: [
            {
                type: 'bar',
                label: '총 금액',
                data: amts, // 데이터 길이는 라벨 길이와 맞춰야 함
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 1)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
            },
            {
                type: 'bar',
                label: '총 수수료',
                data: fees, // 데이터 길이는 라벨 길이와 맞춰야 함
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
        scales: {
            x: {
                type: 'category',
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="container mx-auto p-6">
            {/* 개요 섹션 */}
            <header className="mb-6 text-center">
                <h1 className="text-3xl font-bold text-gray-800">개요</h1>
            </header>

            {/* 오늘 예약 건수 및 현재 웨이팅 건수 섹션 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <h2 className="text-xl font-semibold text-gray-700">오늘 예약 건수</h2>
                    <p className="text-4xl font-bold text-blue-600">{reservationCount}</p> {/* 예시 숫자 */}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <h2 className="text-xl font-semibold text-gray-700">현재 웨이팅 건수</h2>
                    <p className="text-4xl font-bold text-blue-600">{waitingCount}</p> {/* 예시 숫자 */}
                </div>
            </div>

            {/* 차트 섹션 */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">집계 데이터</h2>
                <div className="flex items-center mb-4 space-x-4">
                    <select
                        value={summaryType}
                        onChange={(e) => setSummaryType(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                    >
                        <option value={SUMMARY_DATE.DAY}>일</option>
                        <option value={SUMMARY_DATE.WEEK}>주</option>
                        <option value={SUMMARY_DATE.MONTH}>월</option>
                    </select>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                            placeholder={summaryType === SUMMARY_DATE.WEEK ? "YYYY-WW" : "YYYY-MM"}
                        />
                        <span className="self-center">~</span>
                        <input
                            type="text"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                            placeholder={summaryType === SUMMARY_DATE.WEEK ? "YYYY-WW" : "YYYY-MM"}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <p className="text-gray-600">선택된 날짜: {startDate} ~ {endDate}</p>
                </div>
                {/* 차트 영역 */}
                <div className="h-64">
                    <Line data={data} options={options}/>
                </div>
            </div>
            {/* 추가된 웨이팅 통계 */}
            <div className="bg-white p-6 rounded-lg shadow-lg min-h-screen">
                 <WaitingStatistics storeId={storeId} />
            </div>

        </div>
    );
};

export default Dashboard;
