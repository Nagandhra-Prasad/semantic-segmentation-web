export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export type UploadCategory = 'road_image' | 'dashcam_video' | 'traffic_scene' | 'dataset';
export type MediaType = 'image' | 'video' | 'dataset';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface UploadItem {
  id: string;
  original_filename: string;
  media_type: MediaType;
  category: UploadCategory;
  size_bytes: number;
  is_validated: boolean;
  validation_message: string | null;
  dataset_image_count?: number;
  created_at: string;
}

export interface ProcessingJob {
  id: string;
  upload_id: string;
  status: JobStatus;
  celery_task_id: string | null;
  segmented_paths: string[];
  overlay_paths: string[];
  overlay_video_path: string | null;
  segmented_video_path: string | null;
  class_counts: Record<string, number>;
  detected_class_count: number;
  inference_time_ms: number | null;
  model_accuracy_reference: number | null;
  frames_processed: number;
  source_filename: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface LegendItem {
  key: string;
  label: string;
  color_rgb: [number, number, number];
  color_hex: string;
}

export interface DashboardView {
  job: ProcessingJob;
  legend: LegendItem[];
  original_media_path: string | null;
  media_type: MediaType;
}

export interface ReportItem {
  id: string;
  job_id: string;
  pdf_path: string | null;
  excel_path: string | null;
  created_at: string;
  source_filename: string | null;
  display_title: string | null;
  pdf_download_name: string | null;
  excel_download_name: string | null;
}

export interface AdminUserItem {
  user: User;
  upload_count: number;
}

export interface AdminUploadItem {
  id: string;
  original_filename: string;
  media_type: MediaType;
  category: UploadCategory;
  size_bytes: number;
  is_validated: boolean;
  created_at: string;
  user_id: string;
  user_email: string | null;
  user_full_name: string | null;
  latest_job_id: string | null;
  latest_job_status: string | null;
}

export interface ActivityItem {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}
