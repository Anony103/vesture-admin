

export type ApiResponseType<T> = {
  message: string;
  status: boolean;
  result: T;
  responseMessage: string;
  code ?: number 
};

interface Role {
  id: number;
  name: string;
}

interface Authority {
  authority: string;
}

export interface User {
  id ?: string;
  firstName ?: string;
  middleName ?: string;
  lastName ?: string;
  sectorPP: string;
  uniqueRef: string;
  ippisNo: string;
  bvn: string;
  gender: string;
  placeOfBirth: string;
  dateOfBirth: string | null;
  state: string;
  phoneNumber: string;
  address: string;
  organization: string;
  nextOfKin: string;
  nokNumber: string;
  ninDocument: string;
  supportingDocument: string;
  signatureDocument: string;
  accountNumber: string | null;
  balance: number | null;
  totalBalance: number | null;
  pin: string | null;
  status: string | null;
  username: string;
  email: string | null;
  password: string;
  otp: string | null;
  isVerified: boolean | null;
  isCompleted: boolean | null;
  bankOneAccountNumber: string | null;
  hasProvidusAccount: boolean | null;
  providusAccountNumber: string | null;
  bankOneResponse ?: string | null; // Replace 'any' with more specific type if known
  updatedBy: string | null;
  created_on: string;
  updated_on: string;
  roles: Role[];
  enabled: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  accountNonExpired: boolean;
  hasBankOneAccount: boolean | null;
  authorities: Authority[];
}

interface Role {
  id: number;
  name: string;
}

interface Authority {
  authority: string;
}

export interface AdminUser {
  id: number;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  sectorPP: string | null;
  uniqueRef: string | null;
  ippisNo: string | null;
  bvn: string | null;
  gender: string | null;
  placeOfBirth: string | null;
  dateOfBirth: string | null;
  state: string | null;
  phoneNumber: string | null;
  address: string | null;
  organization: string | null;
  nextOfKin: string | null;
  nokNumber: string | null;
  ninDocument: string | null;
  supportingDocument: string | null;
  signatureDocument: string | null;
  accountNumber: string | null;
  balance: number | null;
  totalBalance: number | null;
  pin: string | null;
  status: string | null;
  username: string | null;
  email: string;
  password: string;
  otp: string | null;
  isVerified: boolean | null;
  isCompleted: boolean | null;
  bankOneAccountNumber: string | null;
  hasProvidusAccount: boolean | null;
  providusAccountNumber: string | null;
  bankOneResponse: string | null;
  updatedBy: string | null;
  created_on: string;
  updated_on: string;
  roles: Role[];
  enabled: boolean;
  authorities: Authority[];
  credentialsNonExpired: boolean;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  hasBankOneAccount: boolean | null;
}
// Example usage:
