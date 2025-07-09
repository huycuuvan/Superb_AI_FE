/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createPayPalOrder, capturePayPalOrder } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Coins, CreditCard, Check } from 'lucide-react';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
declare global {
  interface Window {
    paypal: any;
  }
}
interface CreditPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCreditBalance: number) => void;
}

const creditPackages = [
  {
    id: 'basic',
    name: 'Gói Cơ Bản',
    amount: 1,
    credits: 100,
    popular: false,
    description: 'Phù hợp cho người mới bắt đầu'
  },
  {
    id: 'standard',
    name: 'Gói Tiêu Chuẩn',
    amount: 5,
    credits: 500,
    popular: true,
    description: 'Giá trị tốt nhất',
    bonus: '+50 credits miễn phí'
  },
  {
    id: 'premium',
    name: 'Gói Cao Cấp',
    amount: 10,
    credits: 1000,
    popular: false,
    description: 'Tiết kiệm lớn',
    bonus: '+150 credits miễn phí'
  },
  {
    id: 'enterprise',
    name: 'Gói Doanh Nghiệp',
    amount: 25,
    credits: 2500,
    popular: false,
    description: 'Cho doanh nghiệp lớn',
    bonus: '+500 credits miễn phí'
  }
];

export const CreditPurchaseDialog: React.FC<CreditPurchaseDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

  // Load PayPal SDK script khi cần
  useEffect(() => {
    if (showPayPal && !window.paypal) {
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
      script.async = true;
      script.onload = () => {
        renderPayPalButton();
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else if (showPayPal && window.paypal) {
      renderPayPalButton();
    }
    // eslint-disable-next-line
  }, [showPayPal, selectedPackage]);

  // Hàm render PayPal button
  const renderPayPalButton = () => {
    if (!paypalRef.current || !selectedPackage) return;
    const pkg = creditPackages.find(p => p.id === selectedPackage);
    if (!pkg) return;
    // Xóa nút cũ nếu có
    paypalRef.current.innerHTML = '';
    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal',
      },
      createOrder: async (data: any, actions: any) => {
        setIsProcessing(true);
        try {
          const res = await createPayPalOrder({ amount: pkg.amount.toString(), currency: 'USD' });
          setIsProcessing(false);
          return res.order_id;
        } catch (err) {
          setIsProcessing(false);
          toast({ title: 'Lỗi', description: 'Không thể tạo đơn hàng PayPal', variant: 'destructive' });
          throw err;
        }
      },
      onApprove: async (data: any, actions: any) => {
        setIsProcessing(true);
        try {
          const res = await capturePayPalOrder({ order_id: data.orderID });
          setIsProcessing(false);
          if (res.success === true || res.status === 'success') {
            const newCredit = res.new_credit_balance ?? res.new_credit;
            toast({ title: 'Thanh toán thành công', description: `Credit mới: ${newCredit}` });
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            if (currentUser.id) {
              updateUser({ ...currentUser, credit: newCredit });
            }
            if (onSuccess) onSuccess(newCredit);
            onClose();
          } else {
            toast({ title: 'Thanh toán thất bại', description: res.message || 'Thanh toán thất bại', variant: 'destructive' });
          }
        } catch (err) {
          setIsProcessing(false);
          toast({ title: 'Lỗi', description: 'Không thể xác nhận thanh toán', variant: 'destructive' });
        }
      },
      onError: (err: any) => {
        setIsProcessing(false);
        toast({ title: 'Lỗi PayPal', description: 'Có lỗi xảy ra với PayPal', variant: 'destructive' });
      },
      onCancel: () => {
        setIsProcessing(false);
        toast({ title: 'Đã hủy thanh toán', description: 'Bạn đã hủy giao dịch', variant: 'default' });
      }
    }).render(paypalRef.current);
  };

  const handleSelectPackage = (id: string) => {
    setSelectedPackage(id);
    setShowPayPal(true);
  };

  const handleClose = () => {
    setSelectedPackage(null);
    setShowPayPal(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            Nạp Credit
          </DialogTitle>
          <DialogDescription>
            Chọn gói credit phù hợp với nhu cầu của bạn. 1 USD = 100 credits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hiển thị credit hiện tại */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credit hiện tại:</span>
              <Badge variant="secondary" className="text-lg font-semibold">
                {user?.credit || 0} credits
              </Badge>
            </div>
          </div>

          {/* Danh sách gói credit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPackage === pkg.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      {pkg.popular && (
                        <Badge variant="default" className="text-xs mt-1">
                          Phổ biến
                        </Badge>
                      )}
                    </div>
                    {selectedPackage === pkg.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">${pkg.amount}</span>
                      <span className="text-sm text-muted-foreground">USD</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{pkg.credits} credits</span>
                    </div>
                    
                    {pkg.bonus && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        {pkg.bonus}
                      </Badge>
                    )}
                    
                    <p className="text-sm text-muted-foreground">{pkg.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Nút PayPal Smart Buttons */}
          {showPayPal && (
            <div className="mt-6 flex flex-col items-center">
              <div ref={paypalRef} className="w-full" />
              {isProcessing && <div className="mt-2 text-sm text-muted-foreground">Đang xử lý...</div>}
            </div>
          )}

          {/* Thông tin bổ sung */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-medium text-sm">Thanh toán an toàn</h4>
                <p className="text-xs text-muted-foreground">
                  Thanh toán được xử lý bởi PayPal. Thông tin thanh toán của bạn được bảo mật hoàn toàn.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 