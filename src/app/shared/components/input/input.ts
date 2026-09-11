import { Component, input } from '@angular/core';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  required = input<boolean>(false);
}
