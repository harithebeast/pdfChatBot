import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DocumentList from './components/DocumentList';
import ChatContainer from './components/ChatContainer';
import ChatInput from './components/ChatInput';
import EmptyState from './components/EmptyState';
import UploadModal from './components/UploadModal';
import { useConversation } from './hooks/useConversation';
import { uploadDocument, getDocuments, deleteDocument } from './services/api';

function App() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { state, addDocument, removeDocument, setActiveDocument, addUserMessage } = useConversation();

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const documents = await getDocuments();
        documents.forEach(addDocument);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading documents:', error);
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [addDocument]);

  const handleUpload = async (file: File) => {
    try {
      const document = await uploadDocument(file);
      addDocument(document);
      setIsUploadModalOpen(false);
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      removeDocument(documentId);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!state.activeDocument?.ready) {
      return;
    }
    addUserMessage(message);
  };

  const showEmptyState = !isLoading && state.documents.length === 0;
  const showChat = !isLoading && state.documents.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header onUploadClick={() => setIsUploadModalOpen(true)} />
      
      {state.documents.length > 0 && (
        <DocumentList 
          documents={state.documents}
          activeDocument={state.activeDocument}
          onDocumentSelect={setActiveDocument}
          onDocumentDelete={handleDelete}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#18BB65]"></div>
          </div>
        )}
        
        {showEmptyState && (
          <EmptyState onUploadClick={() => setIsUploadModalOpen(true)} />
        )}
        
        {showChat && (
          <>
            <ChatContainer 
              messages={state.messages} 
              isProcessing={state.isProcessing} 
            />
            <ChatInput 
              onSendMessage={handleSendMessage}
              isProcessing={state.isProcessing}
              disabled={!state.activeDocument?.ready}
            />
          </>
        )}
      </div>
      
      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}

export default App;