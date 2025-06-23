import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { createCredential, getCredentials, deleteCredential } from '@/services/api';

// Định nghĩa interface Credential tạm thời
interface Credential {
  id: string;
  provider: string;
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

  // Fetch credentials khi mở trang hoặc sau khi tạo mới
  const fetchCredentials = async () => {
    setLoadingList(true);
    setListError('');
    try {
      const res = await getCredentials();
      setCredentials(Array.isArray(res) ? res : (res.data || []));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    let credentialObj;
    try {
      credentialObj = JSON.parse(credentialStr);
    } catch {
      setError('Credential phải là một JSON hợp lệ!');
      return;
    }
    setLoading(true);
    try {
      await createCredential({ provider, credential: credentialObj });
      setSuccess('Tạo credential thành công!');
      setShowCreate(false);
      setCredentialStr('');
      setProvider('google');
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : 'Tạo credential thất bại'));
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
              {credentials.map((cred) => (
                <div key={cred.id} className="border rounded-lg p-4 flex items-center justify-between bg-muted/30">
                  <div>
                    <div className="font-semibold text-foreground capitalize">{cred.provider}</div>
                    
                    <div className="text-xs text-muted-foreground">Ngày tạo: {cred.created_at ? new Date(cred.created_at).toLocaleString('vi-VN') : ''}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Token:
                      <span className="font-mono ml-1">
                        {cred.credential && (cred.credential as Record<string, unknown>).token &&
                          typeof (cred.credential as Record<string, unknown>).token === 'string'
                          ? ((cred.credential as Record<string, unknown>).token as string).slice(0, 4) + '...' + ((cred.credential as Record<string, unknown>).token as string).slice(-4)
                          : '[Ẩn]'}
                      </span>
                      {cred.credential && (cred.credential as Record<string, unknown>).token &&
                        typeof (cred.credential as Record<string, unknown>).token === 'string' && (
                        <button
                          className="ml-2 text-blue-500 underline text-xs"
                          onClick={() => navigator.clipboard.writeText((cred.credential as Record<string, unknown>).token as string)}
                          type="button"
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cred.id.toString())}>Xóa</Button>
                </div>
              ))}
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
            <h3 className="text-2xl font-bold mb-4 text-center text-foreground dark:text-white">Thêm Credential mới</h3>
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">Provider</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 bg-background dark:bg-slate-800 text-foreground dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none transition"
                value={provider}
                onChange={e => setProvider(e.target.value)}
                disabled={loading}
              >
                <option value="google">Google</option>
                <option value="aws">AWS</option>
                <option value="openai">OpenAI</option>
                <option value="facebook">Facebook</option>
                {/* Thêm provider khác nếu cần */}
              </select>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2 text-foreground dark:text-white">Credential (JSON)</label>
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 font-mono text-sm bg-background dark:bg-slate-800 text-foreground dark:text-white focus:ring-2 focus:ring-primary/40 focus:outline-none transition"
                rows={6}
                value={credentialStr}
                onChange={e => setCredentialStr(e.target.value)}
                placeholder='{"client_id": "...", "client_secret": "..."}'
                disabled={loading}
              />
            </div>
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