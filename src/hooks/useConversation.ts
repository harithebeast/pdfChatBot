import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Document, Message, ConversationState } from '../types';
import { askQuestion } from '../services/api';

// Initial state
const initialState: ConversationState = {
  messages: [],
  documents: [],
  activeDocument: null,
  isProcessing: false,
};

export const useConversation = () => {
  const [state, setState] = useState<ConversationState>(initialState);
  
  const addDocument = useCallback((document: Document) => {
    setState((prevState) => ({
      ...prevState,
      documents: [...prevState.documents, document],
      activeDocument: document,
    }));
  }, []);
  
  const removeDocument = useCallback((documentId: string) => {
    setState((prevState) => {
      const newDocuments = prevState.documents.filter(doc => doc.id !== documentId);
      const newActiveDocument = prevState.activeDocument?.id === documentId
        ? newDocuments[0] || null
        : prevState.activeDocument;
      const newMessages = prevState.messages.filter(msg => msg.documentId !== documentId);
      
      return {
        ...prevState,
        documents: newDocuments,
        activeDocument: newActiveDocument,
        messages: newMessages,
      };
    });
  }, []);
  
  const setActiveDocument = useCallback((document: Document) => {
    setState((prevState) => ({
      ...prevState,
      activeDocument: document,
    }));
  }, []);
  
  const addUserMessage = useCallback((content: string) => {
    if (!state.activeDocument) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date().toISOString(),
      documentId: state.activeDocument.id,
    };
    
    setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, userMessage],
      isProcessing: true,
    }));
    
    askQuestion(content, state.activeDocument.id)
      .then((aiResponse) => {
        setState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, aiResponse],
          isProcessing: false,
        }));
      })
      .catch((error) => {
        console.error('Error asking question:', error);
        
        const errorMessage: Message = {
          id: uuidv4(),
          content: 'Sorry, I encountered an error processing your question. Please try again.',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          documentId: state.activeDocument?.id,
        };
        
        setState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, errorMessage],
          isProcessing: false,
        }));
      });
  }, [state.activeDocument, state.messages]);
  
  return {
    state,
    addDocument,
    removeDocument,
    setActiveDocument,
    addUserMessage,
  };
};