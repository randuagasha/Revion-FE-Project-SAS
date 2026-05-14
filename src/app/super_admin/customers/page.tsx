"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  AlertCircle,
  Loader2,
  Mail,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  Pencil,
  CalendarDays,
} from "lucide-react";

import {
  adminUserService,
  type AdminUser,
} from "@/services/admin-user.service";

const formatDate = (date?: string) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export default function SuperAdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setPageError("");

        const response = await adminUserService.getUsers({
          role: "customer",
        });

        const customerData = (response.data || []).filter((user) => {
          return user.role === "customer";
        });

        setCustomers(customerData);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        setCustomers([]);
        setPageError("Failed to load customer accounts.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  
  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(keyword) ||
        customer.email.toLowerCase().includes(keyword) ||
        customer.role.toLowerCase().includes(keyword)
      );
    });
  }, [customers, search]);

  const handleDeleteCustomer = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer account?",
    );

    if (!confirmDelete) return;

    try {
      setDeleteLoading(id);

      await adminUserService.deleteUser(id);

      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card/40 p-6 backdrop-blur-xl">
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white shadow-lg shadow-[#522C14]/20">
              <Users size={22} />
            </div>

            <p className="mb-2 text-sm text-muted-foreground">
              Customer Management
            </p>

            <h1 className="max-w-2xl text-2xl font-bold leading-tight text-white md:text-3xl">
              Manage Revion customer accounts.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              View, create, update, and remove customer accounts registered in
              the Revion system.
            </p>
          </div>

          <Link
            href="/super_admin/customers/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#522C14] px-5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#63351a]"
          >
            <Plus size={17} />
            Add Customer
          </Link>
        </div>

        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[#522C14]/20 blur-3xl" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <Users size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Total Customers</p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            {customers.length}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Registered customer accounts
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <User size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Role</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Customer</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Booking and vehicle owner
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#522C14] text-white">
            <CalendarDays size={21} />
          </div>

          <p className="text-sm text-muted-foreground">Access</p>
          <h2 className="mt-2 text-3xl font-bold text-white">User</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Can create bookings and tickets
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur-xl">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Customer List</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search and manage all customer accounts.
            </p>
          </div>

          <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-background/40 px-4 lg:w-80">
            <Search size={17} className="text-muted-foreground" />

            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-border">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="animate-spin" size={22} />
              <span className="text-sm font-medium">Loading customers...</span>
            </div>
          </div>
        ) : pageError ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-red-500/20 bg-red-500/5 text-center">
            <AlertCircle size={28} className="mb-4 text-red-400" />
            <h3 className="text-lg font-bold text-white">Failed to load</h3>
            <p className="mt-2 text-sm text-muted-foreground">{pageError}</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
            <AlertCircle size={28} className="mb-4 text-muted-foreground" />
            <h3 className="text-lg font-bold text-white">No customers found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Customer accounts will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-212.5 text-left text-sm">
              <thead className="bg-accent/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-4 font-medium">Customer</th>
                  <th className="px-4 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium">Role</th>
                  <th className="px-4 py-4 font-medium">Created</th>
                  <th className="px-4 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-border transition hover:bg-accent/40"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#522C14] text-white">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-white">
                            {customer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {customer.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail size={16} />
                        {customer.email}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                        Customer
                      </span>
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/super_admin/customers/edit/${customer.id}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:bg-[#522C14] hover:text-white"
                        >
                          <Pencil size={16} />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(customer.id)}
                          disabled={deleteLoading === customer.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deleteLoading === customer.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
