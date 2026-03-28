export type Phase = "intro" | "heart" | "story";

export interface StoryNode {
  id: string;
  title: string;
  date?: string;
  description: string;
  image?: string;
}

export interface LetterContent {
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
}

export interface SiteConfig {
  metDate: string;
  entryTitle: string;
  entryButton: string;
  proposalQuestion: string;
  acceptButton: string;
  declineButton: string;
  togetherTitle: string;
  togetherSubtitle: string;
}
