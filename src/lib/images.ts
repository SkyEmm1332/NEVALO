export const PHOTOS = {
  hero: "/images/hero.jpg",
  howItWorks: "/images/how-it-works.jpg",
  methodology: "/images/methodology.jpg",
  mission: "/images/mission.jpg",
  trust: "/images/trust.jpg",
  city: "/images/city.jpg",
  contact: "/images/contact.jpg",
};

export const COVERS = [
  { key: "cover-01", src: "/images/cover-01.jpg" },
  { key: "cover-02", src: "/images/cover-02.jpg" },
  { key: "cover-03", src: "/images/cover-03.jpg" },
  { key: "cover-04", src: "/images/cover-04.jpg" },
  { key: "cover-05", src: "/images/cover-05.jpg" },
  { key: "cover-06", src: "/images/cover-06.jpg" },
  { key: "cover-07", src: "/images/cover-07.jpg" },
  { key: "cover-08", src: "/images/cover-08.jpg" },
  { key: "cover-09", src: "/images/cover-09.jpg" },
  { key: "cover-10", src: "/images/cover-10.jpg" },
] as const;

export type CoverKey = (typeof COVERS)[number]["key"];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function companyCover(name: string, coverKey?: string | null): string {
  const selected = COVERS.find((cover) => cover.key === coverKey);
  if (selected) return selected.src;
  return COVERS[hash(name) % COVERS.length].src;
}
