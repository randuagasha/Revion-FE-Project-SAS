"use client";

import CustomerSidebar from "./components/sidebar";
import CustomerTopbar from "./components/topbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CustomerSidebar />

      <main className="ml-67.5 min-h-screen flex flex-col">
        <CustomerTopbar />

        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
