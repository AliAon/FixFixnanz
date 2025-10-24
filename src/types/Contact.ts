/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  stage: string;
  leadSource: string;
  platform?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  pipeline?: string;
  pipeline_id?: string;
  stage_id?: string;
  additional_data?: any;
  customer?: {
    id: string;
    company_name: string;
    website: string;
    platform?: string;
  };
} 