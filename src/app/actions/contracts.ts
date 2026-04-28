"use server";

import { getSession } from "@/lib/auth";
import { logAudit } from "./audit";
import { Resend } from "resend";
import { generateContractHTML } from "@/lib/contract-template";
import { htmlToPdf } from "@/lib/html-to-pdf";
import type { ContractData } from "@/lib/contract-template";

export type { ContractData };

const resend = new Resend(process.env.RESEND_API_KEY);

export async function generateContract(
  data: ContractData
): Promise<{ success: true; html: string } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Neautorizovaný přístup" };
  }

  // Only admin and supervisor can generate contracts
  if (session.role === "broker") {
    return { success: false, error: "Nemáte oprávnění generovat smlouvy" };
  }

  try {
    const html = generateContractHTML(data);

    await logAudit(
      session.id,
      "CONTRACT_GENERATED",
      "contract",
      undefined,
      `Smlouva pro: ${data.clientName}, Částka: ${data.amount} Kč, Úrok: ${data.interestRate}%, Doba: ${data.duration} měs.`
    );

    return { success: true, html };
  } catch (err) {
    console.error("Contract generation failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Nepodařilo se vygenerovat smlouvu",
    };
  }
}

export async function sendContractEmail(
  to: string,
  contractHtml: string,
  clientName: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Neautorizovaný přístup" };
  }

  if (session.role === "broker") {
    return { success: false, error: "Nemáte oprávnění odesílat smlouvy" };
  }

  if (!to) {
    return { success: false, error: "Chybí emailová adresa příjemce" };
  }

  try {
    // Generate PDF from contract HTML
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await htmlToPdf(contractHtml);
    } catch (pdfErr) {
      console.error("PDF generation failed, sending without attachment:", pdfErr);
    }

    const safeName = clientName.replace(/\s+/g, "-").replace(/[^\w-]/g, "");

    const { error } = await resend.emails.send({
      from: "Nodis Star s.r.o. <info@nodistar.cz>",
      to: [to],
      replyTo: ["info@nodistar.cz"],
      subject: `Smlouva o zápůjčce – ${clientName}`,
      html: contractHtml,
      ...(pdfBuffer
        ? {
            attachments: [
              {
                filename: `Smlouva-${safeName}.pdf`,
                content: pdfBuffer,
              },
            ],
          }
        : {}),
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message || "Odeslání selhalo" };
    }

    await logAudit(
      session.id,
      "CONTRACT_SENT",
      "contract",
      undefined,
      `Smlouva odeslána na: ${to}, Klient: ${clientName}`
    );

    return { success: true };
  } catch (err) {
    console.error("Contract email failed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Neočekávaná chyba při odesílání",
    };
  }
}
