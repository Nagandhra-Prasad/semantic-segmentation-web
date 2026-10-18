import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ProcessingJob, ReportItem } from '../../core/models/api.models';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [EmptyStateComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly jobs = signal<ProcessingJob[]>([]);
  readonly reports = signal<ReportItem[]>([]);
  readonly message = signal<string | null>(null);

  ngOnInit(): void {
    this.api.historyJobs().subscribe((j) => {
      const completed = j.filter((x) => x.status === 'completed');
      this.jobs.set(completed);
      const jobId = this.route.snapshot.queryParamMap.get('jobId');
      if (jobId) this.generate(jobId);
    });
    this.api.historyReports().subscribe((r) => this.reports.set(r));
  }

  jobLabel(job: ProcessingJob): string {
    return job.source_filename ?? `Job ${job.id.slice(0, 8)}`;
  }

  generate(jobId: string): void {
    this.message.set('Generating…');
    this.api.createReport(jobId).subscribe({
      next: () => {
        this.message.set('Report created');
        this.api.historyReports().subscribe((r) => this.reports.set(r));
      },
      error: () => this.message.set('Could not generate report'),
    });
  }

  download(report: ReportItem, type: 'pdf' | 'excel'): void {
    const suggested =
      type === 'pdf' ? report.pdf_download_name : report.excel_download_name;
    this.api.downloadReport(report.id, type, suggested).subscribe(({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
