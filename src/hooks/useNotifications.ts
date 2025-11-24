"use client";
import { useEffect, useState, useRef } from "react";
import { listNotifications, markNotificationRead } from "@/api/notifications";

export function useNotifications(pollInterval = 15000) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef<number | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await listNotifications();
      const data = res.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.leida).length);
    } catch (err) {
      // ignore errors silently for now
    }
  };

  useEffect(() => {
    fetchNotifications();
    timerRef.current = window.setInterval(fetchNotifications, pollInterval) as unknown as number;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      // update local state optimistically
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      // ignore
    }
  };

  return { notifications, unreadCount, refresh: fetchNotifications, markRead };
}
