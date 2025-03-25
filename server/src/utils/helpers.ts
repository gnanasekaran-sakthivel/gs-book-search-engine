export function getTimestamp(): string {
  const now = new Date();
  const hrTime = process.hrtime(); // High-resolution time
  const nano = hrTime[1].toString().padStart(9, "0"); // Nanoseconds

  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `${dd}${mm}${yyyy}-${hh}${min}${ss}.${nano}`;
}
