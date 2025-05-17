export const registerWithEmail = async ({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) => {
  const res = await fetch("https://aiemployee.site/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  let data;
  try {
    data = await res.json();
  } catch (err) {
    // Nếu không parse được JSON (ví dụ 403 trả về rỗng)
    throw new Error(
      "Không thể đăng ký. Có thể bạn không có quyền truy cập hoặc server từ chối request."
    );
  }
  if (!res.ok) throw new Error(data.message || "Đăng ký thất bại");
  return data;
};
