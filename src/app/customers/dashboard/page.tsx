"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// types optional (biar rapi nanti)
type DashboardData = {
  stats: any;
  bookings: any[];
  activities: any[];
  services: any[];
  trends: any[];
};

export function Overview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/overview");
        setData(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "#fff", padding: 20 }}>Loading dashboard...</div>
    );
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* nanti tinggal pakai data.stats, data.bookings, dll */}
      <h1 style={{ color: "#fff" }}>Dashboard Ready (API Connected)</h1>
    </div>
  );
}
