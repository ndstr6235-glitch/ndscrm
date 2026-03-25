"use server";

import OpenAI from "openai";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Načte OpenAI API klíč z DB (admin ho nastaví v Settings)
async function getOpenAIClient(): Promise<OpenAI | null> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "openai_api_key" },
  });
  if (!setting?.value) return null;
  return new OpenAI({ apiKey: setting.value });
}

interface AIEmailContext {
  clientName: string;
  clientNote?: string;
  totalDeposit?: number;
  templateLabel?: string;
  templateBody?: string;
  brokerName?: string;
}

// Vygeneruj oslovení na základě jména klienta
export async function generateSalutation(clientName: string): Promise<{ result?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Nepřihlášen" };

  const openai = await getOpenAIClient();
  if (!openai) return { error: "AI není nakonfigurováno. Admin musí nastavit OpenAI API klíč v Nastavení." };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Jsi asistent pro české investiční CRM. Vygeneruj vhodné oslovení pro klienta.
Vrať POUZE oslovení (1-3 slova), nic jiného. Bez uvozovek.
Příklady: "pane Nováku", "paní Dvořáková", "Petro", "vážený pane Černý"
Použij český 5. pád (vokativ) pro příjmení.`,
        },
        { role: "user", content: `Klient: ${clientName}` },
      ],
      max_tokens: 30,
      temperature: 0.3,
    });

    return { result: response.choices[0]?.message?.content?.trim() ?? "" };
  } catch {
    return { error: "Nepodařilo se vygenerovat oslovení." };
  }
}

// Vygeneruj návrh emailu
export async function generateEmailDraft(context: AIEmailContext): Promise<{
  result?: { salutation: string; body: string };
  error?: string;
}> {
  const session = await getSession();
  if (!session) return { error: "Nepřihlášen" };

  const openai = await getOpenAIClient();
  if (!openai) return { error: "AI není nakonfigurováno. Admin musí nastavit OpenAI API klíč v Nastavení." };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Jsi asistent pro české investiční CRM "Nodi Star". Pomáháš brokerům psát personalizované emaily klientům.

Pravidla:
- Piš profesionálně ale přátelsky, v češtině
- Používej vykání
- Email by měl být stručný (max 150 slov)
- Vrať JSON: {"salutation": "oslovení v 5. pádu", "body": "tělo emailu BEZ oslovení a podpisu"}`,
        },
        {
          role: "user",
          content: `Napiš email.
Typ: ${context.templateLabel || "obecný"}
Klient: ${context.clientName}
${context.clientNote ? `Poznámky: ${context.clientNote}` : ""}
${context.totalDeposit ? `Vklad: ${context.totalDeposit.toLocaleString("cs-CZ")} Kč` : ""}
${context.brokerName ? `Broker: ${context.brokerName}` : ""}
${context.templateBody ? `Šablona (inspirace): ${context.templateBody.substring(0, 300)}` : ""}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return { error: "Prázdná odpověď od AI." };

    const parsed = JSON.parse(content);
    return { result: { salutation: parsed.salutation || "", body: parsed.body || "" } };
  } catch {
    return { error: "Nepodařilo se vygenerovat email." };
  }
}

// Vylepši existující text emailu
export async function improveEmailText(text: string): Promise<{ result?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Nepřihlášen" };

  const openai = await getOpenAIClient();
  if (!openai) return { error: "AI není nakonfigurováno." };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Vylepši český obchodní email — oprav gramatiku, zlepši styl, udělej profesionálnější.
Zachovej smysl a délku. Vrať POUZE vylepšený text.`,
        },
        { role: "user", content: text },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    return { result: response.choices[0]?.message?.content?.trim() ?? text };
  } catch {
    return { error: "Nepodařilo se vylepšit text." };
  }
}
