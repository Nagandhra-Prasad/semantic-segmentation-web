import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit {
  readonly auth = inject(AuthService);

  ngOnInit(): void {
    if (this.auth.isLoggedIn && !this.auth.currentUser()) {
      this.auth.loadProfile().subscribe();
    }
  }

  private readonly baseNav = [
    { path: '/app/dashboard', label: 'Dashboard', icon: '◉' },
    { path: '/app/upload', label: 'Upload', icon: '↑' },
    { path: '/app/analytics', label: 'Analytics', icon: '▣' },
    { path: '/app/reports', label: 'Reports', icon: '▤' },
    { path: '/app/history', label: 'History', icon: '◷' },
    { path: '/app/profile', label: 'Profile', icon: '◎' },
  ];

  readonly nav = computed(() => {
    const items = [...this.baseNav];
    if (this.auth.currentUser()?.role === 'admin') {
      items.splice(items.length - 1, 0, {
        path: '/app/admin',
        label: 'Admin',
        icon: '⚙',
      });
    }
    return items;
  });
}
