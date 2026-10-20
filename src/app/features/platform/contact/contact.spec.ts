import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgForm } from '@angular/forms';

import { Contact } from './contact';
import { provideComponentTestProviders } from '../../../testing/component-providers';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;

  function fillForm(): void {
    component.name.set('  Test User  ');
    component.subject.set('  Question  ');
    component.message.set('  Hello from the contact form.  ');
  }

  function formStub(invalid = false): NgForm {
    return {
      invalid,
      control: { markAllAsTouched: vi.fn() }
    } as unknown as NgForm;
  }

  function whatsAppText(): string {
    const call = vi.mocked(window.open).mock.calls[0];
    const url = call[0] as string;

    return new URL(url).searchParams.get('text') ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
      providers: provideComponentTestProviders()
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('opens WhatsApp in a new tab with the trimmed form values', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window);
    fillForm();

    component.submit(formStub());

    expect(openSpy).toHaveBeenCalledTimes(1);

    const [url, target] = openSpy.mock.calls[0] as [string, string];

    expect(target).toBe('_blank');
    expect(url.startsWith('https://wa.me/919048931894?text=')).toBe(true);

    const text = whatsAppText();

    expect(text).toContain('Hello EventFlow,');
    expect(text).toContain('Name: Test User');
    expect(text).toContain('Subject: Question');
    expect(text).toContain('Hello from the contact form.');
    expect(component.whatsappOpened()).toBe(true);
  });

  it('shows the new-tab instruction and fallback link after submit', () => {
    vi.spyOn(window, 'open').mockReturnValue({} as Window);
    fillForm();

    component.submit(formStub());
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'WhatsApp is opening in a new tab'
    );

    const link = fixture.nativeElement.querySelector(
      'a[href^="https://wa.me/919048931894?text="]'
    ) as HTMLAnchorElement;

    expect(link).toBeTruthy();
    expect(link.target).toBe('_blank');
  });

  it('does not open WhatsApp for an invalid form', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window);
    const markAllAsTouched = vi.fn();
    const form = {
      invalid: true,
      control: { markAllAsTouched }
    } as unknown as NgForm;

    component.submit(form);

    expect(markAllAsTouched).toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(component.whatsappOpened()).toBe(false);
  });

  it('does not open WhatsApp when the name is blank', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue({} as Window);
    fillForm();
    component.name.set('   ');

    component.submit(formStub());

    expect(openSpy).not.toHaveBeenCalled();
    expect(component.whatsappOpened()).toBe(false);
  });

  it('updates the form signals from user input', () => {
    const nameInput = fixture.nativeElement.querySelector(
      '#contact-name'
    ) as HTMLInputElement;
    const messageInput = fixture.nativeElement.querySelector(
      '#contact-message'
    ) as HTMLTextAreaElement;

    nameInput.value = 'Ada Lovelace';
    nameInput.dispatchEvent(new Event('input'));
    messageInput.value = 'I would like to know more.';
    messageInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.name()).toBe('Ada Lovelace');
    expect(component.message()).toBe('I would like to know more.');
  });

  it('uses a general enquiry subject when the subject is blank', () => {
    vi.spyOn(window, 'open').mockReturnValue({} as Window);
    fillForm();
    component.subject.set('   ');

    component.submit(formStub());

    expect(whatsAppText()).toContain('Subject: General enquiry');
  });
});
