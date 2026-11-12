export const PHOTOS = {
  hero: "/images/hero.jpg",
  howItWorks: "/images/how-it-works.jpg",
  methodology: "/images/methodology.jpg",
  mission: "/images/mission.jpg",
  trust: "/images/trust.jpg",
  city: "/images/city.jpg",
  contact: "/images/contact.jpg",
};

const COVERS = [
  "/images/cover-01.jpg",
  "/images/cover-02.jpg",
  "/images/cover-03.jpg",
  "/images/cover-04.jpg",
  "/images/cover-05.jpg",
  "/images/cover-06.jpg",
  "/images/cover-07.jpg",
  "/images/cover-08.jpg",
  "/images/cover-09.jpg",
  "/images/cover-10.jpg",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function companyCover(name: string): string {
  return COVERS[hash(name) % COVERS.length];
}
