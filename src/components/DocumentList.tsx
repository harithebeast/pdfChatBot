import React from 'react';
import { FileText, AlertCircle, Trash2 } from 'lucide-react';
import { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  activeDocument: Document | null;
  onDocumentSelect: (document: Document) => void;
  onDocumentDelete: (documentId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  activeDocument, 
  onDocumentSelect,
  onDocumentDelete
}) => {
  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 py-3 px-6">
      <h2 className="text-sm font-medium text-gray-700 mb-2">Your Documents</h2>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center">
            <button
              onClick={() => onDocumentSelect(doc)}
              disabled={!doc.ready}
              className={`flex items-center px-3 py-2 rounded-lg text-sm whitespace-nowrap ${
                activeDocument?.id === doc.id
                  ? 'bg-[#18BB65]/10 text-[#18BB65] border border-[#18BB65]/30'
                  : doc.ready
                  ? 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed'
              }`}
            >
              {doc.ready ? (
                <FileText size={14} className="mr-2" />
              ) : (
                <AlertCircle size={14} className="mr-2 text-yellow-500" />
              )}
              {doc.filename}
              {!doc.ready && (
                <span className="ml-2 text-xs text-yellow-500">(Processing...)</span>
              )}
            </button>
            <button
              onClick={() => onDocumentDelete(doc.id)}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
              title="Delete document"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;