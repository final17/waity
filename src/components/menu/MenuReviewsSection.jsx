import React, { useState } from 'react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useModal } from '../../hooks/useModal';

const MenuReviewsSection = ({ menuId, hasCompletedReservation }) => {
    const { openModal, closeModal } = useModal();

    const handleWriteReview = () => {
        if (!hasCompletedReservation) {
            alert('방문 완료 후에 리뷰를 작성할 수 있습니다.');
            return;
        }

        openModal({
            content: <ReviewForm menuId={menuId} onClose={closeModal} />
        });
    };

    return (
        <div className="bg-white">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-bold">리뷰</h2>
                {hasCompletedReservation && (
                    <button
                        onClick={handleWriteReview}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                    >
                        리뷰 쓰기
                    </button>
                )}
            </div>
            <ReviewList menuId={menuId} />
        </div>
    );
};

export default MenuReviewsSection;