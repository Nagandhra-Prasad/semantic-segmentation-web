import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pending = signal(0);
  private readonly revealed = signal(false);
  private revealTimer: ReturnType<typeof setTimeout> | null = null;

  /** True when the overlay should be visible (after a short delay). */
  readonly active = computed(() => this.revealed());

  trackStart(): void {
    const next = this.pending() + 1;
    this.pending.set(next);
    if (next === 1 && !this.revealTimer) {
      this.revealTimer = setTimeout(() => {
        if (this.pending() > 0) {
          this.revealed.set(true);
        }
        this.revealTimer = null;
      }, 150);
    }
  }

  trackEnd(): void {
    const next = Math.max(0, this.pending() - 1);
    this.pending.set(next);
    if (next === 0) {
      if (this.revealTimer) {
        clearTimeout(this.revealTimer);
        this.revealTimer = null;
      }
      this.revealed.set(false);
    }
  }
}
