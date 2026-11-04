import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CRITERIA = [
  "AMBIANCE",
  "MANAGEMENT",
  "REMUNERATION",
  "EVOLUTION",
  "WORKLOAD",
  "WORK_LIFE_BALANCE",
  "RECOGNITION",
  "WORK_CONDITIONS",
  "STABILITY",
];

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const contribPassword = await bcrypt.hash("Contributeur1!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nevalo.ci" },
    update: {},
    create: {
      email: "admin@nevalo.ci",
      passwordHash: adminPassword,
      name: "Administrateur NEVALO",
      role: "ADMIN",
    },
  });
  console.log("Admin:", admin.email);

  const contributor = await prisma.user.upsert({
    where: { email: "contributeur@nevalo.ci" },
    update: {},
    create: {
      email: "contributeur@nevalo.ci",
      passwordHash: contribPassword,
      name: "Aya Koné",
      role: "CONTRIBUTOR",
    },
  });
  console.log("Contributeur:", contributor.email);

  const companies = [
    {
      name: "Ivoire Tech",
      sector: "Technologie",
      city: "Abidjan",
      size: "50-200 employés",
      description: "Entreprise de services numériques basée à Abidjan.",
      website: "https://ivoiretech.ci",
      email: "contact@ivoiretech.ci",
      phone: "+225 27 22 49 80 00",
      address: "Boulevard Latrille, Cocody, Abidjan",
    },
    {
      name: "AgriSud Côte d'Ivoire",
      sector: "Agroalimentaire",
      city: "Yamoussoukro",
      size: "200-1000 employés",
      description: "Transformation et exportation de produits agricoles.",
      website: "https://agrisud.ci",
      email: "contact@agrisud.ci",
      phone: "+225 27 30 64 12 00",
      address: "Zone industrielle, Yamoussoukro",
    },
    {
      name: "Banque Atlantique CI",
      sector: "Finance",
      city: "Abidjan",
      size: "Plus de 1000 employés",
      description: "Établissement bancaire de premier plan.",
      website: "https://banqueatlantique.net",
      email: "contact@banqueatlantique.ci",
      phone: "+225 27 20 21 30 00",
      address: "Avenue Delafosse, Plateau, Abidjan",
    },
    {
      name: "Santé Plus Clinique",
      sector: "Santé",
      city: "Abidjan",
      size: "50-200 employés",
      description: "Réseau de cliniques privées.",
      website: "https://santeplus.ci",
      email: "contact@santeplus.ci",
      phone: "+225 27 22 47 55 00",
      address: "Rue des Jardins, Deux Plateaux, Abidjan",
    },
    {
      name: "BTP Bâtisseurs Ivoiriens",
      sector: "Construction",
      city: "Bouaké",
      size: "200-1000 employés",
      description: "Groupe de construction et travaux publics.",
      website: "https://btpbi.ci",
      email: "contact@btpbi.ci",
      phone: "+225 27 31 63 40 00",
      address: "Quartier Air France, Bouaké",
    },
  ];

  const companyIds = {};
  for (const c of companies) {
    const created = await prisma.company.upsert({
      where: { slug: slugify(c.name) },
      update: c,
      create: {
        ...c,
        slug: slugify(c.name),
        status: "PUBLISHED",
      },
    });
    companyIds[c.name] = created.id;
  }
  console.log("Entreprises créées:", companies.length);

  const reviewCount = await prisma.review.count();
  if (reviewCount === 0) {
    const seedReviews = [
      {
        company: "Ivoire Tech",
        jobTitle: "Développeur web",
        contractType: "CDI",
        visibility: "ANONYMOUS",
        positives:
          "Équipe jeune et soudée, projets variés, télétravail possible.",
        negatives: "Horaires parfois chargés en fin de sprint.",
        ratings: {
          AMBIANCE: 4,
          MANAGEMENT: 3,
          REMUNERATION: 3,
          EVOLUTION: 4,
          WORKLOAD: 3,
          WORK_LIFE_BALANCE: 3,
          RECOGNITION: 4,
          WORK_CONDITIONS: 4,
          STABILITY: 4,
        },
        salary: { amount: 350000, isNet: true, period: "MONTHLY" },
        isCurrent: true,
        location: "Abidjan",
        recommend: true,
      },
      {
        company: "Ivoire Tech",
        jobTitle: "Chef de projet",
        contractType: "CDI",
        visibility: "NOMINATIVE",
        positives: "Bonne ambiance, management à l'écoute, primes annuelles.",
        negatives: "Pression sur les délais clients.",
        ratings: {
          AMBIANCE: 4,
          MANAGEMENT: 4,
          REMUNERATION: 4,
          EVOLUTION: 3,
          WORKLOAD: 3,
          WORK_LIFE_BALANCE: 3,
          RECOGNITION: 4,
          WORK_CONDITIONS: 4,
          STABILITY: 4,
        },
        salary: { amount: 600000, isNet: true, period: "MONTHLY" },
        isCurrent: true,
        location: "Abidjan",
        recommend: true,
      },
      {
        company: "Ivoire Tech",
        jobTitle: "Stagiaire développeur",
        contractType: "Stage",
        visibility: "ANONYMOUS",
        positives: "Très formateur, mentorat de qualité.",
        negatives: "Indemnité de stage faible.",
        ratings: {
          AMBIANCE: 5,
          MANAGEMENT: 4,
          REMUNERATION: 2,
          EVOLUTION: 4,
          WORKLOAD: 3,
          WORK_LIFE_BALANCE: 4,
          RECOGNITION: 3,
          WORK_CONDITIONS: 4,
          STABILITY: 2,
        },
        salary: { amount: 100000, isNet: true, period: "MONTHLY" },
        isCurrent: false,
        location: "Abidjan",
        recommend: true,
      },
      {
        company: "Banque Atlantique CI",
        jobTitle: "Chargé de clientèle",
        contractType: "CDI",
        visibility: "ANONYMOUS",
        positives: "Sécurité de l'emploi, avantages sociaux, formation continue.",
        negatives: "Hiérarchie rigide, peu de télétravail.",
        ratings: {
          AMBIANCE: 3,
          MANAGEMENT: 3,
          REMUNERATION: 4,
          EVOLUTION: 3,
          WORKLOAD: 3,
          WORK_LIFE_BALANCE: 2,
          RECOGNITION: 3,
          WORK_CONDITIONS: 3,
          STABILITY: 5,
        },
        salary: { amount: 450000, isNet: true, period: "MONTHLY" },
        isCurrent: true,
        location: "Abidjan",
        recommend: true,
      },
      {
        company: "Banque Atlantique CI",
        jobTitle: "Analyste risques",
        contractType: "CDI",
        visibility: "ANONYMOUS",
        positives: "Rémunération correcte, stabilité.",
        negatives: "Beaucoup d'heures supplémentaires non rémunérées.",
        ratings: {
          AMBIANCE: 3,
          MANAGEMENT: 3,
          REMUNERATION: 4,
          EVOLUTION: 2,
          WORKLOAD: 2,
          WORK_LIFE_BALANCE: 2,
          RECOGNITION: 3,
          WORK_CONDITIONS: 4,
          STABILITY: 5,
        },
        salary: { amount: 700000, isNet: true, period: "MONTHLY" },
        isCurrent: true,
        location: "Abidjan",
        recommend: false,
      },
      {
        company: "AgriSud Côte d'Ivoire",
        jobTitle: "Responsable logistique",
        contractType: "CDD",
        visibility: "ANONYMOUS",
        positives: "Entreprise stable, bonne entente entre services.",
        negatives: "Localisation éloignée, moyens matériels limités.",
        ratings: {
          AMBIANCE: 4,
          MANAGEMENT: 3,
          REMUNERATION: 3,
          EVOLUTION: 2,
          WORKLOAD: 3,
          WORK_LIFE_BALANCE: 3,
          RECOGNITION: 3,
          WORK_CONDITIONS: 3,
          STABILITY: 4,
        },
        salary: { amount: 300000, isNet: true, period: "MONTHLY" },
        isCurrent: false,
        location: "Yamoussoukro",
        recommend: true,
      },
    ];

    for (const r of seedReviews) {
      await prisma.review.create({
        data: {
          authorId: contributor.id,
          companyId: companyIds[r.company],
          jobTitle: r.jobTitle,
          contractType: r.contractType,
          location: r.location,
          isCurrent: r.isCurrent,
          recommend: r.recommend,
          visibility: r.visibility,
          status: "PUBLISHED",
          publishedAt: new Date(),
          positives: r.positives,
          negatives: r.negatives,
          ratings: {
            create: CRITERIA.map((criterion) => ({
              criterion,
              score: r.ratings[criterion],
            })),
          },
          salaryReport: {
            create: {
              companyId: companyIds[r.company],
              jobTitle: r.jobTitle,
              amount: r.salary.amount,
              isNet: r.salary.isNet,
              period: r.salary.period,
            },
          },
        },
      });
    }
    console.log("Avis de démonstration créés:", seedReviews.length);
  } else {
    console.log("Avis déjà présents, seed ignoré.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
