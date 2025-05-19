import axios from 'axios';
import { Document, Message } from '../types';

const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return {
    id: response.data.id,
    filename: response.data.filename,
    uploadDate: response.data.uploadDate,
    size: response.data.size,
    ready: response.data.ready
  };
};

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/documents');
  return response.data.map((doc: any) => ({
    id: doc.id,
    filename: doc.filename,
    uploadDate: doc.uploadDate,
    size: doc.size,
    ready: doc.ready
  }));
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await api.delete(`/documents/${documentId}`);
};

export const askQuestion = async (question: string, documentId: string): Promise<Message> => {
  const response = await api.post('/question', {
    question,
    document_id: documentId
  });
  
  return {
    id: `ai-${Date.now()}`,
    content: response.data.answer,
    role: 'assistant',
    timestamp: new Date().toISOString(),
    documentId,
  };
};