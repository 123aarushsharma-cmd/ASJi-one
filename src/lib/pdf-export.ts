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
      margin: [8, 8, 8, 8],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
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
        },
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Execute html2pdf save
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (err) {
    console.error("Failed to generate PDF with html2pdf:", err);
    // Fallback: Open popup print/save window
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>ASJi Legal Audit Certificate - ${cleanDomain}</title>
        ${styleElements}
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&display=swap');
          
          *, *::before, *::after {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 24px;
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
            margin: 8mm;
          }
          @media print {
            body {
              padding: 0 !important;
              background-color: #ffffff !important;
              color: #000000 !important;
            }
          }
        </style>
      </head>
      <body class="bg-[#0d0c0b] text-foreground">
        <div style="max-width: 860px; margin: 0 auto;">
          ${htmlContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}
