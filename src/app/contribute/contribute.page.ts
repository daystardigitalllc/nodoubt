import { Component, effect, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonTextarea } from '@ionic/angular';
import { AuthService } from '../core/auth.service';
import { SubmissionService, SubmissionStatus, SubmissionSummary } from '../core/submission.service';

@Component({
  selector: 'app-contribute',
  templateUrl: './contribute.page.html',
  styleUrls: ['./contribute.page.scss'],
  imports: [DatePipe, FormsModule, IonButton, IonContent, IonTextarea, RouterLink],
})
export class ContributePage {
  readonly auth = inject(AuthService);
  private readonly submissionsService = inject(SubmissionService);

  question = '';
  answer = '';
  authorNote = '';
  submissions: SubmissionSummary[] = [];
  loadingHistory = true;
  busy = false;
  error = '';
  message = '';

  constructor() {
    effect(() => {
      if (this.auth.ready()) void this.loadSubmissions();
    });
  }

  async submit(): Promise<void> {
    if (this.busy || !this.canSubmit()) return;
    this.busy = true;
    this.error = '';
    this.message = '';

    try {
      const result = await this.submissionsService.submit(this.question, this.answer, this.authorNote);
      if (result.error) {
        this.error = result.error.message;
        return;
      }

      this.question = '';
      this.answer = '';
      this.authorNote = '';
      this.message = 'Your answer is in the review queue. You can track its status below.';
      await this.loadSubmissions();
    } finally {
      this.busy = false;
    }
  }

  canSubmit(): boolean {
    return this.question.trim().length >= 5 && this.answer.trim().length >= 20;
  }

  statusLabel(status: SubmissionStatus): string {
    return {
      draft: 'Draft',
      submitted: 'Submitted',
      in_review: 'In review',
      changes_requested: 'Changes requested',
      resubmitted: 'Resubmitted',
      approved: 'Approved',
      published: 'Published',
      declined: 'Declined',
    }[status];
  }

  private async loadSubmissions(): Promise<void> {
    if (!this.auth.user()) {
      this.loadingHistory = false;
      return;
    }

    this.loadingHistory = true;
    const result = await this.submissionsService.listMine();
    this.submissions = result.data ?? [];
    if (result.error) this.error = result.error.message;
    this.loadingHistory = false;
  }
}
