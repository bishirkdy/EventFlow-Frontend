import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateWords',
  standalone: true,
})
export class TruncateWordsPipe implements PipeTransform {
  transform(text: string | null | undefined, limit = 50): string {
    if (!text) {
      return '';
    }

    const words = text.trim().split(/\s+/);

    if (words.length <= limit) {
      return text;
    }

    return words.slice(0, limit).join(' ') + '...';
  }
}
