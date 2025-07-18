export function fakeStreamMessage(
  fullContent: string,
  onUpdate: (partial: string) => void,
  onDone?: () => void,
  speed = 20 // ms mỗi ký tự
) {
  let idx = 0;
  const timer = setInterval(() => {
    idx++;
    onUpdate(fullContent.slice(0, idx));
    if (idx >= fullContent.length) {
      clearInterval(timer);
      onDone?.();
    }
  }, speed);
  return () => clearInterval(timer); // trả về hàm cleanup
}
