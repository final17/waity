export const Alert = ({ children, variant = "default" }) => {
    const getVariantClasses = () => {
        switch (variant) {
            case "destructive":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className={`p-4 rounded-lg border ${getVariantClasses()}`}>
            {children}
        </div>
    );
};

export const AlertTitle = ({ children }) => {
    return <h5 className="font-medium mb-1 flex items-center gap-2">{children}</h5>;
};

export const AlertDescription = ({ children }) => {
    return <div className="text-sm">{children}</div>;
};