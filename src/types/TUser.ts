/* eslint-disable  @typescript-eslint/no-explicit-any */
// @/types/TUser.ts

export interface UserProfile {
  id: string;
  address: string | null;
  avatar_url: string | null;
  bio: string | null;
  broker: boolean;
  city: string | null;
  company_name: string | null;
  country: string | null;
  created_at: string;
  dob: string | null;
  education: string | null;
  employer: string | null;
  employer_status: string | null;
  facebook_url: string | null;
  first_name: string;
  last_name: string;
  role: string;
  company_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  // Add other profile fields as needed
}

export interface Stages {
  id: string;
  name: string | null;
  color: string | null;
}

export interface CustomerData {
  company_name: string | null;
  status: string | null;
  stages: Stages;
}

export interface User {
  id: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  deactivated_at: string | null;
  deactivated_by: string | null;
  email: string;
  lead_email: string;
  email_verified: boolean;
  is_active: boolean;
  is_approved: boolean;
  last_login: string | null;
  phone: string | null;
  profiles: UserProfile;
  customers: CustomerData;
  avatar_url: string | null;
  // For the nested users structure
  users?: {
    id: string;
    role: string;
    email: string | null;
    phone: string | null;
    signup: boolean;
    username: string | null;
    is_active: boolean;
    last_name: string;
    avatar_url: string | null;
    created_at: string;
    first_name: string;
    last_login: string | null;
    lead_email: string;
    lead_phone: string;
    updated_at: string;
    category_id: string | null;
    is_approved: boolean;
    customer_stage?: Stages[];
  };
  // Add mappings to our existing interface fields for backward compatibility
  first_name: string; // Will be mapped from profiles.first_name or users.first_name
  last_name: string; // Will be mapped from profiles.last_name or users.last_name
  phoneNumber: string | null; // Will be mapped from phone
  active: boolean; // Will be mapped from is_active
  approved: boolean; // Will be mapped from is_approved
  emailVerified: boolean; // Will be mapped from email_verified
  role: string;
  company_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  contract?: string;
  contract_uploaded?: boolean;
  registerAt: string; // Will be mapped from created_at
  additional_data?: Record<string, any>; // For any additional dynamic fields
}

export interface ApiResponse {
  limit: string;
  offset: string;
  total: number;
  users: User[];
}

// Sample users for initial testing/development
export const sampleUsers: User[] = [
  {
    id: "1",
    category_id: null,
    created_at: "2024-01-01T00:00:00",
    updated_at: "2024-01-01T00:00:00",
    deactivated_at: null,
    deactivated_by: null,
    email: "fixfinanzoffiziell@gmail.com",
    email_verified: true,
    is_active: true,
    lead_email: "fixfinanzoffiziell@gmail.com",
    is_approved: true,
    last_login: "vor 39 Minuten",
    phone: "+4999934534545",
    avatar_url: null,
    customers: {
      company_name: "Fixfinanz",
      status: "active",
      stages: {
        id: "e7f49db8-c492-46ff-8ff8-1b3bb2762109",
        name: "Standard",
        color: null,
      },
    },
    profiles: {
      id: "p1",
      address: null,
      avatar_url: null,
      bio: null,
      broker: false,
      city: null,
      company_name: null,
      country: null,
      created_at: "2024-01-01T00:00:00",
      dob: null,
      education: null,
      employer: null,
      employer_status: null,
      facebook_url: null,
      first_name: "Admin",
      last_name: "Fixfinanz",
      role: "admin",
      company_id: null,
      pipeline_id: null,
      stage_id: null,
    },
    first_name: "Admin",
    last_name: "Fixfinanz",
    phoneNumber: "+4999934534545",
    active: true,
    approved: true,
    company_id: null,
    pipeline_id: null,
    stage_id: null,
    emailVerified: true,
    role: "admin",
    // role: { name: "Admin", type: "admin" },
    registerAt: "vor 1 Jahr",
  },
  // Add more sample users as needed
];

// Simplified User interface for /users/info API response
export interface UserInfo {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email: string;
  lead_phone?: string | null;
  lead_email?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  is_approved: boolean;
  email_verified: boolean;
  role: string;
  last_login?: string | null;
  created_at: string;
  updated_at?: string;
  // Backward compatibility fields
  active?: boolean;
  approved?: boolean;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  registerAt?: string;
}
