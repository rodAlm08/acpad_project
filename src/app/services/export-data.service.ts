import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ViewChild, ElementRef } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class ExportDataService {
 
  constructor() { }

  async exportToPDF(contentId: string): Promise<string> {
    const content = document.getElementById(contentId);

    if (!content) {
      throw new Error('Content not found');
    }

    const canvas = await html2canvas(content);
    const dataUrl = canvas.toDataURL();
    console.log('Data URL:', dataUrl);
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Convert the PDF to a Blob
    const pdfBlob = pdf.output('blob');

    // Return the Blob URL for previewing
    return URL.createObjectURL(pdfBlob);
  }

  async savePDF(blobUrl: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      await Filesystem.writeFile({
        path: fileName,
        data: blob,
        directory: Directory.Documents,
        recursive: true
      });

      console.log('PDF saved to Documents:', fileName);
    } catch (e) {
      console.error('Error saving PDF:', e);
      throw e;
    }
  }
}
