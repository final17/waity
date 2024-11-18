export const SocialLoginButton = ({ icon: Icon, provider, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            <Icon size={20} />
            Continue with {provider}
        </button>
    );
};