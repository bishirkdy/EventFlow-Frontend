import { CapitalizePipe } from './capitalize.pipe';

describe('CapitalizePipe', () => {
  const pipe = new CapitalizePipe();

  it('uppercases the first letter and keeps the rest', () => {
    expect(pipe.transform('published')).toBe('Published');
    expect(pipe.transform('in progress')).toBe('In progress');
  });

  it('leaves an already capitalised value unchanged', () => {
    expect(pipe.transform('Published')).toBe('Published');
    expect(pipe.transform('Conference & Business')).toBe('Conference & Business');
  });

  it('handles empty values', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
