import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * Ensures all <img> nodes inside an element are decoded before capture or export.
 */
async function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map(async (img) => {
      if (!img.complete) {
        try {
          await img.decode();
        } catch {
          // Ignore decode errors on fallback SVGs
        }
      }
    }),
  );
}

/**
 * Converts an image source to an inline data URL so clones and standalone HTML dossiers
 * preserve logos and emblems cleanly.
 */
async function inlineImagesInClone(clone: HTMLElement, sourceRoot: HTMLElement): Promise<void> {
  const sourceImgs = Array.from(sourceRoot.querySelectorAll("img"));
  const cloneImgs = Array.from(clone.querySelectorAll("img"));

  await Promise.all(
    cloneImgs.map(async (cloneImg, idx) => {
      const srcImg = sourceImgs[idx];
      const src = srcImg?.currentSrc || srcImg?.src || cloneImg.src;
      if (!src || src.startsWith("data:")) return;
      try {
        const canvas = document.createElement("canvas");
        const w = srcImg?.naturalWidth || srcImg?.width || 128;
        const h = srcImg?.naturalHeight || srcImg?.height || 128;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx && srcImg && srcImg.complete && srcImg.naturalWidth > 0) {
          ctx.drawImage(srcImg, 0, 0, w, h);
          cloneImg.setAttribute("src", canvas.toDataURL("image/png"));
        }
      } catch {
        // Leave original src if canvas tainted
      }
    }),
  );
}

/**
 * Renders a captured PNG image onto an A4 jsPDF page with 12mm margins and #0D0E11 background.
 * Scales smoothly to fit cleanly within a single A4 page when slightly tall to avoid orphan overflow.
 */
async function addImageToSingleA4Page(
  pdf: jsPDF,
  imgData: string,
  addNewPage: boolean,
): Promise<void> {
  const img = new Image();
  img.src = imgData;
  await new Promise((resolve, reject) => {
    img.onload = () => resolve(true);
    img.onerror = (e) => reject(e);
  });

  if (addNewPage) {
    pdf.addPage("a4", "p");
  }

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const maxContentWidth = pageWidth - margin * 2; // 186mm
  const maxContentHeight = pageHeight - margin * 2; // 273mm

  // Paint full A4 canvas Matte Onyx (#0D0E11)
  pdf.setFillColor(13, 14, 17);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  const imgAspect = img.width / img.height;
  let drawWidth = maxContentWidth;
  let drawHeight = drawWidth / imgAspect;

  if (drawHeight > maxContentHeight) {
    // Fit cleanly on 1 A4 page while preserving exact aspect ratio & centering horizontally
    const scale = maxContentHeight / drawHeight;
    drawHeight = maxContentHeight;
    drawWidth = drawWidth * scale;
  }

  const xOffset = margin + (maxContentWidth - drawWidth) / 2;
  pdf.addImage(imgData, "PNG", xOffset, margin, drawWidth, drawHeight, undefined, "FAST");
}

/**
 * High-density 2-to-3 page Executive Dossier PDF generator for ASJi Compliance Reports.
 * Clones into a fixed 920px desktop print stage so mobile & desktop downloads produce the
 * identical crisp institutional Matte Onyx (#0D0E11) & Antique Gold (#C9A227) A4 layout.
 */
