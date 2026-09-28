import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonInput, IonSpinner } from '@ionic/angular';
import { AuthService } from '../core/auth.service';

type AuthMode = 'sign-in' | 'register' | 'reset';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  imports: [FormsModule, IonButton, IonContent, IonInput, IonSpinner, RouterLink],
})
export class AuthPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  mode: AuthMode = 'sign-in';
  displayName = '';
  email = '';
  password = '';
  busy = false;
  message = '';
  error = '';

  setMode(mode: AuthMode): void {
    this.mode = mode;
    this.message = '';
    this.error = '';
  }

  async submit(): Promise<void> {
    if (this.busy) return;
    this.busy = true;
    this.message = '';
    this.error = '';

    try {
      if (this.mode === 'register') {
        const result = await this.auth.signUp(this.email.trim(), this.password, this.displayName);
        if (result.error) {
          this.error = result.error.message;
        } else if (result.requiresEmailConfirmation) {
          this.message = 'Check your email to confirm your account, then return here to sign in.';
        } else {
          await this.router.navigate(['/home']);
        }
      } else if (this.mode === 'reset') {
        const result = await this.auth.requestPasswordReset(this.email.trim());
        this.error = result.error?.message ?? '';
        if (!result.error) this.message = 'Check your email for a password reset link.';
      } else {
        const result = await this.auth.signIn(this.email.trim(), this.password);
        if (result.error) this.error = result.error.message;
        else await this.router.navigate(['/home']);
      }
    } finally {
      this.busy = false;
    }
  }
}
