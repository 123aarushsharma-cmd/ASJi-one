import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * Robust, repeatable high-fidelity single-page PDF generator for ASJi Compliance Certificates.
 * Uses html-to-image (SVG ForeignObject) to completely avoid html2canvas OKLCH color parser bugs,
 * rendering crisp vector typography and gold foil graphics directly into a single-page A4 PDF.
 */
export async function downloadReportAsPdf(
  element: HTMLElement,
  domain: string = "website",
): Promise<boolean> {
  if (typeof window === "undefined" || !element) return false;

  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const filename = `ASJi_Compliance_Certificate_${cleanDomain}_${Date.now().toString().slice(-6)}.pdf`;

    // Ensure all images are loaded
    const images = element.querySelectorAll("img");
    await Promise.all(
      Array.from(images).map(async (img) => {
        if (!img.complete) {
          try {
            await img.decode();
          } catch {
            // Ignore decode failures on svgs
          }
        }
      }),
    );

    // Convert the target element directly to a high-DPI PNG data URL using html-to-image
    const imgData = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2, // 2x DPI for ultra-sharp letterhead rendering
      backgroundColor: "#0d0c0b",
      cacheBust: true,
      filter: (node: Node) => {
        // Exclude elements with print:hidden class if any
        if (node instanceof HTMLElement && node.classList.contains("print:hidden")) {
          return false;
        }
        return true;
      },
    });

    if (!imgData || !imgData.startsWith("data:image")) {
      throw new Error("Failed to capture image data URL from element");
    }

    // Load image into HTMLImageElement to obtain exact intrinsic dimensions
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = (e) => reject(e);
    });

    // Initialize fresh jsPDF document for A4 portrait
    // A4 dimensions: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 8; // 8mm margin on all sides
    const maxContentWidth = pageWidth - margin * 2; // 194mm
    const maxContentHeight = pageHeight - margin * 2; // 281mm

    const imgAspect = img.width / img.height;
    const maxAspect = maxContentWidth / maxContentHeight;

    let finalWidth = maxContentWidth;
    let finalHeight = maxContentWidth / imgAspect;

    // Guarantee that the content fits strictly within 1 single A4 page
    if (finalHeight > maxContentHeight) {
      finalHeight = maxContentHeight;
      finalWidth = maxContentHeight * imgAspect;
    }

    const xPos = (pageWidth - finalWidth) / 2;
    const yPos = (pageHeight - finalHeight) / 2;

    pdf.addImage(imgData, "PNG", xPos, yPos, finalWidth, finalHeight, undefined, "FAST");
    pdf.save(filename);

    return true;
  } catch (err) {
    console.error("Direct PDF generation error:", err);
    // Fallback to standalone print window
    openStandalonePrintWindow(element, domain);
    return false;
  }
}

/**
 * Opens a standalone popup print window as an instant browser native fallback.
 */
export function openStandalonePrintWindow(element: HTMLElement, domain: string = "website") {
  if (typeof window === "undefined" || !element) return;
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const printWin = window.open("", "_blank", "width=900,height=1050,scrollbars=yes");

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
        <meta name="viewport" content="width=1024, initial-scale=1.0" />
        <title>ASJi Legal Audit Certificate - ${cleanDomain}</title>
        ${styleElements}
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          
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
          .text-gold-gradient {
            background: none !important;
            -webkit-text-fill-color: #E5C158 !important;
            color: #E5C158 !important;
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
          }
        </style>
      </head>
      <body class="bg-[#0d0c0b] text-white">
        <div style="width: 760px; max-width: 760px; margin: 0 auto; padding: 10px;">
          ${htmlContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}
