export const EmailVerificationStatus = ({ verified, onResend }) => {
    return (
        <div className={`mt-2 p-2 rounded-md ${verified ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center">
                <div className={`flex-shrink-0 ${verified ? 'text-green-400' : 'text-yellow-400'}`}>
                    <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        {verified ? (
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        ) : (
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        )}
                    </svg>
                </div>
                <div className="ml-3">
                    <p className={`text-sm ${verified ? 'text-green-700' : 'text-yellow-700'}`}>
                        {verified ?
                            'Email verified' :
                            <>
                                Please verify your email.
                                <button
                                    onClick={onResend}
                                    className="ml-2 underline hover:text-yellow-800"
                                >
                                    Resend verification email
                                </button>
                            </>
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};