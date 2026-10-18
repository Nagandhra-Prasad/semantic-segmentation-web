import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-secure-image',
  standalone: true,
  template: `@if (src()) { <img [src]="src()" [alt]="alt" class="secure-img" /> } @else { <div class="placeholder">Loading…</div> }`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .secure-img {
        width: 100%;
        border-radius: 12px;
        object-fit: cover;
        max-height: 360px;
      }
      .placeholder {
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--purple-50);
        border-radius: 12px;
        color: var(--purple-700);
      }
    `,
  ],
})
export class SecureImageComponent implements OnChanges {
  private readonly api = inject(ApiService);
  @Input({ required: true }) url!: string;
  @Input() alt = 'Image';
  readonly src = signal<string | null>(null);
  private objectUrl: string | null = null;

  ngOnChanges(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.src.set(null);
    if (!this.url) return;
    this.api.fetchFileBlob(this.url).subscribe({
      next: (blob) => {
        this.objectUrl = URL.createObjectURL(blob);
        this.src.set(this.objectUrl);
      },
      error: () => this.src.set(null),
    });
  }
}
