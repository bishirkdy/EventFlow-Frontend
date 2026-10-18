import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../../../core/services/ui/notification.service';

import { OrganizerEventStateService } from '../../../services/organizer-event-state.service';
import { CapacityMode, RegistrationFieldType } from '../../../../../core/models/registration';
import { RegistrationFormService } from '../../../../../core/services/registration/registration-form.service';
import {
  RegistrationFormFieldModel,
  UpsertRegistrationFormRequest
} from '../../../../../core/models/registration';
import { EditableField } from '../../../../../core/models/registration';
import { createAsyncAction } from '@/core/state';

@Component({
  selector: 'app-registration-form-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registration-form.html'
})
export class RegistrationFormPageComponent {
  protected readonly eventState = inject(OrganizerEventStateService);

  protected readonly formService = inject(RegistrationFormService);

  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(NotificationService);

  protected readonly eventId = this.eventState.eventId;

  protected readonly error = signal<string | null>(null);
  protected readonly formId = signal<string | null>(null);
  protected readonly fields = signal<EditableField[]>([]);

  private readonly loadAction = createAsyncAction(
    (eventId: string) => this.formService.get(eventId),
    {
      errorFallback: 'Unable to load registration form.',
      onError: (err) => {
        const message =
          (
            err as {
              status?: number;
              error?: {
                message?: string;
                errors?: string[];
              };
              message?: string;
            }
          ).error?.errors?.[0] ??
          (err as { error?: { message?: string }; message?: string }).error?.message ??
          (err as { message?: string }).message ??
          'Unable to load registration form.';

        if (this.isFormNotFoundMessage(message)) {
          this.prepareCreateForm();
          return;
        }

        this.error.set(message);
      },
      onSuccess: (response) => {
        if (!response.isSuccess) {
          const message =
            response.errors?.[0] ?? response.message ?? 'Unable to load registration form.';

          if (this.isFormNotFoundMessage(message)) {
            this.prepareCreateForm();
            return;
          }

          this.error.set(message);
          return;
        }

        if (response.data) {
          this.formId.set(response.data.id);
          this.applyModel(response.data);
        } else {
          this.prepareCreateForm();
        }
      }
    }
  );

  private readonly upsertAction = createAsyncAction(
    (eventId: string, request: UpsertRegistrationFormRequest) =>
      this.formService.upsert(eventId, request),
    {
      errorFallback: 'Unable to save registration form.',
      onSuccess: (response) => {
        if (!response.isSuccess || !response.data) {
          const message = response.message || 'Unable to save registration form.';

          this.error.set(message);
          this.toastr.error(message);
          return;
        }

        this.formId.set(response.data.id);

        this.applyModel(response.data);

        this.toastr.success(response.message || 'Registration form saved.');
      }
    }
  );

  protected readonly loading = this.loadAction.pending;
  protected readonly saving = this.upsertAction.pending;
  protected readonly CapacityMode = CapacityMode;

  protected readonly form = this.fb.nonNullable.group({
    name: ['Event Registration', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    isActive: [true],
    capacityMode: [CapacityMode.Unlimited],
    capacity: [0],
    enableWaitlist: [false],
    opensAtUtc: [''],
    closesAtUtc: ['']
  });

  protected readonly fieldTypes = [
    {
      value: RegistrationFieldType.Text,
      label: 'Text'
    },
    {
      value: RegistrationFieldType.TextArea,
      label: 'Long text'
    },
    {
      value: RegistrationFieldType.Email,
      label: 'Email'
    },
    {
      value: RegistrationFieldType.Phone,
      label: 'Phone'
    },
    {
      value: RegistrationFieldType.Number,
      label: 'Number'
    },
    {
      value: RegistrationFieldType.Date,
      label: 'Date'
    },
    {
      value: RegistrationFieldType.Select,
      label: 'Select'
    },
    {
      value: RegistrationFieldType.Radio,
      label: 'Radio'
    },
    {
      value: RegistrationFieldType.Checkbox,
      label: 'Checkbox'
    }
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
        fieldKey: `field_${Date.now()}_${index}`,
        label: `Custom field ${index}`,
        fieldType: RegistrationFieldType.Text,
        isRequired: false,
        optionsJson: null,
        validationJson: null
      }
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

  protected isChoiceField(field: EditableField): boolean {
    return (
      field.fieldType === RegistrationFieldType.Select ||
      field.fieldType === RegistrationFieldType.Radio
    );
  }

  protected hasValidationRules(field: EditableField): boolean {
    return [
      RegistrationFieldType.Text,
      RegistrationFieldType.TextArea,
      RegistrationFieldType.Email,
      RegistrationFieldType.Phone,
      RegistrationFieldType.Number
    ].includes(field.fieldType);
  }

  protected updateFieldOptions(index: number, value: string): void {
    this.fields.update((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, optionsJson: value.trim() || null } : item
      )
    );
  }

  protected updateFieldValidation(index: number, value: string): void {
    this.fields.update((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, validationJson: value.trim() || null } : item
      )
    );
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

    if (
      this.form.controls.capacityMode.value === CapacityMode.Unlimited &&
      this.form.controls.enableWaitlist.value
    ) {
      this.error.set('Waitlist can only be enabled when capacity is limited.');
      return;
    }

    const keys = this.fields().map((field) => field.fieldKey.trim().toLowerCase());

    if (keys.some((key) => !key)) {
      this.error.set('Every custom field must have a field key.');
      return;
    }

    if (new Set(keys).size !== keys.length) {
      this.error.set('Custom field keys must be unique.');
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
        id: field.id ?? null,
        fieldKey: field.fieldKey.trim(),
        label: field.label.trim(),
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        displayOrder: index,
        optionsJson: field.optionsJson,
        validationJson: field.validationJson
      }))
    };

    this.error.set(null);

    this.upsertAction.run(eventId, request);
  }

  private load(): void {
    const eventId = this.eventId();

    if (!eventId) {
      this.error.set('No event is selected.');
      return;
    }

    this.error.set(null);

    this.loadAction.run(eventId);
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
      closesAtUtc: ''
    });
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
      closesAtUtc: this.toLocalDateTime(model.closesAtUtc)
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
          validationJson: field.validationJson
        }))
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
