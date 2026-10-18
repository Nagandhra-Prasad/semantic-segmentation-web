import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ProcessingJob } from '../../core/models/api.models';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly summary = signal<Record<string, unknown> | null>(null);
  readonly recentJobs = signal<ProcessingJob[]>([]);

  ngOnInit(): void {
    this.api.analyticsSummary().subscribe((s) => this.summary.set(s));
    this.api.historyJobs().subscribe((jobs) => this.recentJobs.set(jobs.slice(0, 5)));
  }
}
