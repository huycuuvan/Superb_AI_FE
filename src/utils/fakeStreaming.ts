export function fakeStreamMessage(
  fullContent: string,
  onUpdate: (partial: string) => void,
  onDone?: () => void,
  speed = 5, // Giảm xuống 5ms để mượt hơn
  mode: "character" | "word" | "chunk" = "chunk" // Thêm mode chunk để hiển thị theo đoạn
) {
  let idx = 0;

  if (mode === "word") {
    // Hiển thị theo từng từ
    const words = fullContent.split(" ");
    const timer = setInterval(() => {
      idx++;
      const partialContent = words.slice(0, idx).join(" ");
      onUpdate(partialContent);
      if (idx >= words.length) {
        clearInterval(timer);
        onDone?.();
      }
    }, speed * 2); // Giảm xuống speed * 2
    return () => clearInterval(timer);
  } else if (mode === "chunk") {
    // Hiển thị theo từng đoạn (mượt nhất)
    const chunkSize = 3; // Hiển thị 3 ký tự mỗi lần
    const timer = setInterval(() => {
      idx += chunkSize;
      const endIndex = Math.min(idx, fullContent.length);
      onUpdate(fullContent.slice(0, endIndex));
      if (endIndex >= fullContent.length) {
        clearInterval(timer);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(timer);
  } else {
    // Hiển thị theo từng ký tự (mặc định)
    const timer = setInterval(() => {
      idx++;
      onUpdate(fullContent.slice(0, idx));
      if (idx >= fullContent.length) {
        clearInterval(timer);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(timer);
  }
}
