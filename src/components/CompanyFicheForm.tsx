"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { COVERS } from "@/lib/images";
import { ImagePositionDialog } from "@/components/ImagePositionDialog";
import { updateCompanyFiche } from "@/app/(site)/mon-espace/entreprise/parametres/actions";

type CompanyFiche = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  sector: string | null;
  size: string | null;
  coverKey: string | null;
  coverUrl: string | null;
  logoUrl: string | null;
  logoPosition: string | null;
  bannerPosition: string | null;
};

const FIELD_CLASS =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function CompanyFicheForm({ company }: { company: CompanyFiche }) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [coverKey, setCoverKey] = useState<string | null>(company.coverKey);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoPosition, setLogoPosition] = useState(
    company.logoPosition ?? "50% 50%",
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    company.coverUrl,
  );
  const [bannerPosition, setBannerPosition] = useState(
    company.bannerPosition ?? "50% 50%",
  );

  const [pendingLogo, setPendingLogo] = useState<string | null>(null);
  const [pendingBanner, setPendingBanner] = useState<string | null>(null);

  function readFile(file: File, onReady: (dataUrl: string) => void) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onReady(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function onLogoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    readFile(file, (dataUrl) => setPendingLogo(dataUrl));
  }

  function onBannerSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    readFile(file, (dataUrl) => setPendingBanner(dataUrl));
  }

  const logoDisplay = logoPreview ?? company.logoUrl ?? null;

  return (
    <>
      <form action={updateCompanyFiche} className="mt-8 space-y-8">
        <input type="hidden" name="logoPosition" value={logoPosition} />
        <input type="hidden" name="bannerPosition" value={bannerPosition} />
        <input
          ref={logoInputRef}
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onLogoSelected}
        />
        <input
          ref={bannerInputRef}
          type="file"
          name="banner"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onBannerSelected}
        />

        <section className="rounded-xl border border-line bg-surface p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent font-extrabold text-white"
            >
              {logoDisplay ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoDisplay}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: logoPosition }}
                />
              ) : (
                <span className="text-xl">{initials(company.name)}</span>
              )}
            </button>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
                Logo de l&apos;entreprise
              </p>
              <p className="mt-1 text-sm text-soft">
                {logoDisplay
                  ? "Cliquez pour remplacer le logo."
                  : "Cliquez pour importer un logo."}
              </p>
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="mt-2 inline-flex items-center rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-ink"
              >
                Importer un logo
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-6">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            Informations de la bannière
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-ink">Nom *</span>
              <input
                name="name"
                defaultValue={company.name}
                required
                className={FIELD_CLASS}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Secteur</span>
              <input
                name="sector"
                defaultValue={company.sector ?? ""}
                className={FIELD_CLASS}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Taille</span>
              <input
                name="size"
                defaultValue={company.size ?? ""}
                className={FIELD_CLASS}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Ville</span>
              <input
                name="city"
                defaultValue={company.city ?? ""}
                className={FIELD_CLASS}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Adresse</span>
              <input
                name="address"
                defaultValue={company.address ?? ""}
                className={FIELD_CLASS}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Téléphone</span>
              <input
                name="phone"
                defaultValue={company.phone ?? ""}
                className={FIELD_CLASS}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Email</span>
              <input
                name="email"
                type="email"
                defaultValue={company.email ?? ""}
                className={FIELD_CLASS}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Site web</span>
              <input
                name="website"
                type="url"
                defaultValue={company.website ?? ""}
                className={FIELD_CLASS}
              />
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-ink">Description</span>
            <textarea
              name="description"
              rows={4}
              defaultValue={company.description ?? ""}
              className={`${FIELD_CLASS} resize-y`}
            />
          </label>
        </section>

        <section className="rounded-xl border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              Bannière de couverture
            </p>
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="inline-flex items-center rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-ink"
            >
              Importer une bannière
            </button>
          </div>

          {bannerPreview ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerPreview}
                alt="Bannière importée"
                className="h-40 w-full object-cover"
                style={{ objectPosition: bannerPosition }}
              />
            </div>
          ) : null}

          <p className="mt-4 text-sm text-soft">
            Choisissez une bannière par défaut.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {COVERS.map((cover) => {
              const selected = coverKey === cover.key && !bannerPreview;
              return (
                <label
                  key={cover.key}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition ${
                    selected
                      ? "border-accent ring-2 ring-accent/40"
                      : "border-transparent hover:border-line-strong"
                  }`}
                >
                  <input
                    type="radio"
                    name="coverKey"
                    value={cover.key}
                    checked={selected}
                    onChange={() => {
                      setCoverKey(cover.key);
                      setBannerPreview(null);
                      if (bannerInputRef.current) {
                        bannerInputRef.current.value = "";
                      }
                    }}
                    className="sr-only"
                  />
                  <Image
                    src={cover.src}
                    alt={cover.key}
                    width={160}
                    height={96}
                    className="h-20 w-full object-cover"
                  />
                  {selected ? (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-3.5 w-3.5"
                      >
                        <path
                          d="m5 10 3.5 3.5L15 7"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link
            href="/mon-espace/entreprise"
            className="rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink"
          >
            Annuler
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-soft"
          >
            Enregistrer
          </button>
        </div>
      </form>

      {pendingLogo ? (
        <ImagePositionDialog
          open
          title="Ajuster la position du logo"
          aspect="1 / 1"
          imageSrc={pendingLogo}
          initialPosition={logoPosition}
          onCancel={() => setPendingLogo(null)}
          onConfirm={(position) => {
            setLogoPosition(position);
            setLogoPreview(pendingLogo);
            setPendingLogo(null);
          }}
        />
      ) : null}

      {pendingBanner ? (
        <ImagePositionDialog
          open
          title="Ajuster la position de la bannière"
          aspect="16 / 9"
          imageSrc={pendingBanner}
          initialPosition={bannerPosition}
          onCancel={() => setPendingBanner(null)}
          onConfirm={(position) => {
            setBannerPosition(position);
            setBannerPreview(pendingBanner);
            setCoverKey(null);
            setPendingBanner(null);
          }}
        />
      ) : null}
    </>
  );
}
