import { useEffect, useState } from "react";

export function useLiveClock() {
  // Start null on server + first render to avoid SSR/client mismatch.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function formatTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}
