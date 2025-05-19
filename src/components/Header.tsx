import React from 'react';
import { Upload } from 'lucide-react';

interface HeaderProps {
  onUploadClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUploadClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#18BB65] flex items-center justify-center text-white mr-2">
          <span className="text-lg font-semibold">ai</span>
        </div>
        <div>
          <h1 className="font-bold text-lg">planet</h1>
          <p className="text-xs text-gray-500">formerly DPhi</p>
        </div>
      </div>
      
      <button 
        onClick={onUploadClick}
        className="flex items-center bg-white border border-gray-300 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <Upload size={16} className="mr-2" />
        Upload PDF
      </button>
    </header>
  );
};

export default Header;