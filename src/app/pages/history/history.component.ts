import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ActivityItem, ProcessingJob, ReportItem, UploadItem } from '../../core/models/api.models';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [RouterLink, DatePipe, EmptyStateComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly tab = signal<'uploads' | 'jobs' | 'reports' | 'activity'>('uploads');
  readonly uploads = signal<UploadItem[]>([]);
  readonly jobs = signal<ProcessingJob[]>([]);
  readonly reports = signal<ReportItem[]>([]);
  readonly activity = signal<ActivityItem[]>([]);

  ngOnInit(): void {
    this.api.historyUploads().subscribe((u) => this.uploads.set(u));
    this.api.historyJobs().subscribe((j) => this.jobs.set(j));
    this.api.historyReports().subscribe((r) => this.reports.set(r));
    this.api.historyActivity().subscribe((a) => this.activity.set(a));
  }

  setTab(t: 'uploads' | 'jobs' | 'reports' | 'activity'): void {
    this.tab.set(t);
  }
}
