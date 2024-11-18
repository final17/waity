import { Star } from 'lucide-react';

const Rating = ({
                    value,
                    onChange,
                    size = 'md',
                    readonly = false,
                    showCount = false,
                    count = 0
                }) => {
    const starSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleClick = (rating) => {
        if (!readonly && onChange) {
            onChange(rating);
        }
    };

    return (
        <div className="flex items-center">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => handleClick(rating)}
                        disabled={readonly}
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer'} 
                            ${rating <= value ? 'text-yellow-400' : 'text-gray-300'} 
                            transition-colors duration-150 hover:scale-110`}
                    >
                        <Star
                            className={`${starSizes[size]} ${
                                rating <= value ? 'fill-current' : ''
                            }`}
                        />
                    </button>
                ))}
            </div>
            {showCount && (
                <span className="ml-2 text-sm text-gray-500">
                    ({count})
                </span>
            )}
        </div>
    );
};

export default Rating;