export enum RegistrationStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4,
  Waitlisted = 5,
}

export enum ParticipantStatus {
  Active = 1,
  Cancelled = 2,
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
