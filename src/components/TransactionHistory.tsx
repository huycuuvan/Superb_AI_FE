import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getTransactionHistory } from '@/services/api';
import { CreditTransaction } from '@/types';
import { Coins, Download, Calendar, DollarSign } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả giao dịch' },
  { value: 'paypal', label: 'Nạp qua PayPal' },
  { value: 'chat', label: 'Trừ credit do chat' },
  { value: 'task', label: 'Trừ credit do task' },
];

export const TransactionHistory: React.FC = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const fetchTransactions = async (pageNum = page, size = pageSize, type = selectedType) => {
    try {
      setLoading(true);
      const response = await getTransactionHistory(pageNum, size, type);
      setTransactions(response.transactions || []);
      setTotal(response.total || 0);
      setPage(response.page || pageNum);
      setPageSize(response.page_size || size);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử giao dịch:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử giao dịch",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, pageSize, selectedType);
    // eslint-disable-next-line
  }, [page, pageSize, selectedType]);

  // Lọc các giao dịch theo kênh (không filter amount > 0 nữa)
  const filteredTransactions = transactions;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Đang xử lý</Badge>;
      case 'failed':
        return <Badge variant="destructive">Thất bại</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'paypal':
      case 'stripe':
      case 'purchase':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'usage':
        return <Coins className="h-4 w-4 text-blue-500" />;
      case 'refund':
        return <Coins className="h-4 w-4 text-orange-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'paypal':
        return 'Nạp qua PayPal';
      case 'stripe':
        return 'Nạp qua Stripe';
      case 'purchase':
        return 'Mua credit';
      case 'usage':
        return 'Sử dụng';
      case 'refund':
        return 'Hoàn tiền';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lịch sử giao dịch
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={v => { setSelectedType(v); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn loại giao dịch" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => fetchTransactions(page, pageSize, selectedType)}>
              Làm mới
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có giao dịch nạp credit nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getTransactionTypeIcon(transaction.type)}
                    <div>
                      <p className="font-medium">
                        {getTransactionTypeText(transaction.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description || 'Không có mô tả'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} credits
                    </p>
                  </div>
                  {getStatusBadge('completed')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination UI */}
        <div className="flex justify-between items-center mt-6">
          <div>
            Trang {page} / {Math.max(1, Math.ceil(total / pageSize))}
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</Button>
            <Button variant="outline" size="sm" disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Sau</Button>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} / trang</option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 