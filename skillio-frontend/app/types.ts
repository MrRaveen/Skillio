export enum AppView {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  VERIFICATION = 'VERIFICATION',
  PLAN_SELECTION = 'PLAN_SELECTION',
  DASHBOARD = 'DASHBOARD'
}

export interface CompanyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CompanyDetails {
  name: string;
  size: string;
  industry: string;
  address: CompanyAddress;
  website: string;
  // Contact & Security
  companyContact: string;
  personalContact: string;
  companyEmail: string;
  ownerEmail: string;
  password: string;
}

export interface User {
  email: string;
  role: 'admin' | 'manager' | 'employee';
  company?: CompanyDetails;
}

export enum PlanTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE'
}