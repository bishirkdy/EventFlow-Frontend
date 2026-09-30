import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import {
  CapacityMode,
  RegistrationFieldType,
} from '../../../../../core/models/registration/registration.enums';
import { RegistrationFormService } from '../../../../../core/services/registration/registration-form.service';
import {
  RegistrationFormFieldModel,
  UpsertRegistrationFormRequest,
} from '../../../../../core/models/registration/registration-form.model';
import { EditableField } from '../../../../../core/models/registration/registration-editable-field.model';

@Component({
  selector: 'app-registration-form-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registration-form.html',
})
export class RegistrationFormPageComponent {
  protected readonly eventState = inject(OrganizerEventStateService);

  protected readonly formService = inject(RegistrationFormService);

  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly eventId = this.eventState.eventId;

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly formId = signal<string | null>(null);
  protected readonly fields = signal<EditableField[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['Event Registration', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    isActive: [true],
    capacityMode: [CapacityMode.Unlimited],
    capacity: [0, [Validators.min(1)]],
    enableWaitlist: [false],
    opensAtUtc: [''],
    closesAtUtc: [''],
  });

  protected readonly fieldTypes = [
    {
      value: RegistrationFieldType.Text,
      label: 'Text',
    },
    {
      value: RegistrationFieldType.TextArea,
      label: 'Long text',
    },
    {
      value: RegistrationFieldType.Email,
      label: 'Email',
    },
    {
      value: RegistrationFieldType.Phone,
      label: 'Phone',
    },
    {
      value: RegistrationFieldType.Number,
      label: 'Number',
    },
    {
      value: RegistrationFieldType.Date,
      label: 'Date',
    },
    {
      value: RegistrationFieldType.Select,
      label: 'Select',
    },
    {
      value: RegistrationFieldType.Radio,
      label: 'Radio',
    },
    {
      value: RegistrationFieldType.Checkbox,
      label: 'Checkbox',
    },
  ];

  constructor() {
    this.load();
  }

  protected isLimited(): boolean {
    return this.form.controls.capacityMode.value === CapacityMode.Limited;
  }

  protected addField(): void {
    const index = this.fields().length + 1;

    this.fields.update((items) => [
      ...items,
      {
        fieldKey: `field_${Date.now()}`,
        label: `Custom field ${index}`,
        fieldType: RegistrationFieldType.Text,
        isRequired: false,
        optionsJson: null,
        validationJson: null,
      },
    ]);
  }

  protected removeField(index: number): void {
    this.fields.update((items) => items.filter((_, i) => i !== index));
  }

  protected moveField(index: number, direction: -1 | 1): void {
    const target = index + direction;
    const current = [...this.fields()];

    if (target < 0 || target >= current.length) {
      return;
    }

    [current[index], current[target]] = [current[target], current[index]];

    this.fields.set(current);
  }

  protected save(): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.error.set('No event is selected.');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isLimited() && this.form.controls.capacity.value < 1) {
      this.form.controls.capacity.markAsTouched();
      return;
    }

    const request: UpsertRegistrationFormRequest = {
      name: this.form.controls.name.value.trim(),
      description: this.form.controls.description.value.trim() || null,
      isActive: this.form.controls.isActive.value,
      capacityMode: this.form.controls.capacityMode.value,
      capacity: this.isLimited() ? this.form.controls.capacity.value : null,
      enableWaitlist: this.form.controls.enableWaitlist.value,
      opensAtUtc: this.toUtc(this.form.controls.opensAtUtc.value),
      closesAtUtc: this.toUtc(this.form.controls.closesAtUtc.value),
      fields: this.fields().map((field, index) => ({
        fieldKey: field.fieldKey.trim(),
        label: field.label.trim(),
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        displayOrder: index,
        optionsJson: field.optionsJson,
        validationJson: field.validationJson,
      })),
    };

    this.saving.set(true);
    this.error.set(null);

    this.formService
      .upsert(eventId, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess || !response.data) {
            const message = response.message || 'Unable to save registration form.';

            this.error.set(message);
            this.toastr.error(message);
            return;
          }

          this.formId.set(response.data.id);

          this.applyModel(response.data);

          this.toastr.success(response.message || 'Registration form saved.');
        },

        error: (err: {
          error?: { message?: string;};
          message?: string;
        }) => {
          const message = err.error?.message ?? err.message ?? 'Unable to save registration form.';

          this.error.set(message);
          this.toastr.error(message);
          this.saving.set(false);
        },

        complete: () => this.saving.set(false),
      });
  }

  private load(): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.error.set('No event is selected.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.formService
      .get(eventId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            const message =
              response.errors?.[0] ?? response.message ?? 'Unable to load registration form.';

            if (this.isFormNotFoundMessage(message)) {
              this.prepareCreateForm();
              return;
            }

            this.error.set(message);
            this.loading.set(false);
            return;
          }

          if (response.data) {
            this.formId.set(response.data.id);
            this.applyModel(response.data);
          } else {
            this.prepareCreateForm();
          }

          this.loading.set(false);
        },

        error: (err: {
          status?: number;
          error?: {
            message?: string;
            errors?: string[];
          };
          message?: string;
        }) => {
          const message =
            err.error?.errors?.[0] ??
            err.error?.message ??
            err.message ??
            'Unable to load registration form.';

          if (this.isFormNotFoundMessage(message)) {
            this.prepareCreateForm();
            return;
          }

          this.error.set(message);
          this.loading.set(false);
        },
      });
  }

  private prepareCreateForm(): void {
    this.formId.set(null);
    this.error.set(null);
    this.fields.set([]);

    this.form.reset({
      name: 'Event Registration',
      description: '',
      isActive: true,
      capacityMode: CapacityMode.Unlimited,
      capacity: 0,
      enableWaitlist: false,
      opensAtUtc: '',
      closesAtUtc: '',
    });

    this.loading.set(false);
  }

  private isFormNotFoundMessage(message: string): boolean {
    return message.trim().toLowerCase() === 'registration form not found.';
  }

  private applyModel(model: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    capacityMode: CapacityMode;
    capacity: number | null;
    enableWaitlist: boolean;
    opensAtUtc: string | null;
    closesAtUtc: string | null;
    fields: RegistrationFormFieldModel[];
  }): void {
    this.form.patchValue({
      name: model.name,
      description: model.description ?? '',
      isActive: model.isActive,
      capacityMode: model.capacityMode,
      capacity: model.capacity ?? 0,
      enableWaitlist: model.enableWaitlist,
      opensAtUtc: this.toLocalDateTime(model.opensAtUtc),
      closesAtUtc: this.toLocalDateTime(model.closesAtUtc),
    });

    this.fields.set(
      [...model.fields]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((field) => ({
          id: field.id,
          fieldKey: field.fieldKey,
          label: field.label,
          fieldType: field.fieldType,
          isRequired: field.isRequired,
          optionsJson: field.optionsJson,
          validationJson: field.validationJson,
        })),
    );
  }

  private toUtc(value: string): string | null {
    if (!value) {
      return null;
    }

    return new Date(value).toISOString();
  }

  private toLocalDateTime(value: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  }
}
