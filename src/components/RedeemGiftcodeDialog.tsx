import React, { useState } from "react";
import { redeemGiftcode } from "@/services/api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "./ui/input";

interface RedeemGiftcodeDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (credit: number) => void;
}

const RedeemGiftcodeDialog: React.FC<RedeemGiftcodeDialogProps> = ({ open, onClose, onSuccess }) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      setCode("");
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!code.trim()) {
      setError("Vui lòng nhập mã giftcode");
      toast.error("Vui lòng nhập mã giftcode");
      return;
    }
    setLoading(true);
    try {
      const res = await redeemGiftcode(code.trim().toUpperCase());
      if (res.success === false) {
        setError(res.message || "Giftcode không hợp lệ hoặc đã hết lượt sử dụng");
        toast.error(res.message || "Giftcode không hợp lệ hoặc đã hết lượt sử dụng");
      } else {
        setSuccess(`Nhận thành công ${res.credit || 0} credit!`);
        toast.success(res.message || `Nhận thành công ${res.credit || 0} credit!`, { description: res.credit ? `Bạn đã nhận được ${res.credit} credit vào tài khoản.` : undefined });
        setCode("");
        if (onSuccess && res.credit) onSuccess(res.credit);
      }
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Giftcode không hợp lệ hoặc đã được sử dụng");
      toast.error(e instanceof Error ? e.message : "Giftcode không hợp lệ hoặc đã được sử dụng");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>Nhập giftcode để nhận credit miễn phí</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập mã giftcode"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            disabled={loading || !!success}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm font-semibold">{success}</div>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Bỏ qua</Button>
            <Button type="submit" disabled={loading || !!success}>{loading ? 'Đang xử lý...' : 'Nhận credit'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemGiftcodeDialog; 