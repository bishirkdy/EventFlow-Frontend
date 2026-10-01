import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { RegistrationFieldType } from '../../../../../core/models/registration/registration.enums';
import { RegistrationFormFieldModel } from '../../../../../core/models/registration/registration-form.model';

@Component({
  selector: 'app-registration-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './registration-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegistrationFieldComponent {
  readonly field = input.required<RegistrationFormFieldModel>();
  readonly control = input.required<FormControl<string>>();

  protected readonly fieldType = computed(() => this.field().fieldType);
  protected readonly isRequired = computed(() => this.field().isRequired);
  protected readonly isTextArea = computed(
    () => this.fieldType() === RegistrationFieldType.TextArea,
  );
  protected readonly isSelect = computed(
    () => this.fieldType() === RegistrationFieldType.Select,
  );
  protected readonly isRadio = computed(
    () => this.fieldType() === RegistrationFieldType.Radio,
  );
  protected readonly isCheckbox = computed(
    () => this.fieldType() === RegistrationFieldType.Checkbox,
  );

  protected readonly inputType = computed(() => {
    switch (this.fieldType()) {
      case RegistrationFieldType.Email:
        return 'email';
      case RegistrationFieldType.Phone:
        return 'tel';
      case RegistrationFieldType.Number:
        return 'number';
      case RegistrationFieldType.Date:
        return 'date';
      default:
        return 'text';
    }
  });

  protected readonly options = computed(() => {
    const json = this.field().optionsJson;

    if (!json) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(json);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter(
        (option): option is string =>
          typeof option === 'string' && option.trim().length > 0,
      );
    } catch {
      return [];
    }
  });

  protected hasError(): boolean {
    const control = this.control();
    return control.invalid && control.touched;
  }

  protected errorMessage(): string {
    const control = this.control();

    if (control.hasError('required')) {
      return `${this.field().label} is required.`;
    }

    if (control.hasError('email')) {
      return `${this.field().label} must be a valid email address.`;
    }

    if (control.hasError('minlength')) {
      return `${this.field().label} is too short.`;
    }

    if (control.hasError('maxlength')) {
      return `${this.field().label} is too long.`;
    }

    if (control.hasError('min')) {
      return `${this.field().label} is below the minimum.`;
    }

    if (control.hasError('max')) {
      return `${this.field().label} is above the maximum.`;
    }

    if (control.hasError('pattern')) {
      return `${this.field().label} has an invalid format.`;
    }

    return `${this.field().label} is invalid.`;
  }

  protected setCheckboxValue(checked: boolean): void {
    const control = this.control();
    control.setValue(checked ? 'true' : 'false');
    control.markAsDirty();
    control.markAsTouched();
  }
}
