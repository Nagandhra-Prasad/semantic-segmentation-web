import { Component, Input, OnChanges, OnDestroy, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { MediaType } from '../../core/models/api.models';

@Component({
  selector: 'app-secure-media',
  standalone: true,
  template: `
    @if (src()) {
      @if (kind === 'video') {
        <video
          class="secure-media"
          [src]="src()"
          controls
          playsinline
          loop
          muted
        ></video>
      } @else {
        <img class="secure-media" [src]="src()" [alt]="alt" />
      }
    } @else {
      <div class="placeholder">Loading…</div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      .secure-media {
        width: 100%;
        border-radius: 12px;
        max-height: 420px;
        object-fit: contain;
        background: #0f172a;
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
export class SecureMediaComponent implements OnChanges, OnDestroy {
  private readonly api = inject(ApiService);
  @Input({ required: true }) url!: string;
  @Input() kind: MediaType = 'image';
  @Input() alt = 'Media';
  readonly src = signal<string | null>(null);
  private objectUrl: string | null = null;

  ngOnChanges(): void {
    this.revoke();
    this.src.set(null);
    if (!this.url) return;
    this.api.fetchFileBlob(this.url).subscribe({
      next: (blob) => {
        const type = this.kind === 'video' ? blob.type || 'video/mp4' : blob.type;
        const typed = blob.type ? blob : new Blob([blob], { type });
        this.objectUrl = URL.createObjectURL(typed);
        this.src.set(this.objectUrl);
      },
      error: () => this.src.set(null),
    });
  }

  ngOnDestroy(): void {
    this.revoke();
  }

  private revoke(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}
