import React from 'react';
import TickerBar from '../components/TickerBar';
import TenderlySimulator from '../components/TenderlySimulator';
import './Tenderly.css';

const Tenderly = () => {
  return (
    <>
      <TickerBar 
        enclaveStatus="active" 
        chainId={40875}
      />
      
      <div className="tenderly-container">
        <div className="tenderly-header">
          <h1 className="tenderly-title">TENDERLY_INTEGRATION</h1>
          <span className="tenderly-subtitle">BLOCKCHAIN SIMULATION & TESTING</span>
        </div>

        <div className="tenderly-content">
          <div className="info-panel">
            <h3 className="info-title">ABOUT_TENDERLY</h3>
            <p className="info-text">
              Tenderly provides blockchain simulation capabilities, allowing you to test 
              payroll transactions before executing them on-chain. This helps prevent 
              failed transactions and reduces gas costs.
            </p>
            
            <div className="info-features">
              <div className="feature-item">
                <span className="feature-icon">[✓]</span>
                <span className="feature-text">Pre-execution transaction testing</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">[✓]</span>
                <span className="feature-text">Gas estimation and optimization</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">[✓]</span>
                <span className="feature-text">Detailed transaction traces</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">[✓]</span>
                <span className="feature-text">Event log analysis</span>
              </div>
            </div>

            <div className="info-links">
              <a 
                href="https://dashboard.tenderly.co/Yogii/seclo-payroll" 
                target="_blank" 
                rel="noopener noreferrer"
                className="info-link"
              >
                [OPEN_DASHBOARD] →
              </a>
              <a 
                href="https://docs.tenderly.co/simulations-and-forks/simulation-api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="info-link"
              >
                [VIEW_DOCS] →
              </a>
            </div>
          </div>

          <TenderlySimulator />
        </div>

        <div className="usage-guide">
          <h3 className="guide-title">USAGE_GUIDE</h3>
          <div className="guide-steps">
            <div className="guide-step">
              <span className="step-number">[1]</span>
              <span className="step-text">Connect your wallet using the button in the navbar</span>
            </div>
            <div className="guide-step">
              <span className="step-number">[2]</span>
              <span className="step-text">Enter employee wallet addresses (comma-separated)</span>
            </div>
            <div className="guide-step">
              <span className="step-number">[3]</span>
              <span className="step-text">Enter corresponding payment amounts in SCLO</span>
            </div>
            <div className="guide-step">
              <span className="step-number">[4]</span>
              <span className="step-text">Click RUN_SIMULATION to test the transaction</span>
            </div>
            <div className="guide-step">
              <span className="step-number">[5]</span>
              <span className="step-text">Review results and view detailed traces in Tenderly dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tenderly;
