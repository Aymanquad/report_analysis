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

  onInputEntered() {
    if (this.userInput.trim()) {
      this.showModal = true;
    }
  }

  onModalClose() {
    this.showModal = false;
  }

  onModalSubmit(userData: any) {
    // Don't close modal immediately - let it handle its own success notification
    // The modal will close itself after showing success (6 seconds + delay)
    // Give extra time to ensure success notification is fully displayed
    setTimeout(() => {
      this.showModal = false;
    }, 8000); // Wait for success notification to show for full 6 seconds + buffer
  }
}

