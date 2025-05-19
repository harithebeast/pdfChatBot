import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { Message } from '../types';
import { Loader2 } from 'lucide-react';

interface ChatContainerProps {
  messages: Message[];
  isProcessing: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isProcessing }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isProcessing && (
          <div className="flex items-center text-gray-500 my-4">
            <div className="w-8 h-8 rounded-full bg-[#18BB65] flex items-center justify-center text-white mr-2 flex-shrink-0">
              <span className="text-xs font-semibold">ai</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-gray-200 max-w-[80%]">
              <div className="flex items-center">
                <Loader2 size={14} className="animate-spin mr-2" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatContainer;