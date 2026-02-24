import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import TickerBar from './TickerBar';
import './AIInterface.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/ai/query', {
        query: input
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message || JSON.stringify(response.data, null, 2),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `ERROR: ${error.response?.data?.message || error.message || 'Failed to process request'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <>
      <TickerBar 
        enclaveStatus="active" 
        chainId={40875}
      />
      
      <div className="ai-container">
        <div className="ai-header">
          <h1 className="ai-title">AI_ASSISTANT</h1>
          <span className="ai-subtitle">NATURAL LANGUAGE PAYROLL PROCESSING</span>
        </div>

        <div className="ai-chat-container">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-icon">[AI]</div>
                <div className="empty-text">START_CONVERSATION</div>
                <div className="empty-text text-muted">
                  Try: "Pay Alice 5000 SCLO"
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message message-${message.role}`}
                  >
                    <div className="message-header">
                      [{message.role === 'user' ? 'USER' : 'AI'}]
                    </div>
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-timestamp">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="loading-indicator">
                    <span className="text-cyan">[AI]</span>
                    <span>PROCESSING</span>
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="chat-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter payroll command..."
              className="chat-input"
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || loading}
              className="chat-send-button"
            >
              <span>[&gt;]</span>
              SEND
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AIInterface;
