import type { CustomerProfile } from '../types/customer';

export function getCustomerGreetingName(profile: CustomerProfile | null): string {
  if (profile?.firstName?.trim()) {
    return profile.firstName.trim();
  }

  const email = profile?.email?.trim();
  if (email) {
    return email.split('@')[0] ?? 'there';
  }

  return 'there';
}

export function getCustomerFullName(profile: CustomerProfile | null): string {
  const firstName = profile?.firstName?.trim() ?? '';
  const lastName = profile?.lastName?.trim() ?? '';

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (firstName) {
    return firstName;
  }

  if (lastName) {
    return lastName;
  }

  return profile?.email?.trim() ?? 'Stooping Club member';
}

export function getCustomerInitial(profile: CustomerProfile | null): string {
  const firstName = profile?.firstName?.trim();
  if (firstName) {
    return firstName[0].toUpperCase();
  }

  const email = profile?.email?.trim();
  if (email) {
    return email[0].toUpperCase();
  }

  return 'S';
}
