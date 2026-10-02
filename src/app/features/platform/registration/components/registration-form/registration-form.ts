import { DatePipe } from '@angular/common';
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
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { RegistrationFieldComponent } from '../registration-field/registration-field';

import {
  CapacityMode,
  RegistrationFieldType,
} from '../../../../../core/models/registration/registration.enums';

import { Event } from '../../../../../core/models/event/event.model';

import {
  RegistrationFormFieldModel,
  RegistrationFormModel,
} from '../../../../../core/models/registration/registration-form.model';

import { RegistrationFormSubmit } from '../../../../../core/models/registration/registration-form-submit.model';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RegistrationFieldComponent,
  ],
  templateUrl: './registration-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationFormComponent {
  readonly registrationForm = input.required<RegistrationFormModel>();

  readonly event = input<Event | null>(null);

  readonly submitting = input(false);

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

  protected readonly fields = computed(() =>
    [...this.registrationForm().fields].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    ),
  );

  protected readonly remainingPlaces = computed(() => {
    const form = this.registrationForm();

    if (
      form.capacityMode !== CapacityMode.Limited ||
      form.capacity === null
    ) {
      return null;
    }

    return Math.max(form.capacity - form.approvedCount, 0);
  });

  protected readonly heroImage = computed(() => {
    const images = this.event()?.images ?? [];

    return (
      [...images]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .at(0)?.url ?? null
    );
  });

  protected readonly eventDate = computed(() => {
    const event = this.event();

    if (!event) {
      return null;
    }

    return {
      start: event.startDate,
      end: event.endDate,
    };
  });

  constructor() {
    effect(() => {
      const fields = this.registrationForm().fields;

      this.fieldControls.clear();

      for (const field of fields) {
        this.fieldControls.set(
          field.fieldKey,
          this.fb.nonNullable.control(
            '',
            this.buildValidators(field),
          ),
        );
      }
    });
  }

  private buildValidators(
    field: RegistrationFormFieldModel,
  ): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.isRequired) {
      validators.push(
        field.fieldType === RegistrationFieldType.Checkbox
          ? Validators.pattern(/^true$/)
          : Validators.required,
      );
    }

    if (field.fieldType === RegistrationFieldType.Email) {
      validators.push(Validators.email);
    }

    const rules = this.parseValidationRules(
      field.validationJson,
    );

    if (rules.minLength !== undefined) {
      validators.push(
        Validators.minLength(rules.minLength),
      );
    }

    if (rules.maxLength !== undefined) {
      validators.push(
        Validators.maxLength(rules.maxLength),
      );
    }

    if (rules.min !== undefined) {
      validators.push(Validators.min(rules.min));
    }

    if (rules.max !== undefined) {
      validators.push(Validators.max(rules.max));
    }

    if (rules.pattern) {
      validators.push(
        Validators.pattern(rules.pattern),
      );
    }

    return validators;
  }

  private parseValidationRules(
    value: string | null,
  ): {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  } {
    if (!value) {
      return {};
    }

    try {
      const parsed: unknown = JSON.parse(value);

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        Array.isArray(parsed)
      ) {
        return {};
      }

      const rules = parsed as Record<string, unknown>;

      return {
        minLength: this.toNumber(rules['minLength']),
        maxLength: this.toNumber(rules['maxLength']),
        min: this.toNumber(rules['min']),
        max: this.toNumber(rules['max']),
        pattern:
          typeof rules['pattern'] === 'string'
            ? rules['pattern']
            : undefined,
      };
    } catch {
      return {};
    }
  }

  private toNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value)
      ? value
      : undefined;
  }

  protected getFieldControl(
    field: RegistrationFormFieldModel,
  ): FormControl<string> {
    return this.fieldControls.get(field.fieldKey)!;
  }

  protected submit(): void {
    const dynamicControls = [
      ...this.fieldControls.values(),
    ];

    const hasInvalidDynamicField = dynamicControls.some(
      (control) => control.invalid,
    );

    if (
      this.form.invalid ||
      hasInvalidDynamicField
    ) {
      this.form.markAllAsTouched();

      dynamicControls.forEach((control) =>
        control.markAsTouched(),
      );

      return;
    }

    if (this.submitting()) {
      return;
    }

    const answers: Record<string, string> = {};

    for (const field of this.fields()) {
      const control = this.fieldControls.get(
        field.fieldKey,
      );

      if (control) {
        answers[field.id] = control.value;
      }
    }

    const value = this.form.getRawValue();

    this.submitted.emit({
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim(),
      phone: value.phone.trim() || null,
      organization:
        value.organization.trim() || null,
      designation:
        value.designation.trim() || null,
      answers,
    });
  }
}