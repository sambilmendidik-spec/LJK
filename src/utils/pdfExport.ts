import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { toPng } from 'html-to-image';

export interface ExportPdfOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'f4' | 'letter' | [number, number];
  marginMm?: number;
  scale?: number;
}

/**
 * Helper to get image data and dimensions from an element.
 * Uses html2canvas-pro (which natively parses oklch/lab/lch color functions).
 * Falls back to html-to-image if canvas generation fails.
 */
async function captureElementAsImage(
  element: HTMLElement,
  scale: number
): Promise<{ dataUrl: string; width: number; height: number }> {
  const targetWidth = 794; // 210mm A4 width at 96 DPI
  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1280,
      width: targetWidth,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(element.id) || clonedDoc.querySelector('#printable-ljk');
        if (clonedEl) {
          (clonedEl as HTMLElement).style.width = '794px';
          (clonedEl as HTMLElement).style.minWidth = '794px';
          (clonedEl as HTMLElement).style.maxWidth = '794px';
          (clonedEl as HTMLElement).style.boxSizing = 'border-box';
          (clonedEl as HTMLElement).style.margin = '0 auto';
        }
      },
    });
    return {
      dataUrl: canvas.toDataURL('image/jpeg', 0.98),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (canvasErr) {
    console.warn('html2canvas-pro fallback to html-to-image:', canvasErr);
    // Fallback using browser-native SVG rendering via html-to-image
    const dataUrl = await toPng(element, {
      pixelRatio: scale,
      backgroundColor: '#ffffff',
      width: targetWidth,
    });

    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    return {
      dataUrl,
      width: img.naturalWidth || targetWidth * scale,
      height: img.naturalHeight || (element.offsetHeight || 1100) * scale,
    };
  }
}

/**
 * Renders an HTML element to a high-resolution PDF document and triggers download.
 * Supports standard A4 (210 x 297 mm) and Indonesian F4/Folio (215 x 330 mm).
 */
export async function exportElementToPdf(
  elementIdOrElement: string | HTMLElement,
  options: ExportPdfOptions = {}
): Promise<void> {
  const {
    filename = 'dokumen.pdf',
    orientation = 'portrait',
    format = 'a4',
    marginMm = 6,
    scale = 2.5,
  } = options;

  const element = typeof elementIdOrElement === 'string'
    ? document.getElementById(elementIdOrElement)
    : elementIdOrElement;

  if (!element) {
    throw new Error(`Elemen dengan ID "${elementIdOrElement}" tidak ditemukan.`);
  }

  // Create high-resolution raster image of the element
  const { dataUrl, width: imgWidth, height: imgHeight } = await captureElementAsImage(
    element,
    scale
  );

  // Indonesian F4 (Folio) paper standard is 215 mm x 330 mm
  const resolvedFormat: string | [number, number] =
    format === 'f4' ? [215, 330] : format;

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: resolvedFormat,
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const printableWidth = pageWidth - marginMm * 2;
  const printableHeight = pageHeight - marginMm * 2;

  // Calculate scaled dimensions to preserve aspect ratio
  const ratio = Math.min(printableWidth / imgWidth, printableHeight / imgHeight);

  const renderedWidth = imgWidth * ratio;
  const renderedHeight = imgHeight * ratio;

  // Center the content on the page
  const xOffset = marginMm + (printableWidth - renderedWidth) / 2;
  const yOffset = marginMm + Math.max(0, (printableHeight - renderedHeight) / 2);

  pdf.addImage(dataUrl, 'JPEG', xOffset, yOffset, renderedWidth, renderedHeight, undefined, 'FAST');

  // Trigger file download
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
