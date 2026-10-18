import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-frame-sequence-player',
  standalone: true,
  template: `
    <div class="player">
      @if (currentSrc()) {
        <img [src]="currentSrc()" alt="Segmentation frames" class="frame" />
      } @else {
        <div class="placeholder">Loading frames…</div>
      }
      <div class="controls">
        <button type="button" class="btn btn-ghost" (click)="togglePlay()">
          {{ playing() ? 'Pause' : 'Play' }}
        </button>
        <span>{{ frameIndex() + 1 }} / {{ frameUrls.length }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .player {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .frame {
        width: 100%;
        max-height: 420px;
        object-fit: contain;
        border-radius: 12px;
        background: #0f172a;
      }
      .controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.85rem;
        color: var(--slate-600);
      }
      .placeholder {
        min-height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--purple-50);
        border-radius: 12px;
      }
    `,
  ],
})
export class FrameSequencePlayerComponent implements OnChanges, OnDestroy {
  private readonly api = inject(ApiService);

  @Input({ required: true }) frameUrls: string[] = [];
  @Input() fps = 8;

  readonly currentSrc = signal<string | null>(null);
  readonly frameIndex = signal(0);
  readonly playing = signal(true);

  private blobs: string[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnChanges(): void {
    this.stop();
    this.revokeAll();
    this.blobs = [];
    this.frameIndex.set(0);
    this.currentSrc.set(null);
    if (!this.frameUrls.length) return;

    let loaded = 0;
    const ordered: (string | null)[] = new Array(this.frameUrls.length).fill(null);

    this.frameUrls.forEach((url, idx) => {
      this.api.fetchFileBlob(url).subscribe({
        next: (blob) => {
          ordered[idx] = URL.createObjectURL(blob);
          loaded += 1;
          if (loaded === this.frameUrls.length) {
            this.blobs = ordered as string[];
            this.currentSrc.set(this.blobs[0]);
            this.start();
          }
        },
      });
    });
  }

  ngOnDestroy(): void {
    this.stop();
    this.revokeAll();
  }

  togglePlay(): void {
    this.playing.update((p) => !p);
    if (this.playing()) {
      this.start();
    } else {
      this.stop();
    }
  }

  private start(): void {
    if (!this.playing() || this.blobs.length === 0) return;
    this.stop();
    const ms = Math.max(1000 / this.fps, 80);
    this.timer = setInterval(() => {
      const next = (this.frameIndex() + 1) % this.blobs.length;
      this.frameIndex.set(next);
      this.currentSrc.set(this.blobs[next]);
    }, ms);
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private revokeAll(): void {
    for (const url of this.blobs) {
      URL.revokeObjectURL(url);
    }
  }
}
