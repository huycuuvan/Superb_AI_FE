import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash } from 'lucide-react';
import { createCredential, getCredentials, deleteCredential } from '@/services/api';
import { CREDENTIAL_SCHEMAS, ProviderSchema, CredentialField } from '@/data/credentialSchemas';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Định nghĩa interface Credential tạm thời
interface Credential {
  id: string;
  provider: string;
  name: string;
  credential: object;
  created_at?: string;
}

export default function CredentialsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [provider, setProvider] = useState('google');
  const [credentialStr, setCredentialStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // State cho danh sách credential
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState('');

  // Thay thế state form động
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedProvider, setSelectedProvider] = useState<ProviderSchema>(CREDENTIAL_SCHEMAS[0]);

  // Thêm state cho name
  const [credentialName, setCredentialName] = useState('');

  // Thêm state cho edit
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);

  const { toast } = useToast();

  // Fetch credentials khi mở trang hoặc sau khi tạo mới
  const fetchCredentials = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const res = await getCredentials();
      // Đảm bảo luôn là mảng, tránh lỗi khi res hoặc res.data là null
      setCredentials(Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []));
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách credential');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  // Khi tạo mới thành công, reload list
  useEffect(() => {
    if (success) fetchCredentials();
  }, [success]);

  // Khi chọn provider, reset form động
  useEffect(() => {
    setForm({});
    setFormErrors({});
  }, [selectedProvider]);

  // Validate động
  const validateForm = () => {
    const errors: Record<string, string> = {};
    // Validate name
    if (!credentialName.trim()) {
      errors.name = 'Tên credential là bắt buộc';
    }
    selectedProvider.fields.forEach(field => {
      if (field.required && !form[field.name]) {
        errors[field.name] = `${field.label} là bắt buộc`;
      }
      // Validate email
      if (field.type === 'email' && form[field.name]) {
        const val = String(form[field.name]);
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
          errors[field.name] = 'Email không hợp lệ';
        }
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Xử lý xóa credential
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa credential này?')) return;
    try {
      await deleteCredential(id);
      fetchCredentials();
    } catch (err) {
      alert('Xóa credential thất bại');
    }
  };

  // Khi bấm Edit
  const handleEdit = (cred: Credential) => {
    setEditingCredential(cred);
    setShowCreate(true);
    setSelectedProvider(CREDENTIAL_SCHEMAS.find(s => s.provider === cred.provider) || CREDENTIAL_SCHEMAS[0]);
    setCredentialName(cred.name || '');
    // Populate form động
    const formObj: Record<string, unknown> = {};
    const schema = CREDENTIAL_SCHEMAS.find(s => s.provider === cred.provider);
    if (schema) {
      schema.fields.forEach(field => {
        formObj[field.name] = cred.credential[field.name];
      });
    }
    setForm(formObj);
  };

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Chuẩn bị object credential
      const credentialObj: Record<string, unknown> = {};
      selectedProvider.fields.forEach(field => {
        credentialObj[field.name] = form[field.name];
      });
      if (editingCredential) {
        // (Chỉ sketch logic, chưa code updateCredential API)
        // await updateCredential(editingCredential.id, {
        //   provider: selectedProvider.provider,
        //   name: credentialName.trim(),
        //   credential: credentialObj
        // });
        // setSuccess('Cập nhật credential thành công!');
        // setEditingCredential(null);
        // setShowCreate(false);
        // setForm({});
        // setCredentialName('');
        // setSelectedProvider(CREDENTIAL_SCHEMAS[0]);
        // toast({ title: 'Thành công', description: 'Cập nhật credential thành công!' });
      } else {
        await createCredential({ 
          provider: selectedProvider.provider, 
          name: credentialName.trim(),
          credential: credentialObj 
        });
        setSuccess('Tạo credential thành công!');
        setShowCreate(false);
        setForm({});
        setCredentialName('');
        setSelectedProvider(CREDENTIAL_SCHEMAS[0]);
        toast({ title: 'Thành công', description: 'Tạo credential thành công!' });
      }
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : 'Tạo credential thất bại'));
      toast({ title: 'Lỗi', description: err instanceof Error ? err.message : 'Tạo credential thất bại', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quản lý Credential</CardTitle>
          <CardDescription>
            Lưu trữ và quản lý các thông tin xác thực (API key, OAuth, v.v) cho các dịch vụ bên ngoài như Google, AWS...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowCreate(true)} className="mb-4">
            <Plus className="mr-2 h-4 w-4" /> Thêm Credential mới
          </Button>
          {/* Hiển thị danh sách credential */}
          {loadingList ? (
            <div className="text-muted-foreground text-sm">Đang tải danh sách...</div>
          ) : listError ? (
            <div className="text-red-600 text-sm">{listError}</div>
          ) : credentials.length === 0 ? (
            <div className="text-muted-foreground text-sm">Chưa có credential nào.</div>
          ) : (
            <div className="space-y-3">
              {credentials.map((cred) => {
                const schema = CREDENTIAL_SCHEMAS.find(s => s.provider === cred.provider);
                return (
                  <div key={cred.id} className="border rounded-lg p-4 flex items-center justify-between bg-muted/30">
                    <div>
                      <div className="font-semibold text-foreground capitalize">{cred.name || schema?.name || cred.provider}</div>
                      <div className="text-xs text-muted-foreground">Ngày tạo: {cred.created_at ? new Date(cred.created_at).toLocaleString('vi-VN') : ''}</div>
                      {/* Hiển thị các trường quan trọng */}
                      {schema?.fields.filter(f => f.sensitive || f.required).map(field => (
                        <div key={field.name} className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          {field.label}: 
                          <SensitiveField value={cred.credential?.[field.name]} sensitive={!!field.sensitive} />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => handleEdit(cred)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(cred.id.toString())}><Trash className="w-4 h-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Form tạo mới credential */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <form
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-border animate-in fade-in-50 duration-200"
            onSubmit={handleSubmit}
          >
            {/* Banner hướng dẫn */}
          
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">Tên Credential <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full border border-border rounded-lg px-3 py-2 bg-background dark:bg-slate-800 text-foreground dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none transition"
                value={credentialName}
                onChange={e => setCredentialName(e.target.value)}
                placeholder="Nhập tên credential (ví dụ: Facebook A, Google Ads Main)"
                disabled={loading}
              />
              {formErrors.name && <div className="text-red-600 text-xs mt-1">{formErrors.name}</div>}
            </div>
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">Provider</label>
              <Select 
                value={String(selectedProvider.provider)}
                onValueChange={value => {
                  const found = CREDENTIAL_SCHEMAS.find(s => s.provider === value);
                  if (found) setSelectedProvider(found);
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-full border border-border rounded-lg px-3 py-2 bg-background dark:bg-slate-800 text-foreground dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none transition">
                  <SelectValue placeholder="Chọn provider" />
                </SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_SCHEMAS.map(schema => (
                    <SelectItem key={schema.provider} value={schema.provider}>{schema.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Render động các trường credential */}
            {selectedProvider.fields.map(field => (
              <div className="mb-5" key={field.name}>
                <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label>
                {field.type === 'file' ? (
                  <input
                    type="file"
                    className="w-full border border-border rounded-lg px-3 py-2 bg-background dark:bg-slate-800 text-foreground dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none transition"
                    onChange={e => setForm(f => ({ ...f, [field.name]: e.target.files?.[0] }))}
                    disabled={loading}
                  />
                ) : (
                  <input
                    type={field.type === 'password' ? 'password' : field.type}
                    className="w-full border border-border rounded-lg px-3 py-2 font-mono text-sm bg-background dark:bg-slate-800 text-foreground dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none transition"
                    value={form[field.name] !== undefined && form[field.name] !== null ? String(form[field.name]) : ''}
                    onChange={e => setForm(f => ({ ...f, [field.name]: e.target.value }))}
                    placeholder={field.placeholder || ''}
                    disabled={loading}
                  />
                )}
                {field.description && <div className="text-xs text-muted-foreground mt-1">{field.description}</div>}
                {formErrors[field.name] && <div className="text-red-600 text-xs mt-1">{formErrors[field.name]}</div>}
              </div>
            ))}
            {error && <div className="text-red-600 text-sm mb-3 text-center">{error}</div>}
            {success && <div className="text-green-600 text-sm mb-3 text-center">{success}</div>}
            <div className="flex gap-3 mt-6">
              <Button type="submit" disabled={loading} className="w-1/2 text-base font-semibold">
                {loading ? 'Đang lưu...' : 'Lưu credential'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={loading} className="w-1/2 text-base font-semibold">
                Đóng
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 

// Component ẩn/hiện trường nhạy cảm
function SensitiveField({ value, sensitive }: { value: unknown, sensitive?: boolean }): React.ReactElement {
  const [show, setShow] = useState(false);
  if (!value) return <span className="font-mono">[Ẩn]</span>;
  if (!sensitive) return <span className="font-mono">{String(value)}</span>;
  return (
    <span className="font-mono">
      {show ? String(value) : '****'}
      <button type="button" className="ml-2 text-blue-500 underline text-xs" onClick={() => setShow(s => !s)}>
        {show ? 'Ẩn' : 'Hiện'}
      </button>
      {show && (
        <button type="button" className="ml-2 text-blue-500 underline text-xs" onClick={() => navigator.clipboard.writeText(typeof value === 'string' ? value : String(value))}>
          Copy
        </button>
      )}
    </span>
  );
} 