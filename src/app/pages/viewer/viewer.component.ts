import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { interval, Subscription, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { DashboardView, JobStatus } from '../../core/models/api.models';
import { SecureMediaComponent } from '../../shared/secure-media/secure-media.component';
import { FrameSequencePlayerComponent } from '../../shared/frame-sequence-player/frame-sequence-player.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [SecureMediaComponent, FrameSequencePlayerComponent, RouterLink, EmptyStateComponent],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss',
})
export class ViewerComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private pollSub?: Subscription;

  readonly jobId = signal('');
  readonly data = signal<DashboardView | null>(null);
  readonly originalUrl = signal<string | null>(null);
  readonly overlayUrl = signal<string | null>(null);
  readonly overlayFrameUrls = signal<string[]>([]);
  readonly overlayFps = 8;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('jobId') ?? '';
    this.jobId.set(id);
    this.load(id);
    this.pollSub = interval(2500)
      .pipe(switchMap(() => this.api.getJob(id, { silent: true })))
      .subscribe((job) => {
        this.load(id, true);
        if (job.status === 'completed' || job.status === 'failed') {
          this.pollSub?.unsubscribe();
        }
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  private load(jobId: string, silent = false): void {
    this.api.getDashboard(jobId, { silent }).subscribe({
      next: (view) => {
        this.data.set(view);
        this.originalUrl.set(
          view.media_type === 'dataset' ? null : this.api.uploadFileUrl(view.job.upload_id),
        );

        const multiFrame =
          (view.media_type === 'video' || view.media_type === 'dataset') &&
          view.job.overlay_paths.length > 0;
        if (multiFrame) {
          this.overlayFrameUrls.set(
            view.job.overlay_paths.map((p) =>
              this.api.resultFileUrl(jobId, this.api.basename(p)),
            ),
          );
          this.overlayUrl.set(null);
        } else {
          this.overlayFrameUrls.set([]);
          const overlay = view.job.overlay_paths[0];
          this.overlayUrl.set(
            overlay ? this.api.resultFileUrl(jobId, this.api.basename(overlay)) : null,
          );
        }
      },
      error: () => this.data.set(null),
    });
  }

  statusLabel(status: JobStatus): string {
    return status.replace('_', ' ');
  }
}
