import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col bg-slate-900">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <span className="text-lg font-bold text-white">NEVALO</span>
          <span className="ml-2 rounded bg-indigo-600 px-1.5 py-0.5 text-xs font-semibold text-white">
            Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav />
        </div>

        <div className="border-t border-slate-800 p-4">
          <p className="truncate text-sm font-medium text-white">
            {session.user.name ?? "Administrateur"}
          </p>
          <p className="truncate text-xs text-slate-400">
            {session.user.email}
          </p>
          <div className="mt-3 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline"
            >
              Voir le site
            </Link>
            <span className="text-slate-500">
              <LogoutButton className="text-xs text-slate-400 hover:text-white" />
            </span>
          </div>
        </div>
      </aside>

      <div className="ml-64 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <span className="text-sm font-medium text-slate-500">
            Administration NEVALO
          </span>
          <span className="text-xs text-slate-400">
            {session.user.role === "ADMIN" ? "Administrateur" : "Modérateur"}
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
