/**
 * Downloads a DOM element directly as a formatted PDF file.
 */
export async function downloadReportAsPdf(
  element: HTMLElement,
  domain: string = "website",
): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;

    // Dynamically import html2pdf on the client side only to avoid SSR "self is not defined" issues
    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default || html2pdfModule;

    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `ASJi_Compliance_Audit_${cleanDomain}_${Date.now().toString().slice(-6)}.pdf`;

    const opt = {
      margin: [4, 4, 4, 4],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1024,
        backgroundColor: "#0d0c0b",
        onclone: (clonedDoc: Document) => {
          // Sanitizes any Tailwind CSS v4 oklch() color functions which html2canvas cannot parse
          const styles = clonedDoc.querySelectorAll("style");
          styles.forEach((style) => {
            if (style.textContent && style.textContent.includes("oklch")) {
              style.textContent = style.textContent.replace(
                /oklch\([^)]+\)/gi,
                "rgb(212, 175, 55)",
              );
            }
          });
          const elements = clonedDoc.querySelectorAll<HTMLElement>("*");
          elements.forEach((el) => {
            if (el.style && el.style.cssText && el.style.cssText.includes("oklch")) {
              el.style.cssText = el.style.cssText.replace(/oklch\([^)]+\)/gi, "rgb(212, 175, 55)");
            }
          });

          // Enforce compact desktop layout on the paper container even when triggered from a mobile screen
          const clonedPaper = clonedDoc.querySelector('[data-pdf-paper="true"]') as HTMLElement;
          if (clonedPaper) {
            clonedPaper.style.width = "800px";
            clonedPaper.style.minWidth = "800px";
            clonedPaper.style.maxWidth = "800px";
            clonedPaper.style.boxSizing = "border-box";
            clonedPaper.style.margin = "0 auto";
            clonedPaper.style.padding = "20px";
            clonedPaper.style.marginBottom = "0px";
          }
        },
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.warn(
      "Direct html2pdf export caught error, falling back to standalone print window:",
      err,
    );
    return false;
  }
}

/**
 * Opens a standalone popup print window that bypasses iframe restrictions
 * and immediately triggers the browser's native Save to PDF / Print dialog.
 */
export function openStandalonePrintWindow(element: HTMLElement, domain: string = "website") {
  if (typeof window === "undefined") return;
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const printWin = window.open("", "_blank", "width=900,height=1000,scrollbars=yes");

  if (!printWin) {
    // Fallback: trigger normal print if popups are blocked
    window.print();
    return;
  }

  // Clone document head stylesheets to ensure Tailwind & CSS variables are rendered in the print window
  const styleElements =
    typeof document !== "undefined"
      ? Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
          .map((node) => node.outerHTML)
          .join("\n")
      : "";

  // Clone element content
  const htmlContent = element.outerHTML;

  printWin.document.write(`
    <!DOCTYPE html>
    <html lang="en" class="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=1024, initial-scale=1.0" />
        <title>ASJi Legal Audit Certificate - ${cleanDomain}</title>
        ${styleElements}
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');
          
          *, *::before, *::after {
            box-sizing: border-box;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #0d0c0b !important;
            color: #ffffff !important;
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 4mm;
          }
          @media print {
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #0d0c0b !important;
              color: #ffffff !important;
            }
            body > div {
              margin: 0 auto !important;
              padding: 0 !important;
            }
            [data-pdf-paper="true"] {
              margin-bottom: 0 !important;
              padding-bottom: 12px !important;
              break-after: avoid !important;
              page-break-after: avoid !important;
            }
          }
        </style>
      </head>
      <body class="bg-[#0d0c0b] text-foreground">
        <div style="width: 800px; max-width: 800px; margin: 0 auto; padding: 12px;">
          ${htmlContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          };
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}
