import { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, fetchAPI } from '../constants/api';
import { EventSourcePolyfill } from "event-source-polyfill";

export const useWaiting = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null); // EventSource 인스턴스를 저장

    // SSE 연결
    const connectWaiting = (storeId) => {
        if (eventSourceRef.current) {
            // 이미 연결된 상태라면 새로운 연결을 만들지 않음
            console.log("Already connected to SSE.");
            return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('로그인이 필요합니다.');
        }

        const eventSource = new EventSourcePolyfill(
            API_ENDPOINTS.waiting.connect(storeId),
            {
                headers: {
                    'Authorization': token  // Bearer 제거
                },
                heartbeatTimeout: 120000,
                withCredentials: true
            }
        );

        eventSource.onmessage = (event) => {
            console.log('Received SSE message:', event.data);
            // 여기에 이벤트 처리 로직 추가 (예: 대기순번 업데이트 등)
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            eventSource.close();
            eventSourceRef.current = null; // 오류 발생 시 인스턴스 해제
        };

        eventSourceRef.current = eventSource; // EventSource 인스턴스를 저장
    };

    // 컴포넌트가 unmount 될 때 EventSource 연결 해제
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, []);

    // 웨이팅 등록
    const addWaiting = async (storeId) => {
        setLoading(true);
        try {
            const response = await fetchAPI(API_ENDPOINTS.waiting.add(storeId), {
                method: 'POST'
            });

            console.log('Add waiting response:', response);

            // 응답이 성공적이면 true 반환
            return true;
        } catch (err) {
            if (err.response?.status === 409) {
                alert('이미 웨이팅이 등록되어 있습니다.');
                // 이미 웨이팅이 있어도 true 반환 (이미 대기 중인 상태)
                return true;
            }
            throw new Error(err.message || '웨이팅 등록에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 웨이팅 상태 확인
    const checkWaitingStatus = async (storeId) => {
        setLoading(true);
        const response = await fetchAPI(API_ENDPOINTS.waiting.check(storeId));
        return response.data.isWaiting;
    };

    // 웨이팅 취소
    const cancelWaiting = async (storeId) => {
        setLoading(true);
        try {
            await fetchAPI(API_ENDPOINTS.waiting.cancel(storeId), {
                method: 'DELETE'
            });
            alert('웨이팅이 취소되었습니다.');
        } catch (err) {
            console.error('Cancel waiting error:', err);
            throw new Error(err.message || '웨이팅 취소에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 웨이팅 대기자 목록 가져오기
    const getWaitingList = async (storeId) => {
        setLoading(true);
        try {
            const response = await fetchAPI(API_ENDPOINTS.waiting.ownerList(storeId));
            return response.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        connectWaiting,
        addWaiting,
        cancelWaiting,
        checkWaitingStatus,
        getWaitingList  // 대기자 목록을 가져오는 함수 추가
    };
};