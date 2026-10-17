import type { GroceryCategory } from "./groceryList";

// Copy / share / PDF for the grocery list. `checked` is keyed by lower-cased item name.

type Checked = Record<string, boolean>;

// Emoji aren't in the PDF's built-in font (they'd print as junk), so strip them there.
const stripEmoji = (s: string) =>
  s.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]|\u{FE0F}|\u{200D}/gu, "").replace(/\s+/g, " ").trim();

export function groceryListText(data: GroceryCategory[], subtitle: string, checked: Checked): string {
  const lines = [`HerBalance grocery list${subtitle ? ` — ${subtitle}` : ""}`, ""];
  for (const cat of data) {
    lines.push(stripEmoji(cat.label).toUpperCase());
    for (const i of cat.items) {
      const mark = checked[i.name.toLowerCase()] ? "✓" : "-";
      const extra = [i.note, i.qty].filter(Boolean).join(", ");
      lines.push(`${mark} ${i.name}${extra ? ` (${extra})` : ""}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

/** Clipboard API first; falls back to a hidden textarea for browsers that block it. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

/** Opens the device share sheet. Returns "shared", "cancelled" or "unsupported". */
export async function shareText(title: string, text: string): Promise<"shared" | "cancelled" | "unsupported"> {
  if (!navigator.share) return "unsupported";
  try {
    await navigator.share({ title, text });
    return "shared";
  } catch (e) {
    return e instanceof DOMException && e.name === "AbortError" ? "cancelled" : "unsupported";
  }
}

const BLUE: [number, number, number] = [59, 130, 246];
const INK: [number, number, number] = [30, 58, 95];
const MID: [number, number, number] = [71, 85, 105];
const SOFT: [number, number, number] = [148, 163, 184];

/** Builds an A4 PDF checklist and triggers a download. jsPDF loads only when this runs. */
export async function downloadGroceryPdf(data: GroceryCategory[], subtitle: string, checked: Checked): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const ensure = (needed: number) => {
    if (y + needed > H - M) {
      doc.addPage();
      y = M;
    }
  };

  // Header
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 6, "F");
  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(...INK);
  doc.text("Grocery List", M, y + 10);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...MID);
  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
  doc.text(`HerBalance${subtitle ? ` · ${subtitle}` : ""} · ${today}`, M, y + 28);
  y += 56;

  for (const cat of data) {
    ensure(40);
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...BLUE);
    doc.text(stripEmoji(cat.label), M, y);
    y += 8;
    doc.setDrawColor(226, 232, 240).setLineWidth(0.8);
    doc.line(M, y, W - M, y);
    y += 16;

    for (const item of cat.items) {
      const isChecked = !!checked[item.name.toLowerCase()];
      const noteLines = item.note ? doc.setFontSize(9).splitTextToSize(item.note, W - M * 2 - 120) as string[] : [];
      ensure(18 + noteLines.length * 11);

      // Checkbox
      doc.setDrawColor(...(isChecked ? BLUE : SOFT)).setLineWidth(1);
      doc.roundedRect(M, y - 9, 10, 10, 2, 2, isChecked ? "FD" : "S");
      if (isChecked) {
        doc.setDrawColor(255, 255, 255).setLineWidth(1.4);
        doc.line(M + 2.2, y - 4, M + 4.3, y - 1.8);
        doc.line(M + 4.3, y - 1.8, M + 8, y - 6.5);
      }

      doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(...(isChecked ? SOFT : INK));
      doc.text(item.name, M + 20, y);
      if (item.qty) {
        doc.setFontSize(9).setTextColor(...MID);
        doc.text(item.qty, W - M, y, { align: "right" });
      }
      y += 4;
      if (noteLines.length) {
        doc.setFontSize(9).setTextColor(...SOFT);
        for (const line of noteLines) {
          y += 10;
          doc.text(line, M + 20, y);
        }
      }
      y += 14;
    }
    y += 8;
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...SOFT);
    doc.text(window.location.host, M, H - 24);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 24, { align: "right" });
  }

  doc.save("herbalance-grocery-list.pdf");
}
