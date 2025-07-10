// src/utils/imageUtils.ts

// Nhận diện base64 image
export const isBase64Image = (url: string) =>
  /^data:image\/[a-z]+;base64,/.test(url.trim());

// Nhận diện link ảnh phổ biến
export const isImageUrl = (url: string) => {
  const ext = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico)(\?.*)?$/i;
  return ext.test(url.trim()) || isBase64Image(url);
};

// Chuyển Dropbox share sang direct link
export const toDirectDropboxLink = (url: string) =>
  url
    .replace("www.dropbox.com", "dl.dropboxusercontent.com")
    .replace("dropbox.com", "dl.dropboxusercontent.com")
    .replace(/\?dl=\d?/, "")
    .replace(/\?raw=\d?/, "");

// Chuyển Google Drive share sang direct link
export const toDirectGoogleDriveLink = (url: string) => {
  const match = url.match(
    /drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)\/view/
  );
  if (match && match[1])
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  // Link Google Drive dạng id trực tiếp
  const idMatch = url.match(/drive\.google\.com\/open\?id=([A-Za-z0-9_-]+)/);
  if (idMatch && idMatch[1])
    return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`;
  return url;
};

// Chuyển các dịch vụ sang direct nếu cần (mở rộng thêm tại đây nếu muốn)
export const getDirectImageUrl = (url: string) => {
  let direct = url.trim();
  if (direct.includes("dropbox.com")) direct = toDirectDropboxLink(direct);
  else if (direct.includes("drive.google.com"))
    direct = toDirectGoogleDriveLink(direct);
  // ...mở rộng imgur, onedrive nếu muốn
  return direct;
};

// Chuyển markdown link hoặc link thuần thành markdown ảnh nếu là ảnh hoặc dịch vụ lưu trữ phổ biến
export const sanitizeMarkdownImages = (text: string) => {
  // Convert [desc](url) -> ![](url) nếu là ảnh
  text = text.replace(
    /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi,
    (match, alt, url) => {
      const directUrl = getDirectImageUrl(url);
      return isImageUrl(directUrl) ? `![](${directUrl})` : match;
    }
  );
  // Convert link thuần -> ![](url) nếu là ảnh
  text = text.replace(/(https?:\/\/[^\s)]+)/gi, (url) => {
    const directUrl = getDirectImageUrl(url);
    return isImageUrl(directUrl) ? `![](${directUrl})` : url;
  });
  return text;
};
