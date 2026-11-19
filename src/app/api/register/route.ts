import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email as string)?.trim().toLowerCase();
    const password = body.password as string;
    const name = (body.name as string)?.trim() || null;
    const jobTitle = (body.jobTitle as string)?.trim() || null;
    const salaryInput = body.salary;
    const salary =
      salaryInput === undefined || salaryInput === null || salaryInput === ""
        ? null
        : Number(salaryInput);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 },
      );
    }

    if (!name || name.length < 2 || name.length > 30) {
      return NextResponse.json(
        { error: "Le nom affiché doit contenir entre 2 et 30 caractères." },
        { status: 400 },
      );
    }

    if (jobTitle && jobTitle.length > 80) {
      return NextResponse.json(
        { error: "Le poste ne doit pas dépasser 80 caractères." },
        { status: 400 },
      );
    }

    if (
      salary !== null &&
      (!Number.isInteger(salary) || salary < 0 || salary > 100_000_000)
    ) {
      return NextResponse.json(
        { error: "La rémunération doit être un montant valide." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, passwordHash, name, jobTitle, salary },
    });

    return NextResponse.json(
      { id: user.id, email: user.email },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue." },
      { status: 500 },
    );
  }
}
