export const PasswordStrengthMeter = ({ password }) => {
    const calculateStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        return strength;
    };

    const strength = calculateStrength();
    const width = (strength / 5) * 100;

    const getColor = () => {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        if (strength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (strength <= 2) return 'Weak';
        if (strength <= 3) return 'Fair';
        if (strength <= 4) return 'Good';
        return 'Strong';
    };

    return (
        <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded-full">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${getColor()}`}
                    style={{ width: `${width}%` }}
                />
            </div>
            <div className="text-sm mt-1 text-gray-600">
                Password strength: {getStrengthText()}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;