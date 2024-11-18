import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import InputField from '../../components/common/InputField';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = '이메일을 입력해주세요';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다';
        }

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await login(formData);
            navigate('/');
        } catch (error) {
            setErrors({
                general: '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.'
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#FCFCFC]">
            <div className="px-6 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#202020]">로그인</h1>
                    <p className="text-[#808080] mt-2">웨이티에서 맛집을 찾아보세요</p>
                </div>

                {/* 폼 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <InputField
                        icon={Mail}
                        type="email"
                        placeholder="이메일을 입력해주세요"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        error={errors.email}
                    />

                    <InputField
                        icon={Lock}
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        error={errors.password}
                    />

                    {/* 로그인 유지 & 비밀번호 찾기 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="w-5 h-5 rounded border-[#E0E0E0] text-[#4E93FF] focus:ring-[#4E93FF]"
                            />
                            <label htmlFor="remember-me" className="ml-3 text-sm text-[#404040]">
                                로그인 유지
                            </label>
                        </div>
                        <Link to="/forgot-password" className="text-sm text-[#4E93FF] font-medium">
                            비밀번호 찾기
                        </Link>
                    </div>

                    {/* 에러 메시지 */}
                    {errors.general && (
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-600">{errors.general}</p>
                        </div>
                    )}

                    {/* 로그인 버튼 */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-[#4E93FF] text-white rounded-lg font-medium hover:bg-[#3A7FE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>

                    {/* 회원가입 링크 */}
                    <p className="text-center text-[#808080] text-sm">
                        아직 계정이 없으신가요?{' '}
                        <Link to="/signup" className="text-[#4E93FF] font-medium">
                            회원가입하기
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;