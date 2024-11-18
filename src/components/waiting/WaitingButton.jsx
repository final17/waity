import { useState, useEffect, useCallback, useRef } from 'react';
import { useWaiting } from '../../hooks/useWaiting';
import { API_ENDPOINTS, fetchAPI } from '../../constants/api';
import { toast } from 'react-toastify';
import { EventSourcePolyfill } from 'event-source-polyfill';
import WaitingModal from './WaitingModal';
import 'react-toastify/dist/ReactToastify.css';

const WaitingButton = ({ storeId, isWaiting, onWaitingUpdate, disabled }) => { // disabled 추가
    const { navigateToWaitingStatus } = useWaiting();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [rank, setRank] = useState(null);
    const [shouldReconnect, setShouldReconnect] = useState(true); // 재연결 여부 제어
    const eventSourceRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    // 웨이팅 신청
    const handleWaitingJoin = async () => {
        if (disabled) {
            toast.warn('현재 웨이팅 신청이 불가능합니다.'); // 비활성화 상태에서 클릭 시 경고
            return;
        }

        setLoading(true);
        try {
            const response = await fetchAPI(API_ENDPOINTS.waiting.add(storeId), {
                method: 'POST',
            });

            if (response.status === 200) {
                toast.success('웨이팅 신청이 완료되었습니다.');
                onWaitingUpdate(true); // 웨이팅 상태를 true로 업데이트
                setShouldReconnect(true); // 재연결 가능하도록 설정
            } else {
                const errorMessage = response.message || '웨이팅 신청에 실패했습니다.';
                toast.error(errorMessage);
            }
        } catch (error) {
            const errorMessage = error.message || '웨이팅 신청에 실패했습니다.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // SSE 연결 설정 및 데이터 수신
    const initEventSource = useCallback(() => {
        if (!shouldReconnect) return; // 재연결이 불필요한 경우 종료

        const token = localStorage.getItem('accessToken'); // 최신 토큰 가져오기
        const eventSource = new EventSourcePolyfill(`${API_ENDPOINTS.waiting.connect(storeId)}`, {
            headers: {
                Authorization: token,
            },
        });

        eventSource.onmessage = (event) => {
            const receivedRank = parseInt(event.data, 10);
            setRank(receivedRank);

            if (receivedRank === 0) {
                toast.success('입장 완료!!');
                onWaitingUpdate(false); // 웨이팅 상태를 false로 업데이트
                setShowModal(false); // 모달 닫기
                setShouldReconnect(false); // 재연결 방지
                eventSource.close(); // SSE 연결 종료
                clearTimeout(reconnectTimeoutRef.current); // 재연결 타이머 초기화
            } else if (event.data === 'cancel') {
                console.log('웨이팅이 취소되었습니다.');
                eventSource.close();
            } else if (event.data === 'end') {
                toast.success('대기열이 마감되었습니다.');
                onWaitingUpdate(false); // 웨이팅 상태를 false로 업데이트
                setShowModal(false); // 모달 닫기
                setShouldReconnect(false); // 재연결 방지
                eventSource.close();
                clearTimeout(reconnectTimeoutRef.current); // 재연결 타이머 초기화
            }
        };

        eventSource.onerror = () => {
            console.error('SSE connection error');
            if (shouldReconnect) {
                toast.error('SSE 연결 오류가 발생했습니다. 다시 연결을 시도합니다.');
                eventSource.close();

                // 5초 후에 SSE를 재연결
                reconnectTimeoutRef.current = setTimeout(() => {
                    initEventSource();
                }, 5000);
            }
        };

        eventSourceRef.current = eventSource;

        return () => {
            eventSource.close();
            clearTimeout(reconnectTimeoutRef.current); // 컴포넌트 언마운트 시 타이머 제거
        };
    }, [storeId, shouldReconnect, onWaitingUpdate]);

    // isWaiting 상태 변경 시 SSE 연결 설정
    useEffect(() => {
        if (isWaiting) {
            initEventSource();
        } else if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            clearTimeout(reconnectTimeoutRef.current); // 컴포넌트 언마운트 시 타이머 제거
        };
    }, [isWaiting, initEventSource]);

    // 모달 열기
    const handleWaitingStatus = () => {
        setShowModal(true);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // 웨이팅 취소 요청 함수
    const handleCancel = async () => {
        try {
            const response = await fetchAPI(API_ENDPOINTS.waiting.cancel(storeId), {
                method: 'DELETE',
            });

            if (response.status === 200) {
                toast.success('웨이팅이 취소되었습니다.');
                setShouldReconnect(false); // 취소 후 재연결 방지
                onWaitingUpdate(false); // 웨이팅 상태를 false로 업데이트
            } else {
                toast.error('웨이팅 취소에 실패했습니다.');
            }
        } catch (error) {
            toast.error('웨이팅 취소 중 오류가 발생했습니다.');
            console.error('Error canceling waiting:', error);
        }
    };

    return (
        <div className="w-full p-4 pb-safe">
            <button
                onClick={isWaiting ? handleWaitingStatus : handleWaitingJoin}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    disabled
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' // 비활성화 색상
                        : isWaiting
                        ? 'bg-green-500 text-white hover:bg-green-600' // 웨이팅 현황 색상
                        : 'bg-blue-500 text-white hover:bg-blue-600' // 웨이팅 신청 색상
                }`}
                disabled={loading || disabled} // 비활성화 상태 추가
            >
                {disabled
                    ? '웨이팅 불가'
                    : isWaiting
                    ? '웨이팅 현황'
                    : '웨이팅 신청'}
            </button>

            <WaitingModal
                isOpen={showModal}
                onClose={handleCloseModal}
                rank={rank}
                onCancel={() => {
                    handleCloseModal();
                    handleCancel();
                }}
            />
        </div>
    );
};

export default WaitingButton;
