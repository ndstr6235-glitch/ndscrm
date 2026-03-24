export type Role = "administrator" | "supervisor" | "broker";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
  createdAt: string;
  signature: string;
}

export interface Payment {
  amount: number;
  percent: number;
  profit: number;
  date: string;
  note: string;
}

export type ClientStage = "NEW" | "CONTACTED" | "NEGOTIATION" | "INVESTOR" | "VIP";
export type ClientScore = "A" | "B" | "C" | "D";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  callDate: string;
  nextPaymentDate: string;
  paymentFreq: number;
  note: string;
  stage: ClientStage;
  assignedTo: string;
  payments: Payment[];
  createdAt: string;
}

export type EventType = "call" | "payment" | "reminder" | "interest" | "meeting";

export interface CalEvent {
  id: string;
  clientId: string;
  userId: string;
  type: EventType;
  title: string;
  date: string;
  time: string;
  note: string;
  createdAt: string;
}

export interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  body: string;
  allowedRoles: Role[];
}
