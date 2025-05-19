import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-[#18BB65] flex items-center justify-center text-white mr-2 flex-shrink-0">
          <span className="text-xs font-semibold">ai</span>
        </div>
      )}
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-[#9CA3AF] flex items-center justify-center text-white ml-2 flex-shrink-0">
          <span className="text-xs font-semibold">U</span>
        </div>
      )}
      
      <div 
        className={`px-4 py-3 rounded-2xl max-w-[80%] ${
          isUser 
            ? 'bg-gray-100 text-gray-800 order-first' 
            : 'bg-white border border-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;