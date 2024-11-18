import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const InputField = ({
                        label,
                        icon: Icon,
                        type = 'text',
                        placeholder,
                        value,
                        onChange,
                        error,
                        required = false,
                        maxLength,
                        onBlur,
                        className = ''
                    }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                        isFocused ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    type={showPassword ? 'text' : type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 
                        ${Icon ? 'pl-10' : ''} 
                        ${error ? 'border-red-500' : isFocused ? 'border-blue-500' : 'border-gray-300'} 
                        ${className}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ?
                            <EyeOff className="w-5 h-5" /> :
                            <Eye className="w-5 h-5" />
                        }
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
            {maxLength && (
                <p className="mt-1 text-xs text-gray-500 text-right">
                    {value.length}/{maxLength}
                </p>
            )}
        </div>
    );
};

export default InputField;