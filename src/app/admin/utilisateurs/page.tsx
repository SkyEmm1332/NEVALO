import { prisma } from "@/lib/prisma";
import { setUserRole } from "@/app/admin/actions";
import type { UserRole } from "@prisma/client";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "CONTRIBUTOR", label: "Contributeur" },
  { value: "REPRESENTATIVE", label: "Représentant" },
  { value: "MODERATOR", label: "Modérateur" },
  { value: "ADMIN", label: "Administrateur" },
];

const ROLE_LABEL = Object.fromEntries(
  ROLES.map((r) => [r.value, r.label]),
) as Record<UserRole, string>;

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { reviews: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gérez les comptes et les rôles d&apos;accès.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Avis</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Changer le rôle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium">{u.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3 text-slate-500">{u._count.reviews}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <form action={setUserRole} className="flex gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-brand"
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                    >
                      Appliquer
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
