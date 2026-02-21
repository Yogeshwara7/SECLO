import React, { useEffect, useRef } from 'react';
import './TerminalOutput.css';

interface TerminalLine {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system';
  message: string;
}

interface TerminalOutputProps {
  lines: TerminalLine[];
  isRunning: boolean;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ lines, isRunning }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'terminal-line-success';
      case 'error':
        return 'terminal-line-error';
      case 'warning':
        return 'terminal-line-warning';
      case 'system':
        return 'terminal-line-system';
      default:
        return 'terminal-line-info';
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-header">
        <div className="terminal-title">
          <span className="terminal-icon">&gt;_</span>
          <span>CRE WORKFLOW OUTPUT</span>
        </div>
        <div className="terminal-controls">
          {isRunning && (
            <span className="terminal-status">
              <span className="status-dot blink"></span>
              RUNNING
            </span>
          )}
        </div>
      </div>

      <div className="terminal-body" ref={terminalRef}>
        {lines.length === 0 ? (
          <div className="terminal-empty">
            <span className="terminal-cursor blink">_</span>
            <span className="text-muted">Waiting for workflow execution...</span>
          </div>
        ) : (
          lines.map((line, index) => (
            <div key={index} className={`terminal-line ${getLineClass(line.type)}`}>
              <span className="terminal-timestamp">[{line.timestamp}]</span>
              <span className="terminal-message">{line.message}</span>
            </div>
          ))
        )}
        {isRunning && (
          <div className="terminal-line">
            <span className="terminal-cursor blink">_</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalOutput;
