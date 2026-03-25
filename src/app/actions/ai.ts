"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getSession } from "@/lib/auth";

function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export async function generateSalutation(clientName: string): Promise<{ result?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Nepřihlášen" };

  const ai = getGemini();
  if (!ai) return { error: "AI není nakonfigurováno. Chybí GEMINI_API_KEY v env." };

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Vygeneruj krátké české oslovení pro osobu jménem "${clientName}". Jen oslovení v 5. pádu, nic jiného. Například pro "Jan Novák" odpověz "pane Nováku", pro "Eva Svobodová" odpověz "paní Svobodová".` }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 50 },
    });
    return { result: result.response.text().trim() };
  } catch {
    return { error: "Nepodařilo se vygenerovat oslovení." };
  }
}

export async function generateEmailDraft(context: {
  clientName: string;
  clientNote?: string;
  totalDeposit?: number;
  templateLabel?: string;
  templateBody?: string;
  brokerName?: string;
}): Promise<{
  result?: { salutation: string; body: string };
  error?: string;
}> {
  const session = await getSession();
  if (!session) return { error: "Nepřihlášen" };

  const ai = getGemini();
  if (!ai) return { error: "AI není nakonfigurováno. Chybí GEMINI_API_KEY v env." };

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Pomáháš psát profesionální obchodní emaily v češtině pro firmu Nodi Star s.r.o.

DŮLEŽITÉ PRAVIDLA:
- Piš profesionálně ale přátelsky, v češtině, vykej
- NIKDY nepoužívej slova jako "investice", "investiční", "výnos", "zhodnocení", "příležitost" ani žádné nabádání k investování
- Email musí znít jako běžná obchodní korespondence, ne jako marketingový materiál
- Stručně (max 150 slov)
- Vrať JSON: {"salutation": "oslovení v 5. pádu", "body": "tělo emailu BEZ oslovení a podpisu"}

Napiš email.
Typ: ${context.templateLabel || "obecný"}
Klient: ${context.clientName}
${context.clientNote ? `Poznámky: ${context.clientNote}` : ""}
${context.totalDeposit ? `Částka: ${context.totalDeposit.toLocaleString("cs-CZ")} Kč` : ""}
${context.brokerName ? `Odesílatel: ${context.brokerName}` : ""}
${context.templateBody ? `Šablona (inspirace): ${context.templateBody.substring(0, 300)}` : ""}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
    });

    const content = result.response.text().trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { result: { salutation: parsed.salutation || "", body: parsed.body || "" } };
    }
    return { error: "Prázdná odpověď od AI." };
  } catch {
    return { error: "Nepodařilo se vygenerovat email." };
  }
}

export async function improveEmailText(text: string): Promise<{ result?: string; error?: string }> {
  const session = await getSession();
  if (!session) return { error: "Nepřihlášen" };

  const ai = getGemini();
  if (!ai) return { error: "AI není nakonfigurováno." };

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Vylepši následující český email — oprav gramatiku, zlepši formulace, zachovej význam a délku. Vrať POUZE vylepšený text, nic jiného:\n\n${text}` }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 500 },
    });
    return { result: result.response.text().trim() };
  } catch {
    return { error: "Nepodařilo se vylepšit text." };
  }
}
