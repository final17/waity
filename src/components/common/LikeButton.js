import React from 'react';
import { Heart } from 'lucide-react';

const LikeButton = ({ liked, likeCount, onClick, size = 'default' }) => {
    const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    const containerClasses = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-1 ${containerClasses} rounded-full transition-colors
                ${liked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            <Heart className={`${sizeClasses} ${liked ? 'fill-current' : ''}`} />
            <span className="text-sm">{likeCount}</span>
        </button>
    );
};

export default LikeButton;