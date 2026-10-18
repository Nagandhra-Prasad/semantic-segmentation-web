import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { silentLoaderContext } from '../http/http-context';
import {
  ActivityItem,
  AdminUploadItem,
  AdminUserItem,
  DashboardView,
  LegendItem,
  ProcessingJob,
  ReportItem,
  UploadCategory,
  UploadItem,
  User,
} from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  upload(file: File, category: UploadCategory): Observable<UploadItem> {
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);
    return this.http.post<UploadItem>(`${this.base}/uploads`, form);
  }

  runProcessing(uploadId: string): Observable<ProcessingJob> {
    return this.http.post<ProcessingJob>(`${this.base}/processing/uploads/${uploadId}/run`, {});
  }

  getJob(jobId: string, options?: { silent?: boolean }): Observable<ProcessingJob> {
    return this.http.get<ProcessingJob>(`${this.base}/processing/jobs/${jobId}`, {
      context: options?.silent ? silentLoaderContext() : undefined,
    });
  }

  getDashboard(jobId: string, options?: { silent?: boolean }): Observable<DashboardView> {
    return this.http.get<DashboardView>(`${this.base}/segmentation/dashboard/${jobId}`, {
      context: options?.silent ? silentLoaderContext() : undefined,
    });
  }

  getLegend(): Observable<LegendItem[]> {
    return this.http.get<LegendItem[]>(`${this.base}/segmentation/legend`);
  }

  analyticsSummary(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.base}/analytics/summary`);
  }

  jobAnalytics(jobId: string): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.base}/analytics/jobs/${jobId}`);
  }

  createReport(jobId: string): Observable<ReportItem> {
    return this.http.post<ReportItem>(`${this.base}/reports/jobs/${jobId}`, {});
  }

  downloadReport(
    reportId: string,
    type: 'pdf' | 'excel',
    suggestedFilename?: string | null,
  ): Observable<{ blob: Blob; filename: string }> {
    return this.http
      .get(`${this.base}/reports/${reportId}/${type}`, {
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(
        map((res: HttpResponse<Blob>) => ({
          blob: res.body!,
          filename: this.resolveDownloadFilename(
            res,
            suggestedFilename,
            type === 'pdf' ? 'pdf' : 'xlsx',
          ),
        })),
      );
  }

  private resolveDownloadFilename(
    res: HttpResponse<Blob>,
    fallback: string | null | undefined,
    ext: string,
  ): string {
    const header = res.headers.get('Content-Disposition') ?? '';
    const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(header);
    if (match?.[1]) {
      return decodeURIComponent(match[1].replace(/"/g, ''));
    }
    if (fallback) return fallback;
    return `segmentation_report.${ext}`;
  }

  historyUploads(): Observable<UploadItem[]> {
    return this.http.get<UploadItem[]>(`${this.base}/history/uploads`);
  }

  historyJobs(): Observable<ProcessingJob[]> {
    return this.http.get<ProcessingJob[]>(`${this.base}/history/jobs`);
  }

  historyReports(): Observable<ReportItem[]> {
    return this.http.get<ReportItem[]>(`${this.base}/history/reports`);
  }

  historyActivity(): Observable<ActivityItem[]> {
    return this.http.get<ActivityItem[]>(`${this.base}/history/activity`);
  }

  adminUsers(): Observable<AdminUserItem[]> {
    return this.http.get<AdminUserItem[]>(`${this.base}/admin/users`);
  }

  adminSetUserActive(userId: string, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.base}/admin/users/${userId}/active`, {
      is_active: isActive,
    });
  }

  adminUploads(): Observable<AdminUploadItem[]> {
    return this.http.get<AdminUploadItem[]>(`${this.base}/admin/uploads`);
  }

  updateProfile(payload: { full_name?: string; password?: string }): Observable<User> {
    return this.http.patch<User>(`${this.base}/users/me`, payload);
  }

  fetchFileBlob(path: string): Observable<Blob> {
    return this.http.get(path, {
      responseType: 'blob',
      context: silentLoaderContext(),
    });
  }

  uploadFileUrl(uploadId: string): string {
    return `${this.base}/files/uploads/${uploadId}`;
  }

  resultFileUrl(jobId: string, filename: string): string {
    return `${this.base}/files/results/${jobId}/${filename}`;
  }

  basename(fullPath: string): string {
    const parts = fullPath.split(/[/\\]/);
    return parts[parts.length - 1] || fullPath;
  }
}
