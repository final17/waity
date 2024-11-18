import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const InputField = ({ icon: Icon, type, placeholder, value, onChange, error, onBlur }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="relative">
            <div className="flex items-center">
                <div className={`absolute left-3 transition-colors duration-200 ${
                    isFocused ? 'text-blue-500' : 'text-gray-400'
                }`}>
                    <Icon className="h-5 w-5" />
                </div>
                <input
                    type={showPassword ? 'text' : type}
                    className={`w-full pl-10 pr-3 py-2 border ${
                        error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          placeholder-gray-400 transition-all duration-200`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="absolute right-3 text-gray-400 hover:text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};