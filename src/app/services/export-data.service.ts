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
    // Find the content element by ID
    const content = document.getElementById(contentId);

    // Check if the content element exists
    if (!content) {
      throw new Error('Content not found');
    }

    // Generate canvas using html2canvas
    const canvas = await html2canvas(content);
    const dataUrl = canvas.toDataURL('image/png');

    // Log the data URL for debugging
    console.log('Data URL:', dataUrl);

    // Check if the data URL is valid
    if (dataUrl === 'data:,' || !dataUrl.startsWith('data:image/png;base64,')) {
      throw new Error('Invalid image data');
    }

    // Create a new jsPDF instance
    const pdf = new jsPDF();

    let imgProps;
    try {
      // Get image properties from the data URL
      imgProps = pdf.getImageProperties(dataUrl);
    } catch (error) {
      console.error('Error getting image properties:', error);
      throw error;
    }

    // Calculate the dimensions for the PDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add the image to the PDF
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
