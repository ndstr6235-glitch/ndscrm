import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // -----------------------------------------------------------------------
  // Users
  // -----------------------------------------------------------------------
  const users = [
    {
      id: "u1",
      firstName: "Martin",
      lastName: "Kovář",
      email: "admin@buildfund.cz",
      password: "admin123",
      role: "ADMINISTRATOR" as const,
      active: true,
      signature:
        "S úctou,\nMartin Kovář\nBuild Fund | CEO\n+420 777 123 456\nwww.buildfund.cz",
    },
    {
      id: "u2",
      firstName: "Jana",
      lastName: "Procházková",
      email: "supervisor@buildfund.cz",
      password: "super123",
      role: "SUPERVISOR" as const,
      active: true,
      signature:
        "S úctou,\nJana Procházková\nBuild Fund | Vedoucí týmu\n+420 777 234 567",
    },
    {
      id: "u3",
      firstName: "Tomáš",
      lastName: "Novák",
      email: "broker1@buildfund.cz",
      password: "broker123",
      role: "BROKER" as const,
      active: true,
      signature:
        "S pozdravem,\nTomáš Novák\nBuild Fund | Investiční poradce\n+420 777 345 678",
    },
    {
      id: "u4",
      firstName: "Petra",
      lastName: "Horáková",
      email: "broker2@buildfund.cz",
      password: "broker456",
      role: "BROKER" as const,
      active: true,
      signature:
        "S pozdravem,\nPetra Horáková\nBuild Fund | Investiční poradce\n+420 777 456 789",
    },
  ];

  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        password: hashed,
        role: u.role,
        active: u.active,
        signature: u.signature,
      },
    });
  }
  console.log("  Users seeded.");

  // -----------------------------------------------------------------------
  // Email Templates
  // -----------------------------------------------------------------------
  const templates = [
    {
      id: "t1",
      label: "Prezentace",
      subject: "Exkluzivní investiční příležitost – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\ndovolte, abych Vám představil/a investiční platformu Build Fund.\n\nNabízíme:\n• Roční výnos 8–14 % p.a.\n• Plná transparentnost a měsíční výpisy\n• Minimální vstup od 50 000 Kč\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t2",
      label: "Návrh smlouvy",
      subject: "Investiční smlouva – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\nzasílám Vám investiční smlouvu k prostudování a podpisu.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t3",
      label: "Smlouva finální",
      subject: "Finální investiční smlouva – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\nv příloze zasílám finální investiční smlouvu k podpisu.\n\nProsím o prostudování a zaslání podepsané verze zpět.\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR",
    },
    {
      id: "t4",
      label: "Úrok – měsíční výpis",
      subject: "Měsíční výpis výnosu – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\nzasílám měsíční přehled výnosu z Vaší investice.\n\nPřipsaný výnos: [CASTKA]\nCelkový vložený kapitál: [VKLAD]\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
    {
      id: "t5",
      label: "Follow-up",
      subject: "Navazuji na náš hovor – Build Fund",
      body: "Vážený/á [OSLOVENÍ],\n\nnavazuji na náš nedávný hovor. Rád/a bych domluvil/a schůzku.\n\nKdy by Vám vyhovovalo?\n\n[PODPIS]",
      allowedRoles: "ADMINISTRATOR,SUPERVISOR,BROKER",
    },
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
  }
  console.log("  Email templates seeded.");

  // -----------------------------------------------------------------------
  // Clients (6 demo clients with realistic Czech names)
  // -----------------------------------------------------------------------
  const clients = [
    {
      id: "c1",
      firstName: "Karel",
      lastName: "Dvořák",
      phone: "+420 602 111 222",
      email: "karel.dvorak@email.cz",
      callDate: "2025-11-10",
      nextPaymentDate: "2026-04-10",
      paymentFreq: 30,
      note: "Zkušený investor, zájem o vyšší vklady",
      assignedTo: "u3",
    },
    {
      id: "c2",
      firstName: "Eva",
      lastName: "Svobodová",
      phone: "+420 603 222 333",
      email: "eva.svobodova@email.cz",
      callDate: "2025-12-05",
      nextPaymentDate: "2026-04-05",
      paymentFreq: 30,
      note: "Opatrná investorka, preferuje nižší riziko",
      assignedTo: "u3",
    },
    {
      id: "c3",
      firstName: "Jiří",
      lastName: "Černý",
      phone: "+420 604 333 444",
      email: "jiri.cerny@email.cz",
      callDate: "2026-01-15",
      nextPaymentDate: "2026-04-15",
      paymentFreq: 30,
      note: "Podnikatel, zajímá se o stavební projekty",
      assignedTo: "u4",
    },
    {
      id: "c4",
      firstName: "Marie",
      lastName: "Veselá",
      phone: "+420 605 444 555",
      email: "marie.vesela@email.cz",
      callDate: "2026-01-20",
      nextPaymentDate: "2026-04-20",
      paymentFreq: 60,
      note: "Důchodkyně, konzervativní profil",
      assignedTo: "u4",
    },
    {
      id: "c5",
      firstName: "Lukáš",
      lastName: "Němec",
      phone: "+420 606 555 666",
      email: "lukas.nemec@email.cz",
      callDate: "2026-02-01",
      nextPaymentDate: "2026-05-01",
      paymentFreq: 30,
      note: "Mladý profesionál, první investice",
      assignedTo: "u3",
    },
    {
      id: "c6",
      firstName: "Alena",
      lastName: "Krejčí",
      phone: "+420 607 666 777",
      email: "alena.krejci@email.cz",
      callDate: "2026-02-15",
      nextPaymentDate: "2026-05-15",
      paymentFreq: 30,
      note: "Referral od Karla Dvořáka, vysoký potenciál",
      assignedTo: "u3",
    },
  ];

  for (const c of clients) {
    await prisma.client.upsert({
      where: { id: c.id },
      update: {},
      create: c,
    });
  }
  console.log("  Clients seeded.");

  // -----------------------------------------------------------------------
  // Payments (12 demo payments spread across clients)
  // -----------------------------------------------------------------------
  const payments = [
    { id: "p1", amount: 500000, percent: 10, profit: 50000, date: "2025-12-10", note: "Vstupní investice", clientId: "c1" },
    { id: "p2", amount: 200000, percent: 10, profit: 20000, date: "2026-01-10", note: "Navýšení", clientId: "c1" },
    { id: "p3", amount: 100000, percent: 8, profit: 8000, date: "2026-02-10", note: "Měsíční vklad", clientId: "c1" },
    { id: "p4", amount: 150000, percent: 9, profit: 13500, date: "2026-01-05", note: "Vstupní investice", clientId: "c2" },
    { id: "p5", amount: 100000, percent: 9, profit: 9000, date: "2026-02-05", note: "Druhý vklad", clientId: "c2" },
    { id: "p6", amount: 300000, percent: 12, profit: 36000, date: "2026-02-15", note: "Vstupní investice", clientId: "c3" },
    { id: "p7", amount: 200000, percent: 12, profit: 24000, date: "2026-03-15", note: "Navýšení", clientId: "c3" },
    { id: "p8", amount: 80000, percent: 7, profit: 5600, date: "2026-02-20", note: "Konzervativní vklad", clientId: "c4" },
    { id: "p9", amount: 50000, percent: 7, profit: 3500, date: "2026-03-20", note: "Měsíční vklad", clientId: "c4" },
    { id: "p10", amount: 100000, percent: 10, profit: 10000, date: "2026-03-01", note: "Vstupní investice", clientId: "c5" },
    { id: "p11", amount: 250000, percent: 11, profit: 27500, date: "2026-03-15", note: "Vstupní investice", clientId: "c6" },
    { id: "p12", amount: 150000, percent: 11, profit: 16500, date: "2026-03-20", note: "Navýšení vkladu", clientId: "c6" },
  ];

  for (const p of payments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log("  Payments seeded.");

  // -----------------------------------------------------------------------
  // Calendar Events (10 demo events, mixed types)
  // -----------------------------------------------------------------------
  const events = [
    { id: "e1", clientId: "c1", userId: "u3", type: "CALL" as const, title: "Kontrolní hovor – Dvořák", date: "2026-03-24", time: "09:00", note: "Ověřit spokojenost s výnosy" },
    { id: "e2", clientId: "c2", userId: "u3", type: "PAYMENT" as const, title: "Platba – Svobodová", date: "2026-04-05", time: "10:00", note: "Očekávaný měsíční vklad" },
    { id: "e3", clientId: "c3", userId: "u4", type: "MEETING" as const, title: "Schůzka – Černý", date: "2026-03-25", time: "14:00", note: "Prezentace nového projektu" },
    { id: "e4", clientId: "c5", userId: "u3", type: "REMINDER" as const, title: "Follow-up Němec", date: "2026-03-26", time: "11:00", note: "Zaslat prezentaci" },
    { id: "e5", clientId: "c1", userId: "u3", type: "INTEREST" as const, title: "Úrok – Dvořák", date: "2026-04-01", time: "08:00", note: "Měsíční výpis úroku" },
    { id: "e6", clientId: "c6", userId: "u3", type: "CALL" as const, title: "Uvítací hovor – Krejčí", date: "2026-03-24", time: "13:30", note: "Potvrzení investičního plánu" },
    { id: "e7", clientId: "c4", userId: "u4", type: "CALL" as const, title: "Konzultace – Veselá", date: "2026-03-27", time: "10:00", note: "Probrat konzervativní strategii" },
    { id: "e8", clientId: null, userId: "u2", type: "MEETING" as const, title: "Týmová porada", date: "2026-03-28", time: "09:00", note: "Měsíční vyhodnocení výsledků" },
    { id: "e9", clientId: "c3", userId: "u4", type: "PAYMENT" as const, title: "Platba – Černý", date: "2026-04-15", time: "10:00", note: "Třetí vklad" },
    { id: "e10", clientId: "c2", userId: "u3", type: "REMINDER" as const, title: "Připomenout smlouvu – Svobodová", date: "2026-03-29", time: "15:00", note: "Zaslat finální smlouvu adminovi" },
  ];

  for (const e of events) {
    await prisma.calEvent.upsert({
      where: { id: e.id },
      update: {},
      create: e,
    });
  }
  console.log("  Calendar events seeded.");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
