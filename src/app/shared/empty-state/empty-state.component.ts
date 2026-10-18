import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="empty-state">
      <span class="empty-icon" aria-hidden="true">{{ icon }}</span>
      <h4>{{ title }}</h4>
      <p>{{ message }}</p>
      @if (linkRoute && linkText) {
        <a class="btn btn-primary" [routerLink]="linkRoute">{{ linkText }}</a>
      }
    </div>
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) message!: string;
  @Input() icon = '◇';
  @Input() linkRoute?: string | unknown[];
  @Input() linkText?: string;
}
