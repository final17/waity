import React, { useState } from 'react';
import { fetchAPI, API_ENDPOINTS } from '../../constants/api';
import Header from '../../components/common/Header';

const INQUIRY_TYPES = {
    RESERVATION: {
        label: '예약 문의',
        details: {
            'Reservation_Change': '예약 변경',
            'Cancel_Reservation': '예약 취소',
            'Reservation_Inquiry': '예약 조회'
        }
    },
    PAYMENT: {
        label: '결제 문의',
        details: {
            'Deposit_Refund': '예약금 환불',
            'Payment_Card_Change': '결제 카드 변경'
        }
    },
    MEMBERSHIP: {
        label: '회원 문의',
        details: {
            'Withdrawal': '회원 탈퇴',
            'Signup': '회원 가입'
        }
    }
};

const ChatbotPage = () => {
    const [selectedType, setSelectedType] = useState('');
    const [selectedDetail, setSelectedDetail] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!selectedType || !selectedDetail) return;

        setIsLoading(true);
        try {
            const response = await fetchAPI(API_ENDPOINTS.chatbot.inquiry, {
                method: 'POST',
                body: JSON.stringify({
                    inquiryType: selectedType,
                    detail: selectedDetail
                })
            });
            setResponse(response.responseMessage);
        } catch (error) {
            setResponse('죄송합니다. 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTypeChange = (type) => {
        setSelectedType(type);
        setSelectedDetail('');
        setResponse('');
    };

    const handleDetailChange = (detail) => {
        setSelectedDetail(detail);
        setResponse('');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header title="고객 문의" />

            <div className="p-4 pt-[3.5rem]"> {/* Header 높이만큼 상단 패딩 추가 */}
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* 문의 유형 선택 */}
                    <div className="p-4">
                        <h2 className="text-lg font-semibold mb-3">문의 유형</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {Object.entries(INQUIRY_TYPES).map(([type, { label }]) => (
                                <button
                                    key={type}
                                    onClick={() => handleTypeChange(type)}
                                    className={`p-3 rounded-lg border transition-colors ${
                                        selectedType === type
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 세부 문의 선택 */}
                    {selectedType && (
                        <div className="p-4 border-t">
                            <h2 className="text-lg font-semibold mb-3">세부 문의</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(INQUIRY_TYPES[selectedType].details).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleDetailChange(key)}
                                        className={`p-3 rounded-lg border transition-colors ${
                                            selectedDetail === key
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 문의하기 버튼 */}
                    {selectedType && selectedDetail && (
                        <div className="p-4 border-t">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
                            >
                                {isLoading ? '문의 처리 중...' : '문의하기'}
                            </button>
                        </div>
                    )}

                    {/* 응답 메시지 */}
                    {response && (
                        <div className="p-4 border-t">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">답변</h3>
                                <p className="text-gray-700">{response}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;