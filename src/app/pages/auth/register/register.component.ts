import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PasswordFieldComponent } from '../../../shared/password-field/password-field.component';

function confirmPasswordMatch(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;
  const password = parent.get('password')?.value;
  if (!control.value) return null;
  return control.value === password ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordFieldComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);

  form = this.fb.nonNullable.group({
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    organization: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', [Validators.required, confirmPasswordMatch]],
    accept_terms: [false, Validators.requiredTrue],
  });

  constructor() {
    this.form.get('password')?.valueChanges.subscribe(() => {
      this.form.get('confirm_password')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  showError(controlName: string, errorKey?: string): boolean {
    const control = this.form.get(controlName);
    if (!control || !control.touched) return false;
    if (errorKey) return control.hasError(errorKey);
    return control.invalid;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Please complete all required fields.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { full_name, email, password } = this.form.getRawValue();
    this.auth.register({ full_name, email, password }).subscribe({
      next: () => {
        this.auth.login(email, password).subscribe({
          next: () => this.router.navigate(['/app/dashboard']),
          error: () => this.router.navigate(['/auth/login']),
        });
      },
      error: (err) => {
        this.error.set(err.error?.detail || 'Registration failed');
        this.loading.set(false);
      },
    });
  }
}
