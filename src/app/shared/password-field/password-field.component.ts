import { Component, Input, signal } from '@angular/core';
import { ControlContainer, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  template: `
    <div class="field password-field">
      <label [for]="inputId">{{ label }}</label>
      <div class="password-wrap">
        <input
          [id]="inputId"
          [type]="visible() ? 'text' : 'password'"
          [formControlName]="controlName"
          [placeholder]="placeholder"
          [attr.autocomplete]="autocomplete"
        />
        <button
          type="button"
          class="password-toggle"
          (click)="toggle()"
          [attr.aria-label]="visible() ? 'Hide password' : 'Show password'"
          [attr.aria-pressed]="visible()"
        >
          @if (visible()) {
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 6.5c3.79 0 6.83 2.47 7.86 6-.99 3.53-4.07 6-7.86 6s-6.87-2.47-7.86-6c1.03-3.53 4.07-6 7.86-6zm0 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-6.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"
              />
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
              />
            </svg>
          }
        </button>
      </div>
      @if (hint) {
        <p class="field-hint">{{ hint }}</p>
      }
    </div>
  `,
  styleUrl: './password-field.component.scss',
})
export class PasswordFieldComponent {
  /** Name of the control on the parent `FormGroup` (not `formControlName` — that clashes with the directive). */
  @Input({ required: true }) controlName!: string;
  @Input({ required: true }) inputId!: string;
  @Input() label = 'Password';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() autocomplete = 'current-password';

  readonly visible = signal(false);

  toggle(): void {
    this.visible.update((v) => !v);
  }
}