export async function downloadReportAsPdf(
  element: HTMLElement,
  domain: string = "website",
  customFilename?: string,
): Promise<boolean> {
  if (typeof window === "undefined" || !element) return false;

  let offscreenHost: HTMLDivElement | null = null;

  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename =
      customFilename ||
      `ASJi_Executive_Audit_${cleanDomain}_${Date.now().toString().slice(-6)}.pdf`;

    await waitForImages(element);

    // Mount an isolated 920px desktop-width offscreen stage so mobile viewports
    // export the exact same crisp institutional table layout as desktop.
    offscreenHost = document.createElement("div");
    offscreenHost.style.position = "fixed";
    offscreenHost.style.left = "-99999px";
    offscreenHost.style.top = "0";
    offscreenHost.style.width = "920px";
    offscreenHost.style.maxWidth = "920px";
    offscreenHost.style.backgroundColor = "#0D0E11";
    offscreenHost.style.color = "#F3F4F6";
    offscreenHost.style.zIndex = "-1";
    offscreenHost.style.pointerEvents = "none";

    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = "920px";
    clone.style.maxWidth = "920px";
    clone.style.padding = "0";
    clone.style.margin = "0";
    clone.style.backgroundColor = "#0D0E11";

    // Remove interactive/mobile-only nodes and force desktop institutional tables visible
    clone.querySelectorAll(".print\\:hidden").forEach((n) => n.remove());
    clone.querySelectorAll<HTMLElement>(".print\\:block").forEach((n) => {
      n.classList.remove("hidden");
      n.style.display = "block";
    });
    clone.querySelectorAll<HTMLElement>(".print\\:grid-cols-4").forEach((n) => {
      n.style.gridTemplateColumns = "repeat(4, minmax(0, 1fr))";
    });
    clone.querySelectorAll<HTMLElement>(".print\\:grid-cols-3").forEach((n) => {
      n.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    });
    clone.querySelectorAll<HTMLElement>(".print\\:grid-cols-2").forEach((n) => {
      n.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
    });
    clone.querySelectorAll<HTMLElement>(".print\\:col-span-2").forEach((n) => {
      n.style.gridColumn = "span 2 / span 2";
    });
    clone.querySelectorAll<HTMLElement>(".print\\:border-l").forEach((n) => {
      n.style.borderTopWidth = "0px";
      n.style.borderLeftWidth = "1px";
      n.style.borderLeftStyle = "solid";
      n.style.borderLeftColor = "#262932";
      n.style.paddingTop = "0px";
      n.style.paddingLeft = "12px";
    });
    clone.querySelectorAll<HTMLElement>(".print\\:flex-row").forEach((n) => {
      n.style.flexDirection = "row";
      n.style.alignItems = "center";
      n.style.justifyContent = "space-between";
    });

    await inlineImagesInClone(clone, element);
    offscreenHost.appendChild(clone);
    document.body.appendChild(offscreenHost);

    // Allow layout to settle briefly
    await new Promise((r) => setTimeout(r, 80));

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    // Capture logical dossier pages cleanly (2 pages free, 3 pages paid)
    const dossierPages = Array.from(clone.querySelectorAll<HTMLElement>("[data-dossier-page]"));

    if (dossierPages.length > 0) {
      for (let i = 0; i < dossierPages.length; i++) {
        const sectionEl = dossierPages[i];
        const pageImgData = await toPng(sectionEl, {
          quality: 0.98,
          pixelRatio: 2,
          backgroundColor: "#0D0E11",
          cacheBust: true,
          fontEmbedCSS: "",
        });
        await addImageToSingleA4Page(pdf, pageImgData, i > 0);
      }

      pdf.save(filename);
      return true;
    }

    // Fallback single capture if no data-dossier-page attributes exist
    const imgData = await toPng(clone, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: "#0D0E11",
      cacheBust: true,
      fontEmbedCSS: "",
    });
    await addImageToSingleA4Page(pdf, imgData, false);
    pdf.save(filename);
    return true;
  } catch (err) {
    console.error("Direct PDF generation error:", err);
    openStandalonePrintWindow(element, domain);
    return false;
  } finally {
    if (offscreenHost && offscreenHost.parentNode) {
      offscreenHost.parentNode.removeChild(offscreenHost);
    }
  }
}

/**
 * Generates a self-contained dark & gold HTML dossier file for download.
 */
export async function downloadReportAsHtml(
  element: HTMLElement,
  domain: string = "website",
): Promise<boolean> {
  if (typeof window === "undefined" || !element) return false;

  try {
    await waitForImages(element);
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const clone = element.cloneNode(true) as HTMLElement;

    clone.querySelectorAll("[data-export-strip='true']").forEach((n) => n.remove());
    await inlineImagesInClone(clone, element);

    const styleRules = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules || [])
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .join("\n");

    const htmlDoc = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ASJi Executive Compliance Dossier — ${cleanDomain}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    ${styleRules}
    html, body {
      margin: 0;
      padding: 20px 12px;
      background-color: #0D0E11 !important;
      color: #F3F4F6 !important;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .dossier-shell {
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
    }
    @media print {
      body { padding: 0; }
      @page { size: A4; margin: 12mm; }
      .dossier-page-break { break-before: page !important; page-break-before: always !important; }
      .pdf-avoid-break, tr, pre, footer { break-inside: avoid !important; page-break-inside: avoid !important; }
    }
  </style>
</head>
<body style="background-color:#0D0E11;color:#F3F4F6;">
  <div class="dossier-shell">
    ${clone.outerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ASJi_Compliance_Dossier_${cleanDomain}_${Date.now().toString().slice(-6)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error("HTML dossier export error:", err);
    return false;
  }
}

/**
 * Opens a standalone popup print window preserving Matte Onyx (#0D0E11) & Antique Gold (#C9A227)
 * across a clean 2-to-3 page A4 Executive Dossier.
 */
export function openStandalonePrintWindow(element: HTMLElement, domain: string = "website") {
  if (typeof window === "undefined" || !element) return;
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const printWin = window.open("", "_blank", "width=1024,height=1050,scrollbars=yes");

  if (!printWin) {
    window.print();
    return;
  }

  const styleElements = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((node) => node.outerHTML)
    .join("\n");

  const htmlContent = element.outerHTML;

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="en" class="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ASJi Legal Audit Certificate - ${cleanDomain}</title>
        ${styleElements}
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

          *, *::before, *::after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #0D0E11 !important;
            color: #F3F4F6 !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          [data-pdf-paper="true"] header {
            display: flex !important;
            visibility: visible !important;
          }
          [data-pdf-paper="true"] footer {
            display: block !important;
            visibility: visible !important;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #0D0E11 !important;
              color: #F3F4F6 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .dossier-page-break {
              break-before: page !important;
              page-break-before: always !important;
            }
            .pdf-avoid-break, tr, pre, footer {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body style="background-color:#0D0E11;color:#F3F4F6;">
        <div style="width: 100%; max-width: 920px; margin: 0 auto; padding: 12px;">
          ${htmlContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}
