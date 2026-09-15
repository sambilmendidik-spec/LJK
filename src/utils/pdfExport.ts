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
 * Uses html2canvas-pro which natively supports Tailwind v4 CSS modern colors (oklch, lab, etc.).
 * Supports standard A4 (210x297 mm) and Indonesian school Folio/F4 (215x330 mm).
 */
export async function exportElementToPdf(
  elementIdOrElement: string | HTMLElement,
  options: ExportPdfOptions = {}
): Promise<void> {
  const {
    filename = 'dokumen.pdf',
    orientation = 'portrait',
    format = 'f4',
    marginMm = 6,
    scale = 2.5,
  } = options;

  const element = typeof elementIdOrElement === 'string'
    ? document.getElementById(elementIdOrElement)
    : elementIdOrElement;

  if (!element) {
    throw new Error(`Elemen dengan ID "${elementIdOrElement}" tidak ditemukan.`);
  }

  // Create high-resolution raster image of the element using html2canvas-pro
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // F4 (Folio) paper standard in Indonesia is 215 mm x 330 mm
  const pdfFormat: string | [number, number] =
    format === 'f4' || format === 'folio' ? [215, 330] : format;

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

  // Calculate scaled dimensions to preserve aspect ratio
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(printableWidth / imgWidth, printableHeight / imgHeight);

  const renderedWidth = imgWidth * ratio;
  const renderedHeight = imgHeight * ratio;

  // Center the content on the page
  const xOffset = marginMm + (printableWidth - renderedWidth) / 2;
  const yOffset = marginMm;

  pdf.addImage(imgData, 'JPEG', xOffset, yOffset, renderedWidth, renderedHeight, undefined, 'FAST');

  // Trigger file download
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
