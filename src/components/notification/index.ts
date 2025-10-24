// components/notification/index.ts

export { default as TemplateCard } from './TemplateCard';
export type { EmailTemplate } from './TemplateCard';

export { default as TestEmailDialog } from './TestEmailDialog';

export { default as TemplateEditor } from './TemplateEditor';

// Re-export types for convenience
export type {
  EmailTemplate as NotificationEmailTemplate
} from './TemplateCard';