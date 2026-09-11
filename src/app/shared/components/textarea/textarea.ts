import { Component, input } from '@angular/core';

@Component({
  selector: 'app-textarea',
  imports: [],
  templateUrl: './textarea.html',
  styleUrl: './textarea.css',
})
export class Textarea {
  label = input<string>('');
  placeholder = input<string>('');
  rows = input<number>(4);
}
