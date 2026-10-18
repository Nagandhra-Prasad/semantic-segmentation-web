import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { AdminUploadItem, AdminUserItem } from '../../core/models/api.models';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, DatePipe, EmptyStateComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);

  readonly tab = signal<'users' | 'uploads'>('users');
  readonly users = signal<AdminUserItem[]>([]);
  readonly uploads = signal<AdminUploadItem[]>([]);
  readonly busyUserId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.api.adminUsers().subscribe({
      next: (u) => this.users.set(u),
      error: () => this.error.set('Could not load users'),
    });
    this.api.adminUploads().subscribe({
      next: (u) => this.uploads.set(u),
      error: () => this.error.set('Could not load uploads'),
    });
  }

  setTab(t: 'users' | 'uploads'): void {
    this.tab.set(t);
  }

  toggleActive(item: AdminUserItem): void {
    const next = !item.user.is_active;
    this.busyUserId.set(item.user.id);
    this.error.set(null);
    this.api.adminSetUserActive(item.user.id, next).subscribe({
      next: (updated) => {
        this.users.update((list) =>
          list.map((row) =>
            row.user.id === updated.id ? { ...row, user: updated } : row,
          ),
        );
        this.busyUserId.set(null);
      },
      error: (err) => {
        this.busyUserId.set(null);
        this.error.set(err.error?.detail ?? 'Update failed');
      },
    });
  }

  isSelf(userId: string): boolean {
    return this.auth.currentUser()?.id === userId;
  }
}
