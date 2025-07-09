import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { capturePayPalOrder } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Coins } from 'lucide-react';

export const PayPalCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');
  const [newCreditBalance, setNewCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    const handlePayPalCallback = async () => {
      const token = searchParams.get('token');
      const PayerID = searchParams.get('PayerID');
      const orderId = searchParams.get('order_id');

      if (!token || !PayerID) {
        setStatus('error');
        setMessage('Thông tin thanh toán không hợp lệ');
        return;
      }

      try {
        // Gọi API để capture order
        const response = await capturePayPalOrder({
          order_id: orderId || token
        });

        if (response.success === true || response.status === 'success') {
          const newCredit = response.new_credit_balance ?? response.new_credit;
          setStatus('success');
          setMessage('Thanh toán thành công! Credit đã được cộng vào tài khoản của bạn.');
          setNewCreditBalance(newCredit);
          // Cập nhật credit trong context
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.id) {
            updateUser({ ...currentUser, credit: newCredit });
          }
          toast({
            title: "Thanh toán thành công",
            description: `Đã nạp thành công! Credit mới: ${newCredit}`,
          });
        } else {
          setStatus('error');
          setMessage(response.message || 'Thanh toán thất bại');
        }
      } catch (error) {
        console.error('Lỗi khi xử lý thanh toán:', error);
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xử lý thanh toán. Vui lòng liên hệ hỗ trợ.');
      }
    };

    handlePayPalCallback();
  }, [searchParams, updateUser, toast]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBuyMore = () => {
    navigate('/dashboard?showCreditPurchase=true');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'processing' && (
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-12 w-12 text-red-500" />
            )}
          </div>
          <CardTitle>
            {status === 'processing' && 'Đang xử lý thanh toán...'}
            {status === 'success' && 'Thanh toán thành công!'}
            {status === 'error' && 'Thanh toán thất bại'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {message}
          </p>

          {status === 'success' && newCreditBalance !== null && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Credit mới: {newCreditBalance}</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                Nếu bạn đã thanh toán nhưng gặp lỗi này, vui lòng liên hệ hỗ trợ với mã giao dịch: {searchParams.get('token')}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleBackToDashboard}
              className="flex-1"
            >
              Về Dashboard
            </Button>
            {status === 'success' && (
              <Button 
                onClick={handleBuyMore}
                className="flex-1"
              >
                Mua thêm
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 