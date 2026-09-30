import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketComponent } from './ticket';

const ticket = {
  id: 'ticket-1',
  registrationId: 'registration-1',
  participantId: 'participant-1',
  ticketNumber: 'EVT-0001',
  qrCodeValue: 'ticket-qr-value',
  issuedAtUtc: '2026-09-30T00:00:00Z',
  revokedAtUtc: null,
  isActive: true,
};

describe('TicketComponent', () => {
  let component: TicketComponent;
  let fixture: ComponentFixture<TicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('ticket', ticket);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
