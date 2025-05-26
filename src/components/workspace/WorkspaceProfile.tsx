import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkspaceProfile, WorkspaceProfile, updateWorkspaceProfile } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface WorkspaceProfileFormProps {
  workspaceId: string;
  initialData?: WorkspaceProfile;
  onSubmit?: (data: WorkspaceProfile) => Promise<void>;
  onSuccess?: () => void;
}

export function WorkspaceProfileForm({ workspaceId, initialData, onSubmit, onSuccess }: WorkspaceProfileFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<WorkspaceProfile, "workspace_id">>({
    brand_name: "",
    business_type: "",
    default_language_code: "en",
    default_location_code: "VN",
    brand_description: "",
    brand_products_services: "",
    website_url: "",
    brand_logo_url: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        brand_name: initialData.brand_name || "",
        business_type: initialData.business_type || "",
        default_language_code: initialData.default_language_code || "en",
        default_location_code: initialData.default_location_code || "VN",
        brand_description: initialData.brand_description || "",
        brand_products_services: initialData.brand_products_services || "",
        website_url: initialData.website_url || "",
        brand_logo_url: initialData.brand_logo_url || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const fullData = {
        ...formData,
        workspace_id: workspaceId,
      };

      if (onSubmit) {
        await onSubmit(fullData as WorkspaceProfile);
        toast.success("Cập nhật thông tin workspace thành công!");
      } else {
        await createWorkspaceProfile(fullData as WorkspaceProfile);
        toast.success("Tạo thông tin workspace thành công!");
        navigate("/workspace");
      }

      onSuccess?.();

    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu thông tin workspace");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formTitle = initialData ? "Chỉnh sửa thông tin Workspace" : "Thông tin Workspace";

  return (
    <div className={initialData ? "" : "max-w-2xl mx-auto p-6"}>
      <h1 className="text-2xl font-bold mb-6 text-primary">{formTitle}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="brand_name">Tên thương hiệu</Label>
          <Input
            id="brand_name"
            name="brand_name"
            value={formData.brand_name}
            onChange={handleChange}
            required
            placeholder="Nhập tên thương hiệu"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_type">Loại hình kinh doanh</Label>
          <Input
            id="business_type"
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            required
            placeholder="Nhập loại hình kinh doanh"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="default_language_code">Mã ngôn ngữ</Label>
            <Input
              id="default_language_code"
              name="default_language_code"
              value={formData.default_language_code}
              onChange={handleChange}
              required
              placeholder="en"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_location_code">Mã quốc gia</Label>
            <Input
              id="default_location_code"
              name="default_location_code"
              value={formData.default_location_code}
              onChange={handleChange}
              required
              placeholder="VN"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand_description">Mô tả thương hiệu</Label>
          <Textarea
            id="brand_description"
            name="brand_description"
            value={formData.brand_description}
            onChange={handleChange}
            required
            placeholder="Nhập mô tả thương hiệu"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand_products_services">Sản phẩm/Dịch vụ</Label>
          <Textarea
            id="brand_products_services"
            name="brand_products_services"
            value={formData.brand_products_services}
            onChange={handleChange}
            required
            placeholder="Nhập sản phẩm và dịch vụ"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url">Website URL (không bắt buộc)</Label>
          <Input
            id="website_url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand_logo_url">Logo URL (không bắt buộc)</Label>
          <Input
            id="brand_logo_url"
            name="brand_logo_url"
            value={formData.brand_logo_url}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : initialData ? "Cập nhật thông tin" : "Lưu thông tin"}
        </Button>
      </form>
    </div>
  );
} 