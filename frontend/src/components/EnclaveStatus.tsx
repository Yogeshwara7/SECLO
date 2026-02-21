import React from 'react';
import './EnclaveStatus.css';

interface EnclaveStatusProps {
  confidentialHttpActive: boolean;
  secretsLoaded: boolean;
  workflowStatus: 'idle' | 'running' | 'success' | 'error';
  lastExecution?: string;
}

const EnclaveStatus: React.FC<EnclaveStatusProps> = ({
  confidentialHttpActive,
  secretsLoaded,
  workflowStatus,
  lastExecution
}) => {
  const getStatusIcon = (active: boolean) => {
    return active ? '[✓]' : '[✗]';
  };

  const getWorkflowStatusColor = () => {
    switch (workflowStatus) {
      case 'running':
        return 'text-yellow';
      case 'success':
        return 'text-green';
      case 'error':
        return 'text-red';
      default:
        return 'text-cyan';
    }
  };

  return (
    <div className="enclave-status-panel">
      <div className="panel-header">
        <span className="panel-title">ENCLAVE STATUS</span>
        <span className="panel-indicator pulse"></span>
      </div>

      <div className="status-grid">
        <div className="status-item">
          <span className="status-label">CONFIDENTIAL HTTP</span>
          <span className={`status-value ${confidentialHttpActive ? 'text-green' : 'text-red'}`}>
            {getStatusIcon(confidentialHttpActive)} {confidentialHttpActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">DON SECRETS</span>
          <span className={`status-value ${secretsLoaded ? 'text-green' : 'text-red'}`}>
            {getStatusIcon(secretsLoaded)} {secretsLoaded ? 'LOADED' : 'NOT LOADED'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">WORKFLOW</span>
          <span className={`status-value ${getWorkflowStatusColor()}`}>
            {workflowStatus.toUpperCase()}
          </span>
        </div>

        {lastExecution && (
          <div className="status-item">
            <span className="status-label">LAST EXECUTION</span>
            <span className="status-value text-cyan">
              {new Date(lastExecution).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      <div className="metrics-grid">
        <div className="metric-box">
          <div className="metric-label">LOAD</div>
          <div className="metric-value text-green">
            {Math.floor(Math.random() * 30 + 10)}%
          </div>
          <div className="metric-bar">
            <div className="metric-bar-fill" style={{ width: '25%' }}></div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-label">TEMP</div>
          <div className="metric-value text-cyan">
            {Math.floor(Math.random() * 20 + 45)}°C
          </div>
          <div className="metric-bar">
            <div className="metric-bar-fill" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-label">MEM</div>
          <div className="metric-value text-yellow">
            {Math.floor(Math.random() * 40 + 30)}%
          </div>
          <div className="metric-bar">
            <div className="metric-bar-fill" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnclaveStatus;
