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

  it('ignores leading whitespace', () => {
    expect(pipe.transform('  annual summit')).toBe('Annual summit');
    expect(pipe.transform('\tmusic festival ')).toBe('Music festival');
  });

  it('skips leading non-letter characters', () => {
    expect(pipe.transform('"gala" night')).toBe('"Gala" night');
    expect(pipe.transform('#1 conference')).toBe('#1 Conference');
  });

  it('handles empty values', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform('   ')).toBe('');
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('leaves values without letters unchanged', () => {
    expect(pipe.transform('123')).toBe('123');
  });
});
