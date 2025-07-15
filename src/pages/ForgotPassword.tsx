import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { forgotPassword, verifyForgotPassword, resetPassword, verifyEmail } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();
  // Bước 1: Gửi email để nhận mã
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await forgotPassword(email);
      if (data && data.code === 0 && data.status === true && data.tag === 'FORGOT_PASSWORD_CODE_SENT') {
        setStep('verify');
      } else {
        setError(data.error || 'Không thể gửi email.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực mã
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await verifyForgotPassword(email, code);
      if (data && data.code === 0 && data.status === true) {
        setStep('reset');
      } else {
        setError(data.error || 'Mã xác nhận không đúng hoặc đã hết hạn.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await resetPassword(email, new_password);
      if (data && data.code === 0 && data.status === true) {
        setSuccess('Đặt lại mật khẩu thành công!');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.error || 'Không thể đặt lại mật khẩu.');
      }
    } catch (err) {
      setError('Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 antialiased selection:bg-pink-300 selection:text-pink-900 overflow-hidden relative',
      // Thay đổi nền light theme để dịu mắt hơn
      'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50',
      // Giữ nguyên dark theme
      theme === 'dark' && 'dark bg-gradient-to-br from-zinc-900 via-zinc-950 to-black'
    )}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Quên mật khẩu</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
              </Button>
            </form>
          )}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              <Input
                type="text"
                placeholder="Nhập mã xác nhận"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                disabled={loading}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Đang xác nhận...' : 'Xác nhận mã'}
              </Button>
            </form>
          )}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Input
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={new_password}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword; 