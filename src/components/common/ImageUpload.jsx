import { useState } from 'react';
import { Camera, X } from 'lucide-react';

const ImageUpload = ({
                         images = [],
                         onChange,
                         maxImages = 5,
                         aspectRatio = '1:1',
                     }) => {
    const [error, setError] = useState(null);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setError(null);

        if (images.length + files.length > maxImages) {
            setError(`이미지는 최대 ${maxImages}장까지 업로드할 수 있습니다.`);
            return;
        }

        // Check file types and sizes
        const invalidFile = files.find(file => !file.type.startsWith('image/'));
        if (invalidFile) {
            setError('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        const oversizedFile = files.find(file => file.size > 5 * 1024 * 1024);
        if (oversizedFile) {
            setError('파일 크기는 5MB를 초과할 수 없습니다.');
            return;
        }

        // Create preview URLs
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));

        onChange([...images, ...newImages]);
    };

    const removeImage = (index) => {
        const newImages = [...images];

        // Revoke the URL to prevent memory leaks
        if (newImages[index].preview) {
            URL.revokeObjectURL(newImages[index].preview);
        }

        newImages.splice(index, 1);
        onChange(newImages);
    };

    const aspectRatioClass = {
        '1:1': 'aspect-square',
        '4:3': 'aspect-4/3',
        '16:9': 'aspect-video',
    }[aspectRatio];

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`relative w-24 ${aspectRatioClass} rounded-lg overflow-hidden border border-gray-200`}
                    >
                        <img
                            src={image.preview || image}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <label className={`w-24 ${aspectRatioClass} flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50`}>
                        <Camera className="w-6 h-6 text-gray-400" />
                        <span className="mt-1 text-xs text-gray-500">
                            {images.length}/{maxImages}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    </label>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            <p className="text-xs text-gray-500">
                JPG, PNG 파일 ({maxImages}장까지 가능)
            </p>
        </div>
    );
};

export default ImageUpload;