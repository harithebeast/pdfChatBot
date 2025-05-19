import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isProcessing,
  disabled 
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-t border-gray-200 p-4 bg-gray-50"
    >
      <div className="flex items-center bg-white rounded-full border border-gray-300 px-4 py-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 outline-none text-sm"
          disabled={isProcessing || disabled}
        />
        <button
          type="submit"
          disabled={!message.trim() || isProcessing || disabled}
          className={`ml-2 text-gray-400 ${
            message.trim() && !isProcessing && !disabled
              ? 'text-[#18BB65] hover:text-[#149655]' 
              : 'cursor-not-allowed'
          }`}
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;