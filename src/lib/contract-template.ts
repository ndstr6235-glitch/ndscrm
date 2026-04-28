// Pure function — generates the contract HTML with all styles inlined.
// Used both client-side (live preview) and server-side (email sending).

export interface ContractData {
  clientName: string;
  clientBirthdate: string;
  clientAddress: string;
  clientBank: string;
  amount: number;
  amountWords: string;
  interestRate: number;
  duration: number;
  payoutFrequency: string;
  startDate: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "___________";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "___________";
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  if (!amount) return "___________";
  return amount.toLocaleString("cs-CZ");
}

function durationToText(months: number): string {
  switch (months) {
    case 6:
      return "šesti (6) měsíců";
    case 12:
      return "jednoho (1) roku";
    case 24:
      return "dvou (2) let";
    case 36:
      return "tří (3) let";
    default:
      return `${months} měsíců`;
  }
}

function frequencyToText(freq: string): string {
  switch (freq) {
    case "monthly":
      return "měsíčně";
    case "quarterly":
      return "čtvrtletně";
    default:
      return freq;
  }
}

export function generateContractHTML(data: ContractData): string {
  const today = formatDate(new Date().toISOString());
  const startFormatted = formatDate(data.startDate);
  const amountFormatted = formatAmount(data.amount);
  const durationText = durationToText(data.duration);
  const frequencyText = frequencyToText(data.payoutFrequency);

  return `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Smlouva o zápůjčce – Nodis Star s.r.o.</title>
<style>
  @media print {
    body { margin: 0; padding: 0; }
    .doc-wrapper { box-shadow: none !important; max-width: 100% !important; margin: 0 !important; }
  }
</style>
</head>
<body style="margin:0; padding:20px; background:#fafbfc; font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif; color:#1a1f2e; line-height:1.7; -webkit-font-smoothing:antialiased;">

<div class="doc-wrapper" style="max-width:800px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(26,47,74,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1a2f4a 0%,#0c1829 100%); padding:28px 40px; display:flex; align-items:center; justify-content:space-between;">
    <div style="display:flex; align-items:center; gap:14px;">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="22,2 27,16 42,16 30,25 34,40 22,31 10,40 14,25 2,16 17,16" fill="#d4af37" opacity="0.9"/>
        <polygon points="22,8 25,17 35,17 27,23 30,33 22,27 14,33 17,23 9,17 19,17" fill="#ffffff" opacity="0.2"/>
      </svg>
      <div>
        <div style="font-size:22px; font-weight:700; color:#ffffff; letter-spacing:1px;">Nodis Star s.r.o.</div>
        <div style="font-size:11px; color:rgba(212,175,55,0.8); letter-spacing:2px; text-transform:uppercase; margin-top:2px;">Investment Group</div>
      </div>
    </div>
    <div style="text-align:right; color:rgba(255,255,255,0.6); font-size:12px; line-height:1.6;">
      <div>Nodis Star s.r.o.</div>
      <div>IČO: 21610975</div>
      <div>info@nodistar.cz</div>
    </div>
  </div>

  <!-- Gold line -->
  <div style="height:3px; background:linear-gradient(90deg,#d4af37,#f5e6a3,#d4af37);"></div>

  <!-- Body -->
  <div style="padding:40px 44px;">

    <!-- Title -->
    <div style="text-align:center; margin-bottom:36px;">
      <h1 style="font-size:24px; font-weight:700; color:#1a2f4a; margin:0 0 6px 0; letter-spacing:0.5px;">Smlouva o zápůjčce</h1>
      <p style="font-size:13px; color:#556073; margin:0;">dle ustanovení § 2390 a násl. zákona č. 89/2012 Sb., občanský zákoník</p>
    </div>

    <!-- Section I: Smluvní strany -->
    <div style="margin-bottom:28px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <div style="width:32px; height:32px; background:linear-gradient(135deg,#d4af37,#b8962d); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff;">I</div>
        <h2 style="font-size:17px; font-weight:700; color:#1a2f4a; margin:0;">Smluvní strany</h2>
      </div>

      <div style="background:#f8f9fc; border-radius:10px; padding:20px 24px; margin-bottom:12px; border-left:3px solid #d4af37;">
        <div style="font-size:13px; font-weight:600; color:#d4af37; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">Věřitel</div>
        <table style="width:100%; font-size:14px; color:#1a1f2e; border-collapse:collapse;">
          <tr><td style="padding:3px 0; width:180px; color:#556073;">Jméno a příjmení:</td><td style="padding:3px 0; font-weight:600;">${data.clientName || "___________"}</td></tr>
          <tr><td style="padding:3px 0; color:#556073;">RČ / datum narození:</td><td style="padding:3px 0;">${data.clientBirthdate || "___________"}</td></tr>
          <tr><td style="padding:3px 0; color:#556073;">Bytem:</td><td style="padding:3px 0;">${data.clientAddress || "___________"}</td></tr>
          <tr><td style="padding:3px 0; color:#556073;">Bankovní spojení:</td><td style="padding:3px 0;">${data.clientBank || "___________"}</td></tr>
        </table>
      </div>

      <div style="background:#f8f9fc; border-radius:10px; padding:20px 24px; border-left:3px solid #1a2f4a;">
        <div style="font-size:13px; font-weight:600; color:#1a2f4a; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">Dlužník</div>
        <table style="width:100%; font-size:14px; color:#1a1f2e; border-collapse:collapse;">
          <tr><td style="padding:3px 0; width:180px; color:#556073;">Obchodní firma:</td><td style="padding:3px 0; font-weight:600;">Nodis Star s.r.o.</td></tr>
          <tr><td style="padding:3px 0; color:#556073;">IČO:</td><td style="padding:3px 0;">21610975</td></tr>
          <tr><td style="padding:3px 0; color:#556073;">Sídlo:</td><td style="padding:3px 0;">Na Florenci 2116/15, Nové Město, 110 00 Praha 1</td></tr>
          <tr><td style="padding:3px 0; color:#556073;">Jednající:</td><td style="padding:3px 0;">Miroslav Fencl, jednatel</td></tr>
          <tr><td style="padding:3px 0; color:#556073;">Bankovní spojení:</td><td style="padding:3px 0;">2402065938/2010 (Fio banka)</td></tr>
        </table>
      </div>
    </div>

    <!-- Section II: Předmět smlouvy -->
    <div style="margin-bottom:28px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <div style="width:32px; height:32px; background:linear-gradient(135deg,#d4af37,#b8962d); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff;">II</div>
        <h2 style="font-size:17px; font-weight:700; color:#1a2f4a; margin:0;">Předmět smlouvy</h2>
      </div>
      <div style="padding:0 10px;">
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>2.1</strong> Věřitel se zavazuje poskytnout Dlužníkovi peněžní zápůjčku ve výši
          <strong>${amountFormatted} Kč</strong> (slovy: <em>${data.amountWords || "___________"}</em>),
          a to převodem na bankovní účet Dlužníka uvedený v záhlaví této smlouvy.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>2.2</strong> Dlužník se zavazuje zápůjčku přijmout a vrátit ji Věřiteli za podmínek stanovených touto smlouvou.
        </p>
      </div>
    </div>

    <!-- Section III: Doba trvání -->
    <div style="margin-bottom:28px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <div style="width:32px; height:32px; background:linear-gradient(135deg,#d4af37,#b8962d); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff;">III</div>
        <h2 style="font-size:17px; font-weight:700; color:#1a2f4a; margin:0;">Doba trvání</h2>
      </div>
      <div style="padding:0 10px;">
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>3.1</strong> Smlouva se uzavírá na dobu určitou v délce <strong>${durationText}</strong>
          ode dne ${startFormatted}.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>3.2</strong> Dlužník je povinen vrátit celou jistinu nejpozději v poslední den trvání smlouvy, nedohodnou-li se strany písemně jinak.
        </p>
      </div>
    </div>

    <!-- Section IV: Úrok a výplata -->
    <div style="margin-bottom:28px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <div style="width:32px; height:32px; background:linear-gradient(135deg,#d4af37,#b8962d); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff;">IV</div>
        <h2 style="font-size:17px; font-weight:700; color:#1a2f4a; margin:0;">Úrok a výplata</h2>
      </div>
      <div style="padding:0 10px;">
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>4.1</strong> Dlužník se zavazuje platit Věřiteli úrok ve výši <strong>${data.interestRate}% měsíčně</strong> z poskytnuté jistiny.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>4.2</strong> Úroky budou vypláceny <strong>${frequencyText}</strong>, vždy do 15. dne příslušného kalendářního období, na bankovní účet Věřitele.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>4.3</strong> První výplata úroků proběhne v měsíci následujícím po měsíci, v němž byla zápůjčka poskytnuta.
        </p>
      </div>
    </div>

    <!-- Section V: Prodlení a sankce -->
    <div style="margin-bottom:28px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <div style="width:32px; height:32px; background:linear-gradient(135deg,#d4af37,#b8962d); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff;">V</div>
        <h2 style="font-size:17px; font-weight:700; color:#1a2f4a; margin:0;">Prodlení a sankce</h2>
      </div>
      <div style="padding:0 10px;">
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>5.1</strong> V případě prodlení Dlužníka s vrácením jistiny nebo výplatou úroků je Dlužník povinen zaplatit Věřiteli smluvní úrok z prodlení ve výši 0,05 % z dlužné částky za každý den prodlení.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>5.2</strong> Věřitel je oprávněn požadovat okamžité vrácení celé jistiny, pokud je Dlužník v prodlení s výplatou úroků po dobu delší než 30 dnů.
        </p>
      </div>
    </div>

    <!-- Section VI: Prohlášení Dlužníka -->
    <div style="margin-bottom:28px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <div style="width:32px; height:32px; background:linear-gradient(135deg,#d4af37,#b8962d); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff;">VI</div>
        <h2 style="font-size:17px; font-weight:700; color:#1a2f4a; margin:0;">Prohlášení Dlužníka</h2>
      </div>
      <div style="padding:0 10px;">
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>6.1</strong> Dlužník prohlašuje, že je oprávněn tuto smlouvu uzavřít a plnit závazky z ní vyplývající.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>6.2</strong> Dlužník prohlašuje, že vůči němu není vedeno insolvenční řízení ani exekuční řízení, a že je schopen plnit své závazky řádně a včas.
        </p>
      </div>
    </div>

    <!-- Section VII: Závěrečná ustanovení -->
    <div style="margin-bottom:36px;">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
        <div style="width:32px; height:32px; background:linear-gradient(135deg,#d4af37,#b8962d); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff;">VII</div>
        <h2 style="font-size:17px; font-weight:700; color:#1a2f4a; margin:0;">Závěrečná ustanovení</h2>
      </div>
      <div style="padding:0 10px;">
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>7.1</strong> Tato smlouva nabývá platnosti a účinnosti dnem podpisu oběma smluvními stranami.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>7.2</strong> Smlouva je vyhotovena ve dvou stejnopisech, z nichž každá strana obdrží po jednom.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>7.3</strong> Práva a povinnosti touto smlouvou výslovně neupravené se řídí příslušnými ustanoveními občanského zákoníku.
        </p>
        <p style="font-size:14px; margin:0 0 10px 0;">
          <strong>7.4</strong> Smluvní strany prohlašují, že si smlouvu přečetly, jejímu obsahu rozumí a na důkaz své svobodné vůle připojují své podpisy.
        </p>
      </div>
    </div>

    <!-- Signatures -->
    <div style="display:flex; gap:40px; margin-top:40px;">
      <div style="flex:1; text-align:center;">
        <p style="font-size:13px; color:#556073; margin:0 0 6px 0;">V Praze dne ${today}</p>
        <div style="border-top:2px solid #dfe3ea; margin:40px 20px 12px 20px; padding-top:12px;">
          <p style="font-size:14px; font-weight:600; color:#1a2f4a; margin:0;">${data.clientName || "___________"}</p>
          <p style="font-size:12px; color:#556073; margin:4px 0 0 0;">Věřitel</p>
        </div>
      </div>
      <div style="flex:1; text-align:center;">
        <p style="font-size:13px; color:#556073; margin:0 0 6px 0;">V Praze dne ${today}</p>
        <div style="border-top:2px solid #dfe3ea; margin:40px 20px 12px 20px; padding-top:12px;">
          <p style="font-size:14px; font-weight:600; color:#1a2f4a; margin:0;">Miroslav Fencl</p>
          <p style="font-size:12px; color:#556073; margin:4px 0 0 0;">Dlužník – Nodis Star s.r.o., jednatel</p>
        </div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div style="background:#f8f9fc; border-top:1px solid #dfe3ea; padding:16px 44px; text-align:center;">
    <p style="font-size:11px; color:#556073; margin:0;">
      Nodis Star s.r.o. | IČO: 21610975 | Na Florenci 2116/15, 110 00 Praha 1 | info@nodistar.cz
    </p>
  </div>

</div>

</body>
</html>`;
}
