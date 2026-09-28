import { inject, Injectable, signal } from '@angular/core';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

export interface AuthResult {
  error: AuthError | null;
  requiresEmailConfirmation?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;

  readonly user = signal<User | null>(null);
  readonly session = signal<Session | null>(null);
  readonly ready = signal(false);

  constructor() {
    void this.restoreSession();
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.setSession(session);
    });
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName.trim() },
        emailRedirectTo: `${window.location.origin}/auth`,
      },
    });

    return {
      error,
      requiresEmailConfirmation: !error && !data.session,
    };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async requestPasswordReset(email: string): Promise<AuthResult> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });
    return { error };
  }

  async signOut(): Promise<AuthResult> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  private async restoreSession(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this.setSession(data.session);
    this.ready.set(true);
  }

  private setSession(session: Session | null): void {
    this.session.set(session);
    this.user.set(session?.user ?? null);
  }
}
