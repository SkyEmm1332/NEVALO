"use client";

import { useState } from "react";
import { createCompany } from "@/app/admin/actions";

export function AdminCompanyCreateForm() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-full bg-gold"
            />
            <h2 className="font-semibold">Créer une entreprise</h2>
          </div>
          <p className="mt-1 text-xs text-muted">
            Ajoutez une nouvelle fiche au registre.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="create-company-form"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-deep"
        >
          {open ? "Fermer" : "Créer une entreprise"}
        </button>
      </div>

      {open ? (
        <form
          id="create-company-form"
          action={createCompany}
          className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2"
        >
          <input
            name="name"
            required
            placeholder="Nom *"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="sector"
            placeholder="Secteur"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="city"
            placeholder="Ville"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="size"
            placeholder="Taille"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <input
            name="website"
            placeholder="Site web"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
          />
          <textarea
            name="description"
            placeholder="Description"
            rows={2}
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent sm:col-span-2"
          />
          <select
            name="status"
            defaultValue="PUBLISHED"
            className="rounded-lg border border-line-strong px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="PUBLISHED">Publier directement</option>
            <option value="PENDING">Mettre en attente</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-deep"
          >
            Créer
          </button>
        </form>
      ) : null}
    </section>
  );
}
