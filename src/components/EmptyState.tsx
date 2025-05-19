import React from 'react';
import { FileUp } from 'lucide-react';

interface EmptyStateProps {
  onUploadClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onUploadClick }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div className="w-16 h-16 bg-[#18BB65]/10 rounded-full flex items-center justify-center mb-4">
        <FileUp className="text-[#18BB65]" size={24} />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">No documents yet</h2>
      <p className="text-gray-500 text-center max-w-sm mb-6">
        Upload a PDF document to start asking questions about its content
      </p>
      <button
        onClick={onUploadClick}
        className="bg-[#18BB65] hover:bg-[#149655] text-white font-medium px-6 py-2 rounded-lg transition-colors"
      >
        Upload your first PDF
      </button>
    </div>
  );
};

export default EmptyState;