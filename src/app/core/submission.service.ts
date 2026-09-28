import { inject, Injectable } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'resubmitted'
  | 'approved'
  | 'published'
  | 'declined';

export interface SubmissionSummary {
  id: string;
  proposed_question: string;
  status: SubmissionStatus;
  created_at: string;
  updated_at: string;
}

export interface SubmissionResult<T = undefined> {
  data?: T;
  error: PostgrestError | Error | null;
}

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private readonly supabase = inject(SupabaseService).client;

  async listMine(): Promise<SubmissionResult<SubmissionSummary[]>> {
    const { data, error } = await this.supabase
      .from('submissions')
      .select('id, proposed_question, status, created_at, updated_at')
      .order('updated_at', { ascending: false });

    return { data: (data as SubmissionSummary[] | null) ?? [], error };
  }

  async submit(question: string, answer: string, authorNote: string): Promise<SubmissionResult<{ id: string }>> {
    const { data: userData, error: userError } = await this.supabase.auth.getUser();
    if (userError || !userData.user) {
      return { error: userError ?? new Error('You must sign in before submitting an answer.') };
    }

    const userId = userData.user.id;
    const { data: submission, error: submissionError } = await this.supabase
      .from('submissions')
      .insert({
        author_id: userId,
        proposed_question: question.trim(),
        status: 'draft',
      })
      .select('id')
      .single();

    if (submissionError || !submission) return { error: submissionError };

    const { error: revisionError } = await this.supabase
      .from('submission_revisions')
      .insert({
        submission_id: submission.id,
        revision_number: 1,
        answer_body: answer.trim(),
        author_note: authorNote.trim() || null,
        created_by: userId,
      });

    if (revisionError) return { data: { id: submission.id }, error: revisionError };

    const submittedAt = new Date().toISOString();
    const { error: statusError } = await this.supabase
      .from('submissions')
      .update({ status: 'submitted', submitted_at: submittedAt, updated_at: submittedAt })
      .eq('id', submission.id);

    return { data: { id: submission.id }, error: statusError };
  }
}
