import React, { useState } from "react";
import { Giftcode, createGiftcode, updateGiftcode } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface GiftcodeFormProps {
  initialValues?: Giftcode | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const GiftcodeForm: React.FC<GiftcodeFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  const [code, setCode] = useState(initialValues?.code || "");
  const [credit, setCredit] = useState(initialValues?.credit || 0);
  const [expiredAt, setExpiredAt] = useState<Date | undefined>(
    initialValues?.expired_at ? new Date(initialValues.expired_at) : undefined
  );
  const [quantity, setQuantity] = useState(initialValues?.quantity ?? 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError("Giftcode không được để trống");
      return;
    }
    if (!credit || credit <= 0) {
      setError("Credit phải lớn hơn 0");
      return;
    }
    if (!expiredAt) {
      setError("Vui lòng chọn ngày hết hạn");
      return;
    }
    if (!quantity || quantity <= 0) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }
    setLoading(true);
    try {
      if (initialValues) {
        await updateGiftcode(code, { credit, quantity, expired_at: expiredAt.toISOString() });
      } else {
        await createGiftcode({ code, credit, quantity, expired_at: expiredAt.toISOString() });
      }
      onSubmit();
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="block font-medium mb-1" htmlFor="giftcode-code">Giftcode</Label>
        <Input
          id="giftcode-code"
          type="text"
          className="w-full bg-background text-foreground border-border placeholder:text-muted-foreground"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          disabled={!!initialValues}
          placeholder="Nhập mã giftcode"
        />
      </div>
      <div>
        <Label className="block font-medium mb-1" htmlFor="giftcode-credit">Credit</Label>
        <Input
          id="giftcode-credit"
          type="text"
          className="w-full bg-background text-foreground border-border placeholder:text-muted-foreground"
          value={credit}
          onChange={e => setCredit(Number(e.target.value))}
          min={1}
          placeholder="Nhập số credit"
        />
      </div>
      <div>
        <Label className="block font-medium mb-1" htmlFor="giftcode-expired">Ngày hết hạn</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={"w-full justify-start text-left font-normal bg-background text-foreground border-border placeholder:text-muted-foreground" + (expiredAt ? "" : " text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              {expiredAt ? format(expiredAt, "dd/MM/yyyy") : <span>Chọn ngày hết hạn</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={expiredAt}
              onSelect={setExpiredAt}
              initialFocus
              fromDate={new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label className="block font-medium mb-1" htmlFor="giftcode-quantity">Số lượng</Label>
        <Input
          id="giftcode-quantity"
          type="text"
          className="w-full bg-background text-foreground border-border placeholder:text-muted-foreground"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          min={1}
          placeholder="Nhập số lượng mã sử dụng"
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Huỷ</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : (initialValues ? "Cập nhật" : "Tạo mới")}</Button>
      </div>
    </form>
  );
};

export default GiftcodeForm; 