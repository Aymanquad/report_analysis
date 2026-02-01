import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDetailsModalComponent } from './components/user-details-modal/user-details-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDetailsModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  userInput: string = '';
  showModal: boolean = false;
  showSuccess: boolean = false;
  successEmail: string = '';

  onInputEntered() {
    if (this.userInput.trim()) {
      this.showModal = true;
    }
  }

  onModalClose() {
    this.showModal = false;
    this.showSuccess = false;
  }

  onModalSubmit(userData: any) {
    // Show success notification at app level
    this.showSuccess = true;
    this.successEmail = userData.email;
    this.showModal = false;
    
    // Keep success visible for 6 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 6000);
  }
}

