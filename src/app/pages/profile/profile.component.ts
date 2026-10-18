import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly message = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    full_name: [this.auth.currentUser()?.full_name ?? ''],
    password: [''],
  });

  save(): void {
    const { full_name, password } = this.form.getRawValue();
    const payload: { full_name?: string; password?: string } = { full_name };
    if (password) payload.password = password;
    this.api.updateProfile(payload).subscribe({
      next: (user) => {
        this.auth.currentUser.set(user);
        this.message.set('Profile updated');
      },
      error: () => this.message.set('Update failed'),
    });
  }
}
