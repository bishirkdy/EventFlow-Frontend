import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { RegistrationFieldComponent } from '../registration-field/registration-field';

import {
  RegistrationFormFieldModel,
  RegistrationFormModel,
} from '../../../../../core/models/registration/registration-form.model';

export interface RegistrationFormSubmit {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  organization: string | null;
  designation: string | null;
  answers: Record<string, string>;
}

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [ReactiveFormsModule,RegistrationFieldComponent],
  templateUrl: './registration-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class RegistrationFormComponent {
  readonly registrationForm = input.required<RegistrationFormModel>();

  readonly submitted = output<RegistrationFormSubmit>();

  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    organization: [''],
    designation: [''],
  });

  protected readonly fieldControls =
    new Map<string, FormControl<string>>();

  protected readonly fields = computed(
    () =>
      [...this.registrationForm().fields].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
  );

  constructor() {
    effect(() => {
      const fields = this.registrationForm().fields;

      this.fieldControls.clear();

      for (const field of fields) {
        const validators = field.isRequired
          ? [Validators.required]
          : [];

        this.fieldControls.set(
          field.fieldKey,
          this.fb.nonNullable.control('', validators),
        );
      }
    });
  }

  protected getFieldControl(
    field: RegistrationFormFieldModel,
  ): FormControl<string> {
    return this.fieldControls.get(
      field.fieldKey,
    )!;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const answers: Record<string, string> = {};

    for (const field of this.fields()) {
      const control = this.fieldControls.get(
        field.fieldKey,
      );

      if (control) {
        answers[field.fieldKey] = control.value;
      }
    }

    const value = this.form.getRawValue();

    this.submitted.emit({
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim(),
      phone: value.phone.trim() || null,
      organization: value.organization.trim() || null,
      designation: value.designation.trim() || null,
      answers,
    });
  }
}