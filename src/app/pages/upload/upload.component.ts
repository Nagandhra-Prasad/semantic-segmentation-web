import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import JSZip from 'jszip';
import { ApiService } from '../../core/services/api.service';
import { UploadCategory } from '../../core/models/api.models';

const IMAGE_EXT = /\.(jpe?g|png|webp|bmp|tiff?)$/i;

@Component({
  selector: 'app-upload',
  standalone: true,
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly zipInput = viewChild<ElementRef<HTMLInputElement>>('zipInput');
  private readonly folderInput = viewChild<ElementRef<HTMLInputElement>>('folderInput');
  private readonly mediaInput = viewChild<ElementRef<HTMLInputElement>>('mediaInput');

  readonly category = signal<UploadCategory>('road_image');
  readonly file = signal<File | null>(null);
  readonly selectionSummary = signal<string | null>(null);
  readonly message = signal<string | null>(null);
  readonly loading = signal(false);
  readonly preparing = signal(false);

  onCategoryChange(value: UploadCategory): void {
    this.category.set(value);
    this.clearSelection();
  }

  onMediaFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const picked = input.files?.[0] ?? null;
    this.file.set(picked);
    this.selectionSummary.set(picked ? null : null);
    this.message.set(null);
  }

  onZipFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const picked = input.files?.[0] ?? null;
    if (picked && !picked.name.toLowerCase().endsWith('.zip')) {
      this.message.set('Please choose a .zip file');
      this.clearSelection();
      return;
    }
    this.file.set(picked);
    this.selectionSummary.set(null);
    this.message.set(null);
  }

  async onFolderChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';

    const images = files.filter((f) => IMAGE_EXT.test(f.name));
    if (images.length === 0) {
      this.message.set('No images found in that folder (use JPG, PNG, WebP, BMP, or TIFF).');
      this.clearSelection();
      return;
    }

    this.preparing.set(true);
    this.message.set(null);

    try {
      const zip = new JSZip();
      for (const image of images) {
        const path = image.webkitRelativePath || image.name;
        zip.file(path, image);
      }
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const root =
        images[0].webkitRelativePath?.split('/')[0] ||
        images[0].name.replace(/\.[^.]+$/, '') ||
        'dataset';
      const zipFile = new File([blob], `${root}.zip`, { type: 'application/zip' });
      this.file.set(zipFile);
      this.selectionSummary.set(`${root} · ${images.length} images packaged`);
    } catch {
      this.message.set('Could not package folder — try a .zip instead.');
      this.clearSelection();
    } finally {
      this.preparing.set(false);
    }
  }

  triggerZipPick(): void {
    this.zipInput()?.nativeElement.click();
  }

  triggerFolderPick(): void {
    this.folderInput()?.nativeElement.click();
  }

  uploadAndRun(): void {
    const f = this.file();
    if (!f) {
      this.message.set(
        this.category() === 'dataset' ? 'Choose a .zip or folder first' : 'Choose a file first',
      );
      return;
    }
    this.loading.set(true);
    this.message.set(null);
    this.api.upload(f, this.category()).subscribe({
      next: (item) => {
        this.api.runProcessing(item.id).subscribe({
          next: (job) => {
            this.loading.set(false);
            this.router.navigate(['/app/viewer', job.id]);
          },
          error: () => {
            this.loading.set(false);
            this.message.set('Processing failed to start');
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.message.set('Upload failed — check file type and size');
      },
    });
  }

  private clearSelection(): void {
    this.file.set(null);
    this.selectionSummary.set(null);
    this.message.set(null);
    const zip = this.zipInput()?.nativeElement;
    const folder = this.folderInput()?.nativeElement;
    const media = this.mediaInput()?.nativeElement;
    if (zip) zip.value = '';
    if (folder) folder.value = '';
    if (media) media.value = '';
  }
}
