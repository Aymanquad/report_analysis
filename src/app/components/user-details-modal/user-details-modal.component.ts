import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-user-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-details-modal.component.html',
  styleUrl: './user-details-modal.component.css'
})
export class UserDetailsModalComponent {
  @Input() userInput: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();

  email: string = '';
  phone: string = '';
  name: string = '';
  companyName: string = '';
  showError: boolean = false;
  isSubmitting: boolean = false;
  showSuccess: boolean = false;
  loadingMessage: string = 'Generating your business report...';
  errorMessage: string = 'All fields are required. Please fill in all the information.';

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  onCancel() {
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
      this.close.emit();
    }, 2000);
  }

  async onSubmit() {
    if (!this.email || !this.phone || !this.name || !this.companyName) {
      this.showError = true;
      this.errorMessage = 'All fields are required. Please fill in all the information.';
      return;
    }

    // Hide error and start processing
    this.showError = false;
    this.showSuccess = false;
    
    // Set loading state FIRST - this should hide modal and show loading
    this.isSubmitting = true;
    this.loadingMessage = 'Generating your business report with AI...';
    
    // Force change detection immediately to show loading overlay
    this.cdr.detectChanges();
    
    // Small delay to ensure UI renders the loading overlay
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const userData = {
        email: this.email,
        phone: this.phone,
        name: this.name,
        companyName: this.companyName,
        userInput: this.userInput
      };

      // Update progress messages during processing
      const progressTimer1 = setTimeout(() => {
        if (this.isSubmitting) {
          this.loadingMessage = 'Creating PDF document...';
          this.cdr.detectChanges();
        }
      }, 2000);

      const progressTimer2 = setTimeout(() => {
        if (this.isSubmitting) {
          this.loadingMessage = 'Sending email with your report...';
          this.cdr.detectChanges();
        }
      }, 4000);

      // Keep loading visible until email is actually sent
      await this.reportService.generateAndSendReport(userData);
      
      // Clear timers
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      
      // IMPORTANT: Keep loading visible for a moment to show completion
      // Then switch to success
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Now show success message - loading is done
      // First set isSubmitting to false, then showSuccess to true
      this.isSubmitting = false;
      this.loadingMessage = 'Generating your business report...';
      
      // Force change detection to hide loading
      this.cdr.detectChanges();
      
      // Small delay to ensure loading is hidden before showing success
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Now show success
      this.showSuccess = true;
      
      console.log('✅ Email sent! Showing success notification. showSuccess:', this.showSuccess, 'isSubmitting:', this.isSubmitting);
      
      // Force change detection to show success overlay
      this.cdr.detectChanges();
      
      // Keep success visible for 6 seconds, then close
      setTimeout(() => {
        console.log('Closing success notification after 6 seconds');
        this.showSuccess = false;
        this.cdr.detectChanges();
        // Close modal after showing success
        setTimeout(() => {
          this.submit.emit(userData);
        }, 300);
      }, 6000);
    } catch (error: any) {
      console.error('Error generating report:', error);
      this.isSubmitting = false;
      this.showError = true;
      this.loadingMessage = 'Generating your business report...';
      
      // Check if backend server is not running
      if (error?.message === 'BACKEND_NOT_RUNNING' || 
          error?.message?.includes('Failed to fetch') ||
          error?.message?.includes('ERR_CONNECTION_REFUSED')) {
        this.errorMessage = '⚠️ Backend server is not running! Please start it with: npm run server';
      } else if (error?.message?.includes('Failed to send email')) {
        this.errorMessage = `⚠️ ${error.message}`;
      } else {
        this.errorMessage = '⚠️ An error occurred. Please try again or check your connection.';
      }
    }
  }
}

