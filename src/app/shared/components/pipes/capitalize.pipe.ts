import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
  standalone: true,
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const text = (value ?? '').trim();

    if (!text) {
      return '';
    }

    const index = text.search(/[A-Za-zÀ-ÖØ-öø-ÿ]/);

    if (index === -1) {
      return text;
    }

    return text.slice(0, index) + text.charAt(index).toUpperCase() + text.slice(index + 1);
  }
}
