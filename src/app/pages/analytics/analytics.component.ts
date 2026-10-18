import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { ProcessingJob } from '../../core/models/api.models';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [JsonPipe, EmptyStateComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
})
export class AnalyticsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly summary = signal<Record<string, unknown> | null>(null);
  readonly jobs = signal<ProcessingJob[]>([]);
  readonly selectedJob = signal<Record<string, unknown> | null>(null);

  ngOnInit(): void {
    this.api.analyticsSummary().subscribe((s) => this.summary.set(s));
    this.api.historyJobs().subscribe((j) => this.jobs.set(j));
  }

  selectJob(jobId: string): void {
    this.api.jobAnalytics(jobId).subscribe((m) => this.selectedJob.set(m));
  }
}
