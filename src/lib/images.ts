const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PHOTOS = {
  hero: u("photo-1531482615713-2afd69097998", 1600),
  howItWorks: u("photo-1531545514256-b1400bc00f31", 1200),
  methodology: u("photo-1552664730-d307ca884978", 1200),
  mission: u("photo-1542744173-8e7e53415bb0", 1600),
  trust: u("photo-1521791136064-7986c2920216", 2400),
  city: u("photo-1560179707-f14e90ef3623", 2400),
  contact: u("photo-1551836022-d5d88e9218df", 1200),
};

const COVERS = [
  u("photo-1542744173-8e7e53415bb0", 1200),
  u("photo-1556761175-b413da4baf72", 1200),
  u("photo-1497366811353-6870744d04b2", 1200),
  u("photo-1524758631624-e2822e304c36", 1200),
  u("photo-1556761175-5973dc0f32e7", 1200),
  u("photo-1521737711867-e3b97375f902", 1200),
  u("photo-1521737604893-d14cc237f11d", 1200),
  u("photo-1522202176988-66273c2fd55f", 1200),
  u("photo-1531545514256-b1400bc00f31", 1200),
  u("photo-1600880292203-757bb62b4baf", 1200),
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
