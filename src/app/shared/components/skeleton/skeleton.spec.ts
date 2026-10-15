import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  let fixture: ComponentFixture<Skeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Skeleton] }).compileComponents();
    fixture = TestBed.createComponent(Skeleton);
    await fixture.whenStable();
  });

  it('renders a single block by default', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('div').length).toBe(1);
  });

  it('renders one block per count with the given shape', () => {
    fixture.componentRef.setInput('count', 4);
    fixture.componentRef.setInput('blockClass', 'h-24 w-full');
    fixture.detectChanges();

    const blocks = fixture.nativeElement.querySelectorAll('div');
    expect(blocks.length).toBe(4);
    const classes = (blocks[0].className as string).split(/\s+/);
    expect(classes).toContain('animate-pulse');
    expect(classes).toContain('h-24');
    expect(classes).toContain('w-full');
  });
});
