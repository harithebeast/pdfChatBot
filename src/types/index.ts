export interface Document {
  id: string;
  filename: string;
  uploadDate: string;
  size: number;
  ready: boolean;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  documentId?: string;
}

export interface ConversationState {
  messages: Message[];
  documents: Document[];
  activeDocument: Document | null;
  isProcessing: boolean;
}