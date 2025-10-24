export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Campaign {
  id: string;
  name: string;
  campaignId: string;
  advisor: User;
  status: 'Active' | 'Paused' | 'Completed';
  pipelineName: string;
  stageName: string;
  leads: number;
  leadsData?: Lead[];
  insights?: CampaignInsights;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  platform: 'facebook' | 'instagram';
  createdAt: string;
  imported?: boolean;
  exists?: boolean;
}

export interface CampaignInsights {
  period: string;
  accountName: string;
  spend: number;
  costPerUniqueClick: number;
  clicks: number;
  cpc: number;
  cpp: number;
  ctr: number;
  cpm: number;
  impressions?: number;
  leadConversionRate?: number;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

export interface Stage {
  id: string;
  name: string;
  pipelineId: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  ads: MetaAd[];
}

export interface MetaAd {
  id: string;
  name: string;
  campaignId: string;
  leads: Lead[];
}

export interface CreateCampaignData {
  user?: User;
  pipeline?: Pipeline;
  stage?: Stage;
  metaCampaign?: MetaCampaign;
  selectedAd?: MetaAd;
  selectedLeads: Lead[];
}