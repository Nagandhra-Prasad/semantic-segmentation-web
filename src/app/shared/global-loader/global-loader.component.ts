import { Component, inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  template: `
    @if (loading.active()) {
      <div class="loader-backdrop" role="status" aria-live="polite" aria-busy="true">
        <div class="loader-card">
          <div class="spinner" aria-hidden="true"></div>
          <p>Loading…</p>
        </div>
      </div>
    }
  `,
  styleUrl: './global-loader.component.scss',
})
export class GlobalLoaderComponent {
  readonly loading = inject(LoadingService);
}
