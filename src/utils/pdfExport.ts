import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface ExportPdfOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'f4' | 'folio' | [number, number];
  marginMm?: number;
  scale?: number;
}

/**
 * Renders an HTML element to a high-resolution PDF document and triggers download.
 * Uses html2canvas-pro which natively supports Tailwind v4 CSS modern colors.
 * Supports standard A4 (210x297 mm) and Indonesian school Folio/F4 (215x330 mm).
 * Ensures 1:1 visual match with preview by locking desktop width, waiting for web fonts,
 * stripping screen-only badges/watermarks, and aligning paper aspect ratios.
 */
export async function exportElementToPdf(
  elementIdOrElement: string | HTMLElement,
  options: ExportPdfOptions = {}
): Promise<void> {
  const {
    filename = 'dokumen.pdf',
    orientation = 'portrait',
    format = 'f4',
    marginMm = 5,
    scale = 2.5,
  } = options;

  const element = typeof elementIdOrElement === 'string'
    ? document.getElementById(elementIdOrElement)
    : elementIdOrElement;

  if (!element) {
    throw new Error(`Elemen dengan ID "${elementIdOrElement}" tidak ditemukan.`);
  }

  // Ensure all web fonts are fully loaded before capturing
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed if fonts ready check fails
    }
  }

  const targetId = typeof elementIdOrElement === 'string' ? elementIdOrElement : element.id;

  // Create high-resolution raster image of the element using html2canvas-pro
  // Force windowWidth so responsive Tailwind classes don't collapse into mobile view
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1200,
    onclone: (clonedDoc) => {
      // 1. Hide elements marked with print:hidden or data-pdf-hidden
      const hiddenElements = clonedDoc.querySelectorAll('.print\\:hidden, [data-pdf-hidden="true"]');
      hiddenElements.forEach((el) => {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
      });

      // 2. Locate cloned target element and clean screen-only decorations
      const target = targetId ? clonedDoc.getElementById(targetId) : null;
      if (target) {
        target.style.display = 'block';
        target.style.visibility = 'visible';
        target.classList.remove('hidden');
        target.style.boxShadow = 'none';
        target.style.margin = '0';
        target.style.borderRadius = '0';

        // Ensure proper paper sizing for LJK
        const paper = target.dataset.paper;
        if (paper === 'F4') {
          target.style.width = '814px';
          target.style.minHeight = '1248px';
        } else if (paper === 'A4') {
          target.style.width = '794px';
          target.style.minHeight = '1124px';
        }
      }
    },
  });

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // F4 (Folio) paper standard in Indonesia is 215 mm x 330 mm
  const isF4 = format === 'f4' || format === 'folio';
  const pdfFormat: string | [number, number] = isF4 ? [215, 330] : format;

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: pdfFormat,
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const printableWidth = pageWidth - marginMm * 2;
  const printableHeight = pageHeight - marginMm * 2;

  // Scale ratio based on printable width
  const widthRatio = printableWidth / imgWidth;
  const totalPdfHeight = imgHeight * widthRatio;

  // Check if content fits in a single page (allowing slight tolerance)
  if (totalPdfHeight <= printableHeight * 1.05) {
    const fitRatio = Math.min(printableWidth / imgWidth, printableHeight / imgHeight);
    const renderedWidth = imgWidth * fitRatio;
    const renderedHeight = imgHeight * fitRatio;

    // Center on page within margins
    const xOffset = marginMm + (printableWidth - renderedWidth) / 2;
    const yOffset = marginMm + (printableHeight - renderedHeight) / 2;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderedWidth, renderedHeight, undefined, 'FAST');
  } else {
    // Multi-page document handling (e.g., student score recap table with many rows)
    const pageCanvasHeight = (printableHeight / printableWidth) * imgWidth;
    let yOffset = 0;
    let pageNum = 0;

    while (yOffset < imgHeight) {
      const sliceHeight = Math.min(pageCanvasHeight, imgHeight - yOffset);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgWidth;
      sliceCanvas.height = sliceHeight;
      const ctx = sliceCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, yOffset, imgWidth, sliceHeight, 0, 0, imgWidth, sliceHeight);
        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.98);

        if (pageNum > 0) {
          pdf.addPage();
        }

        const renderedSliceHeight = sliceHeight * widthRatio;
        pdf.addImage(sliceData, 'JPEG', marginMm, marginMm, printableWidth, renderedSliceHeight, undefined, 'FAST');
      }

      yOffset += pageCanvasHeight;
      pageNum++;
    }
  }

  // Trigger file download
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

