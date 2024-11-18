import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import InputField from '../../components/common/InputField';
import { useAuth } from '../../hooks/useAuth';

const PasswordStrengthIndicator = ({ password }) => {
    const calculateStrength = () => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        return strength;
    };

    const getColor = (strength) => {
        if (strength <= 2) return 'bg-red-500';
        if (strength <= 3) return 'bg-yellow-500';
        if (strength <= 4) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const strength = calculateStrength();
    const width = `${(strength / 5) * 100}%`;

    return (
        <div className="mt-1">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${getColor(strength)} transition-all duration-300`}
                    style={{ width }}
                />
            </div>
            <p className="mt-1 text-xs text-gray-500">
                {strength <= 2 && '비밀번호가 너무 약합니다'}
                {strength === 3 && '적절한 비밀번호입니다'}
                {strength === 4 && '강력한 비밀번호입니다'}
                {strength === 5 && '매우 강력한 비밀번호입니다'}
            </p>
        </div>
    );
};

const SignupPage = () => {
    const navigate = useNavigate();
    const { signup, isLoading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        userRole: 'ROLE_USER',
        adminToken: ''
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // 이메일 검증
        if (!formData.email) {
            newErrors.email = '이메일을 입력해주세요';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식이 아닙니다';
        }

        // 비밀번호 검증
        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요';
        } else if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/)) {
            newErrors.password = '비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다';
        }

        // 비밀번호 확인 검증
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
        }

        // 닉네임 검증
        if (!formData.nickname) {
            newErrors.nickname = '닉네임을 입력해주세요';
        } else if (formData.nickname.length < 2) {
            newErrors.nickname = '닉네임은 2자 이상이어야 합니다';
        }

        // 관리자 토큰 검증
        if (isAdmin && !formData.adminToken) {
            newErrors.adminToken = '관리자 토큰을 입력해주세요';
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

        const userRole = isAdmin ? 'ROLE_ADMIN' : isOwner ? 'ROLE_OWNER' : 'ROLE_USER';

        try {
            await signup({
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname,
                userRole: userRole,
                adminToken: isAdmin ? formData.adminToken : undefined
            });
            navigate('/login');
        } catch (error) {
            setErrors({
                general: '회원가입에 실패했습니다. 다시 시도해주세요.'
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#FCFCFC]">
            <div className="px-6 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#202020]">회원가입</h1>
                    <p className="text-[#808080] mt-2">체크테이블과 함께 시작하세요</p>
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

                    <div>
                        <InputField
                            icon={Lock}
                            type="password"
                            placeholder="비밀번호를 입력해주세요"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password}
                        />
                        <PasswordStrengthIndicator password={formData.password} />
                    </div>

                    <InputField
                        icon={Lock}
                        type="password"
                        placeholder="비밀번호를 다시 입력해주세요"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        error={errors.confirmPassword}
                    />

                    <InputField
                        icon={User}
                        type="text"
                        placeholder="닉네임을 입력해주세요"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        error={errors.nickname}
                    />

                    {/* 역할 선택 */}
                    <div className="space-y-2">
                        {/* 점주 체크박스 */}
                        <div className="flex items-center bg-white p-4 rounded-lg border border-[#E0E0E0]">
                            <input
                                type="checkbox"
                                id="owner-mode"
                                checked={isOwner}
                                onChange={(e) => {
                                    setIsOwner(e.target.checked);
                                    if (e.target.checked) {
                                        setIsAdmin(false);
                                    }
                                }}
                                className="w-5 h-5 rounded border-[#E0E0E0] text-[#4E93FF] focus:ring-[#4E93FF]"
                            />
                            <label htmlFor="owner-mode" className="ml-3 text-sm text-[#404040]">
                                점주로 가입
                            </label>
                        </div>

                        {/* 관리자 체크박스 */}
                        <div className="flex items-center bg-white p-4 rounded-lg border border-[#E0E0E0]">
                            <input
                                type="checkbox"
                                id="admin-mode"
                                checked={isAdmin}
                                onChange={(e) => {
                                    setIsAdmin(e.target.checked);
                                    if (e.target.checked) {
                                        setIsOwner(false);
                                    }
                                }}
                                className="w-5 h-5 rounded border-[#E0E0E0] text-[#4E93FF] focus:ring-[#4E93FF]"
                            />
                            <label htmlFor="admin-mode" className="ml-3 text-sm text-[#404040]">
                                관리자로 가입
                            </label>
                        </div>
                    </div>

                    {/* 관리자 토큰 입력 */}
                    {isAdmin && (
                        <InputField
                            icon={Lock}
                            type="password"
                            placeholder="관리자 토큰을 입력해주세요"
                            value={formData.adminToken}
                            onChange={(e) => setFormData({ ...formData, adminToken: e.target.value })}
                            error={errors.adminToken}
                        />
                    )}

                    {/* 약관 동의 */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="terms"
                            required
                            className="w-5 h-5 rounded border-[#E0E0E0] text-[#4E93FF] focus:ring-[#4E93FF]"
                        />
                        <label htmlFor="terms" className="ml-3 text-sm text-[#404040]">
                            <Link to="/terms" className="text-[#4E93FF]">이용약관</Link> 및{' '}
                            <Link to="/privacy" className="text-[#4E93FF]">개인정보처리방침</Link>에 동의합니다
                        </label>
                    </div>

                    {/* 에러 메시지 */}
                    {errors.general && (
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-600">{errors.general}</p>
                        </div>
                    )}

                    {/* 회원가입 버튼 */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-[#4E93FF] text-white rounded-lg font-medium hover:bg-[#3A7FE8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '가입 중...' : '가입하기'}
                    </button>

                    {/* 로그인 링크 */}
                    <p className="text-center text-[#808080] text-sm">
                        이미 계정이 있으신가요?{' '}
                        <Link to="/login" className="text-[#4E93FF] font-medium">
                            로그인하기
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;