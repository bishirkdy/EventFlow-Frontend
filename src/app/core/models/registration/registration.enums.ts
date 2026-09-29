export enum RegistrationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancelled = 3,
  Waitlisted = 4,
}

export enum ParticipantStatus {
  Active = 0,
  Cancelled = 1,
}

export enum CapacityMode {
  Unlimited = 0,
  Limited = 1,
}

export enum RegistrationFieldType {
  Text = 0,
  TextArea = 1,
  Email = 2,
  Phone = 3,
  Number = 4,
  Date = 5,
  Select = 6,
  Radio = 7,
  Checkbox = 8,
}
