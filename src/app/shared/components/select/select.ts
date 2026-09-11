import { Component, input } from '@angular/core';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class Select {
  label = input<string>('');
  placeholder = input<string>('Select an option');
  options = input<SelectOption[]>([]);
}
