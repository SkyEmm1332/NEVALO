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
    <div className="flex min-h-screen bg-paper">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-ink md:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <span className="text-lg font-extrabold uppercase tracking-tight text-white">
            NEVALO
          </span>
          <span className="ml-2 rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav />
        </div>

        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium text-white">
            {session.user.name ?? "Administrateur"}
          </p>
          <p className="truncate text-xs text-paper/50">{session.user.email}</p>
          <div className="mt-3 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs text-teal hover:text-white hover:underline"
            >
              Voir le site
            </Link>
            <span className="text-paper/40">
              <LogoutButton className="text-xs text-paper/50 hover:text-white" />
            </span>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-4 md:px-6">
          <span className="truncate text-sm font-medium text-muted">
            Administration NEVALO
          </span>
          <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
            <Link href="/" className="hover:text-ink md:hidden">
              Voir le site
            </Link>
            <LogoutButton className="text-xs text-muted hover:text-ink md:hidden" />
            <span className="hidden md:inline">
              {session.user.role === "ADMIN" ? "Administrateur" : "Modérateur"}
            </span>
          </div>
        </header>
        <div className="border-b border-line bg-ink px-3 py-2 md:hidden">
          <AdminNav variant="horizontal" />
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
