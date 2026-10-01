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
  Text = 1,
  TextArea = 2,
  Email = 3,
  Phone = 4,
  Number = 5,
  Date = 6,
  Select = 7,
  Radio = 8,
  Checkbox = 9,
}
