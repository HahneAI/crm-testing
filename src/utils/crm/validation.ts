import { Client, Job } from "../../types/crm";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateClient = (client: Partial<Client>): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Required fields
  if (!client.name || client.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Client name is required' });
  }

  // Email validation
  if (client.email && !isValidEmail(client.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  // Phone validation
  if (client.phone && !isValidPhoneNumber(client.phone)) {
    errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
  }

  // Address validation
  if (client.address) {
    if (client.address.zip && !isValidZipCode(client.address.zip)) {
      errors.push({ field: 'address.zip', message: 'Please enter a valid ZIP code' });
    }
  }

  return errors;
};

export const validateJob = (job: Partial<Job>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!job.title || job.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Job title is required' });
  }

  if (!job.client_id) {
    errors.push({ field: 'client_id', message: 'Client is required' });
  }

  if (job.start_date && job.end_date && new Date(job.start_date) > new Date(job.end_date)) {
    errors.push({ field: 'end_date', message: 'End date must be after start date' });
  }

  if (job.budget && job.budget < 0) {
    errors.push({ field: 'budget', message: 'Budget must be a positive number' });
  }

  return errors;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

const isValidZipCode = (zip: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
};
