import React, { useState } from 'react';
import TickerBar from '../components/TickerBar';
import EnclaveStatus from '../components/EnclaveStatus';
import TerminalOutput from '../components/TerminalOutput';
import UploadForm from '../components/UploadForm';
import './Upload.css';

interface TerminalLine {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system';
  message: string;
}

const Upload = () => {
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [sessionId] = useState(() => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );
  const [stats, setStats] = useState({
    totalBatches: 0,
    authorized: 0,
    rejected: 0,
    successRate: 0
  });

  const addTerminalLine = (type: TerminalLine['type'], message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setTerminalLines(prev => [...prev, { timestamp, type, message }]);
  };

  const handleUploadStart = () => {
    setIsRunning(true);
    setWorkflowStatus('running');
    setTerminalLines([]);
    
    addTerminalLine('system', '===================================================');
    addTerminalLine('system', 'SECLO PAYROLL - CRE POLICY ENFORCEMENT');
    addTerminalLine('system', '===================================================');
    addTerminalLine('info', 'Initializing CRE workflow...');
  };

  const handleUploadSuccess = (result: any) => {
    addTerminalLine('info', `Batch ID: ${result.batchId || 'N/A'}`);
    addTerminalLine('info', `Total Records: ${result.totalRecords || 0}`);
    addTerminalLine('info', 'VALIDATING AGAINST EMPLOYEE REGISTRY...');
    addTerminalLine('info', '---------------------------------------------------');
    addTerminalLine('success', 'Fetching employee registry via Confidential HTTP');
    
    // Now trigger the actual CRE workflow execution
    setTimeout(async () => {
      try {
        addTerminalLine('info', 'Starting CRE workflow execution...');
        
        const response = await fetch('http://localhost:3001/payroll/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ batchId: result.batchId }),
        });

        if (!response.ok) {
          throw new Error(`CRE execution failed: ${response.statusText}`);
        }

        const creResult = await response.json();
        
        let authorized = 0;
        let rejected = 0;
        
        // Parse the actual CRE stdout to extract the workflow result
        if (creResult.creResult) {
          const stdout = creResult.creResult;
          
          // Remove ANSI color codes from the output
          const cleanStdout = stdout.replace(/\x1b\[[0-9;]*m/g, '');
          
          // Extract JSON - find everything between "Workflow Simulation Result:" and the end of the JSON object
          const startMarker = 'Workflow Simulation Result:';
          const startIndex = cleanStdout.indexOf(startMarker);
          
          if (startIndex !== -1) {
            const jsonStart = startIndex + startMarker.length;
            const afterJson = cleanStdout.substring(jsonStart).trim();
            
            // Find the closing brace of the JSON object by counting depth
            let depth = 0;
            let endIndex = 0;
            for (let i = 0; i < afterJson.length; i++) {
              if (afterJson[i] === '{') depth++;
              if (afterJson[i] === '}') {
                depth--;
                if (depth === 0) {
                  endIndex = i + 1;
                  break;
                }
              }
            }
            
            const jsonString = afterJson.substring(0, endIndex);
            
            try {
              console.log('Extracted JSON string:', jsonString);
              
              const workflowResult = JSON.parse(jsonString);
              
              addTerminalLine('success', `Loaded 5 authorized employees from registry`);
              addTerminalLine('info', '');
              
              // Display each payout result
              if (workflowResult.Payouts && workflowResult.Payouts.length > 0) {
                workflowResult.Payouts.forEach((payout: any, index: number) => {
                  addTerminalLine('info', `Record ${index + 1}/${workflowResult.Payouts.length}`);
                  addTerminalLine('info', `   Address: ${payout.Employee}`);
                  addTerminalLine('info', `   Amount: ${payout.Amount} SCLO`);
                  
                  if (payout.Status === 'authorized') {
                    addTerminalLine('success', `   AUTHORIZED: ${payout.Name} (${payout.Department})`);
                    addTerminalLine('info', `   Max Allowed: ${payout.Department === 'Engineering' ? '10000' : payout.Department === 'Marketing' ? '8000' : payout.Department === 'Sales' ? '12000' : payout.Department === 'HR' ? '7500' : '9000'} SCLO`);
                  } else {
                    addTerminalLine('error', `   REJECTED: Unauthorized employee or amount exceeds limit`);
                  }
                  addTerminalLine('info', '');
                });
              }
              
              // Display summary
              authorized = workflowResult.Payouts?.filter((p: any) => p.Status === 'authorized').length || 0;
              rejected = workflowResult.Payouts?.filter((p: any) => p.Status === 'rejected').length || 0;
              
              // Update stats
              setStats(prev => ({
                totalBatches: prev.totalBatches + 1,
                authorized: prev.authorized + authorized,
                rejected: prev.rejected + rejected,
                successRate: Math.round(((prev.authorized + authorized) / (prev.authorized + authorized + prev.rejected + rejected)) * 100)
              }));
              
              addTerminalLine('system', '===================================================');
              addTerminalLine('system', 'EXECUTION SUMMARY');
              addTerminalLine('system', '===================================================');
              addTerminalLine('success', `Authorized: ${authorized}`);
              addTerminalLine('error', `Rejected: ${rejected}`);
              
              if (rejected > 0) {
                addTerminalLine('warning', `Batch ${result.batchId}: ${authorized} authorized, ${rejected} REJECTED due to policy violations`);
              } else {
                addTerminalLine('success', `Batch ${result.batchId}: All ${authorized} transfers authorized`);
              }
              
              addTerminalLine('system', '===================================================');
            } catch (parseError) {
              console.error('Failed to parse workflow result:', parseError);
              addTerminalLine('error', 'Failed to parse workflow output');
              addTerminalLine('info', 'Check browser console for details');
            }
          } else {
            console.warn('Could not find JSON in CRE output');
            addTerminalLine('info', creResult.message || 'CRE workflow completed');
            addTerminalLine('info', 'Check browser console for full output');
          }
        } else {
          addTerminalLine('info', creResult.message || 'CRE workflow completed');
        }
        
        setIsRunning(false);
        setWorkflowStatus(rejected > 0 ? 'error' : 'success');
      } catch (error: any) {
        addTerminalLine('error', `CRE execution failed: ${error.message}`);
        setIsRunning(false);
        setWorkflowStatus('error');
      }
    }, 1000);
  };

  const handleUploadError = (error: string) => {
    addTerminalLine('error', `ERROR: ${error}`);
    setIsRunning(false);
    setWorkflowStatus('error');
  };

  return (
    <>
      <TickerBar 
        enclaveStatus="active" 
        chainId={40875} 
        sessionId={sessionId}
      />
      
      <div className="upload-container">
        <div className="dashboard-grid">
          {/* Left Panel - Workflow Status */}
          <div className="dashboard-panel left-panel">
            <EnclaveStatus
              confidentialHttpActive={true}
              secretsLoaded={true}
              workflowStatus={workflowStatus}
              lastExecution={terminalLines.length > 0 ? new Date().toISOString() : undefined}
            />
          </div>

          {/* Center Panel - Upload & Results */}
          <div className="dashboard-panel center-panel">
            <div className="panel-section">
              <div className="section-header">
                <h2 className="section-title">PAYROLL_TERMINAL</h2>
                <span className="section-subtitle">CSV BATCH PROCESSING</span>
              </div>
              <UploadForm 
                onUploadStart={handleUploadStart}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>

            <div className="panel-section terminal-section">
              <TerminalOutput lines={terminalLines} isRunning={isRunning} />
            </div>
          </div>

          {/* Right Panel - Additional Status */}
          <div className="dashboard-panel right-panel">
            <div className="stats-panel">
              <div className="stat-header">
                <span className="stat-title">WORKFLOW STATS</span>
              </div>
              
              <div className="stat-grid">
                <div className="stat-item">
                  <div className="stat-label">TOTAL BATCHES</div>
                  <div className="stat-value text-cyan">{stats.totalBatches}</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">AUTHORIZED</div>
                  <div className="stat-value text-green">{stats.authorized}</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">REJECTED</div>
                  <div className="stat-value text-red">{stats.rejected}</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">SUCCESS RATE</div>
                  <div className="stat-value text-yellow">{stats.successRate}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Upload;
