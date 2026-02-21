import React, { useState, useEffect } from 'react';
import './TickerBar.css';

interface TickerBarProps {
  enclaveStatus: 'active' | 'inactive' | 'loading';
  chainId: number;
  sessionId: string;
}

const TickerBar: React.FC<TickerBarProps> = ({ enclaveStatus, chainId, sessionId }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = () => {
    switch (enclaveStatus) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'loading':
        return 'status-loading';
      default:
        return '';
    }
  };

  const getChainName = (id: number) => {
    switch (id) {
      case 40875:
        return 'HOODI';
      case 11155111:
        return 'SEPOLIA';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className="ticker-bar">
      <div className="ticker-section">
        <span className="ticker-label">ENCLAVE</span>
        <span className={`ticker-value ${getStatusColor()}`}>
          {enclaveStatus.toUpperCase()}
          {enclaveStatus === 'active' && <span className="status-dot blink"></span>}
        </span>
      </div>

      <div className="ticker-divider"></div>

      <div className="ticker-section">
        <span className="ticker-label">CHAIN</span>
        <span className="ticker-value text-cyan">
          {getChainName(chainId)} [{chainId}]
        </span>
      </div>

      <div className="ticker-divider"></div>

      <div className="ticker-section">
        <span className="ticker-label">SESSION</span>
        <span className="ticker-value text-green">{sessionId}</span>
      </div>

      <div className="ticker-divider"></div>

      <div className="ticker-section">
        <span className="ticker-label">TIME</span>
        <span className="ticker-value">
          {currentTime.toISOString().split('T')[1].split('.')[0]} UTC
        </span>
      </div>

      <div className="ticker-spacer"></div>

      <div className="ticker-section ticker-right">
        <span className="ticker-label">SECLO</span>
        <span className="ticker-value text-cyan glow-cyan">v1.0.0</span>
      </div>
    </div>
  );
};

export default TickerBar;
