import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor() {
    // All API calls are now handled by the backend server
  }

  async generateAndSendReport(userData: {
    email: string;
    phone: string;
    name: string;
    companyName: string;
    userInput: string;
  }): Promise<void> {
    try {
      // Generate business report using OpenAI
      const reportContent = await this.generateReport(userData);
      
      // Generate PDF
      const pdfBlob = await this.generatePDF(reportContent, userData);
      
      // Send email with PDF
      await this.sendEmail(userData.email, pdfBlob, userData.name);
    } catch (error) {
      console.error('Error in generateAndSendReport:', error);
      throw error;
    }
  }

  private async generateReport(userData: {
    name: string;
    companyName: string;
    userInput: string;
  }): Promise<string> {
    try {
      // Call backend API to generate report (OpenAI is handled on backend)
      const backendUrl = `${environment.apiUrl}/api/generate-report`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.name,
          companyName: userData.companyName,
          userInput: userData.userInput
        })
      }).catch((fetchError) => {
        // Handle network errors
        if (fetchError.message.includes('Failed to fetch') || 
            fetchError.message.includes('ERR_CONNECTION_REFUSED') ||
            fetchError.name === 'TypeError') {
          throw new Error('BACKEND_NOT_RUNNING');
        }
        throw fetchError;
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to generate report: ${errorData.error || errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      return result.report || this.generateFallbackReport(userData);
    } catch (error: any) {
      console.error('Error generating report:', error);
      
      // Check if it's a connection error
      if (error.message === 'BACKEND_NOT_RUNNING' || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('BACKEND_NOT_RUNNING');
      }
      
      // Fallback report if API fails
      return this.generateFallbackReport(userData);
    }
  }

  private generateFallbackReport(userData: {
    name: string;
    companyName: string;
    userInput: string;
  }): string {
    return `
BUSINESS REPORT

Prepared for: ${userData.name}
Company: ${userData.companyName}
Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
This report has been prepared based on the information provided: ${userData.userInput}

BUSINESS ANALYSIS
Based on the details provided, we recommend conducting a thorough analysis of your business operations, market position, and growth opportunities.

RECOMMENDATIONS
1. Review current business processes
2. Identify areas for improvement
3. Develop strategic initiatives
4. Monitor key performance indicators

STRATEGIC INSIGHTS
Consider leveraging technology and data analytics to drive business growth and improve operational efficiency.

ACTION ITEMS
- Schedule a follow-up consultation
- Review and implement recommendations
- Track progress and adjust strategies as needed

Thank you for using our business report service.
    `;
  }

  private async generatePDF(content: string, userData: {
    name: string;
    companyName: string;
  }): Promise<Blob> {
    const doc = new jsPDF();
    
    // Add title with better styling
    doc.setFontSize(24);
    doc.setTextColor(102, 126, 234); // Purple color
    doc.setFont('helvetica', 'bold');
    doc.text('Business Report', 105, 25, { align: 'center' });
    
    // Add a line under title
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(50, 30, 160, 30);
    
    // Add company info with better spacing
    doc.setTextColor(0, 0, 0); // Black
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text(`Prepared for: ${userData.name}`, 20, 42);
    doc.text(`Company: ${userData.companyName}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 58);
    
    // Parse and format content with headings
    let yPosition = 70;
    const lines = content.split('\n');
    const pageHeight = 280;
    const leftMargin = 20;
    const rightMargin = 20;
    const maxWidth = 170;
    
    lines.forEach((line: string) => {
      const trimmedLine = line.trim();
      
      // Check if it's a heading (all caps, or starts with number, or common heading patterns)
      const isHeading = trimmedLine.length > 0 && (
        trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50 && trimmedLine.length > 3 ||
        /^\d+\.\s+[A-Z]/.test(trimmedLine) ||
        /^[A-Z][A-Z\s]+$/.test(trimmedLine) && trimmedLine.length < 40
      );
      
      // Check if it's a section heading (like "EXECUTIVE SUMMARY", "BUSINESS ANALYSIS")
      const isSectionHeading = isHeading && (
        trimmedLine.includes('SUMMARY') ||
        trimmedLine.includes('ANALYSIS') ||
        trimmedLine.includes('RECOMMENDATIONS') ||
        trimmedLine.includes('INSIGHTS') ||
        trimmedLine.includes('ACTION') ||
        trimmedLine.includes('REPORT') ||
        trimmedLine.includes('INTRODUCTION') ||
        trimmedLine.includes('CONCLUSION')
      );
      
      if (trimmedLine.length === 0) {
        // Empty line - add spacing
        yPosition += 5;
      } else if (isSectionHeading) {
        // Section heading - large, bold, colored
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        yPosition += 10; // Space before heading
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(102, 126, 234); // Purple
        const headingLines = doc.splitTextToSize(trimmedLine, maxWidth);
        headingLines.forEach((headingLine: string) => {
          if (yPosition > pageHeight) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(headingLine, leftMargin, yPosition);
          yPosition += 8;
        });
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 3; // Space after heading
      } else if (isHeading) {
        // Sub-heading - medium, bold
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = 20;
        }
        yPosition += 6; // Space before sub-heading
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 60); // Dark gray
        const headingLines = doc.splitTextToSize(trimmedLine, maxWidth);
        headingLines.forEach((headingLine: string) => {
          if (yPosition > pageHeight) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(headingLine, leftMargin, yPosition);
          yPosition += 7;
        });
        doc.setTextColor(0, 0, 0); // Reset to black
        yPosition += 2; // Space after sub-heading
      } else {
        // Regular paragraph text - larger and better spaced
        if (yPosition > pageHeight - 10) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0); // Black
        const paragraphLines = doc.splitTextToSize(trimmedLine, maxWidth);
        paragraphLines.forEach((paraLine: string) => {
          if (yPosition > pageHeight) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(paraLine, leftMargin, yPosition);
          yPosition += 6; // Better line spacing
        });
        yPosition += 2; // Space after paragraph
      }
    });
    
    // Generate blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  }

  private async sendEmail(email: string, pdfBlob: Blob, name: string): Promise<void> {
    try {
      // Convert PDF blob to base64
      const base64Pdf = await this.blobToBase64(pdfBlob);
      const pdfBase64 = base64Pdf.split(',')[1]; // Remove data:application/pdf;base64, prefix

      // Send email via backend API (to avoid CORS issues)
      const backendUrl = `${environment.apiUrl}/api/send-email`;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          name: name,
          pdfBase64: pdfBase64
        })
      }).catch((fetchError) => {
        // Handle network errors (connection refused, etc.)
        if (fetchError.message.includes('Failed to fetch') || 
            fetchError.message.includes('ERR_CONNECTION_REFUSED') ||
            fetchError.name === 'TypeError') {
          throw new Error('BACKEND_NOT_RUNNING');
        }
        throw fetchError;
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to send email: ${errorData.error || errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Check if it's a connection error
      if (error.message === 'BACKEND_NOT_RUNNING' || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('ERR_CONNECTION_REFUSED')) {
        throw new Error('BACKEND_NOT_RUNNING');
      }
      
      throw error;
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

