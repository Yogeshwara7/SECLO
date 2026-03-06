import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { api } from '../services/api';
import './TenderlySimulator.css';

interface SimulationResult {
  success: boolean;
  transactionHash?: string;
  gasUsed?: number;
  logs?: any[];
  error?: string;
}

const TenderlySimulator: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [employees, setEmployees] = useState('');
  const [amounts, setAmounts] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const parseCSVData = (csvText: string): { employees: string[], amounts: number[] } => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const employees: string[] = [];
    const amounts: number[] = [];

    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('wallet') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const wallet = parts[0];
        const amount = parseFloat(parts[1]);
        
        // Validate wallet address (must start with 0x and be 42 characters)
        if (wallet.startsWith('0x') && wallet.length === 42 && !isNaN(amount) && amount > 0) {
          employees.push(wallet);
          amounts.push(amount);
        } else {
          console.warn(`Skipping invalid row ${i}: wallet=${wallet}, amount=${amount}`);
        }
      }
    }

    console.log(`Parsed CSV: ${employees.length} valid records`);
    console.log('Employees:', employees);
    console.log('Amounts:', amounts);

    return { employees, amounts };
  };

  const handleSimulate = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    let employeeList: string[] = [];
    let amountList: number[] = [];

    // Collect from CSV if uploaded
    if (file) {
      try {
        const text = await file.text();
        const parsed = parseCSVData(text);
        employeeList = parsed.employees;
        amountList = parsed.amounts;
      } catch (error) {
        console.error('CSV parsing error:', error);
        alert('Failed to parse CSV file. Check console for details.');
        return;
      }
    }

    // Also collect from manual input
    const manualEmployees = employees.split(',').map(e => e.trim()).filter(e => e);
    const manualAmounts = amounts.split(',').map(a => parseFloat(a.trim())).filter(a => !isNaN(a));

    // Combine both sources
    if (manualEmployees.length > 0 && manualAmounts.length > 0) {
      if (manualEmployees.length === manualAmounts.length) {
        employeeList = [...employeeList, ...manualEmployees];
        amountList = [...amountList, ...manualAmounts];
      } else {
        alert('Manual input: Number of employees must match number of amounts');
        return;
      }
    }

    if (employeeList.length === 0 || amountList.length === 0) {
      alert('Please enter employees and amounts manually or upload a CSV');
      return;
    }

    console.log('Starting simulation with:', {
      employees: employeeList,
      amounts: amountList,
      tokenAddress: import.meta.env.VITE_SCLO_TOKEN_ADDRESS || '0xD2C2f3FAA1517582a37652c6B1BFCFF147CbA626',
      consumerAddress: import.meta.env.VITE_PAYROLL_CONSUMER_ADDRESS || '0x45b3a330Cd207FBc95D6190fd5145F59A363E9d8'
    });

    setSimulating(true);
    setResult(null);

    try {
      const response = await api.post('/tenderly/simulate', {
        employees: employeeList,
        amounts: amountList,
        tokenAddress: import.meta.env.VITE_SCLO_TOKEN_ADDRESS || '0xD2C2f3FAA1517582a37652c6B1BFCFF147CbA626',
        consumerAddress: import.meta.env.VITE_PAYROLL_CONSUMER_ADDRESS || '0x45b3a330Cd207FBc95D6190fd5145F59A363E9d8'
      });

      console.log('Simulation response:', response.data);
      setResult(response.data);
    } catch (error: any) {
      console.error('Simulation error:', error);
      console.error('Error response:', error.response?.data);
      setResult({
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || error.message || 'Simulation failed'
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="tenderly-simulator">
      <div className="simulator-header">
        <h3 className="simulator-title">TENDERLY_SIMULATOR</h3>
        <span className="simulator-subtitle">Test transactions before execution - Use CSV and/or manual input</span>
      </div>

      <div className="simulator-form">
        <div className="form-group">
          <label className="form-label">UPLOAD_CSV (Optional)</label>
          <div className="file-upload-area">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input-hidden"
              id="csv-upload"
              disabled={simulating}
            />
            <label htmlFor="csv-upload" className="file-upload-label">
              {file ? (
                <div className="file-selected-info">
                  <span className="file-icon">[FILE]</span>
                  <span className="file-name">{file.name}</span>
                  <button 
                    className="file-remove-btn"
                    onClick={(e) => { e.preventDefault(); setFile(null); }}
                  >
                    [X]
                  </button>
                </div>
              ) : (
                <div className="file-upload-prompt">
                  <span className="upload-icon">[+]</span>
                  <span>Click to upload CSV (optional)</span>
                </div>
              )}
            </label>
          </div>
          <span className="form-hint">Format: wallet,amount,currency</span>
        </div>

        <div className="form-divider">
          <span className="divider-text">AND/OR</span>
        </div>

        <div className="form-group">
          <label className="form-label">EMPLOYEE_ADDRESSES (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="0xAddress1, 0xAddress2, ..."
            value={employees}
            onChange={(e) => setEmployees(e.target.value)}
            disabled={simulating}
          />
          <span className="form-hint">Comma-separated wallet addresses</span>
        </div>

        <div className="form-group">
          <label className="form-label">AMOUNTS_SCLO (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="1000, 2000, ..."
            value={amounts}
            onChange={(e) => setAmounts(e.target.value)}
            disabled={simulating}
          />
          <span className="form-hint">Comma-separated amounts in SCLO</span>
        </div>

        <button
          className="simulate-button"
          onClick={handleSimulate}
          disabled={simulating || !isConnected || (!file && (!employees || !amounts))}
        >
          {simulating ? (
            <>
              <span className="button-spinner">[-]</span>
              SIMULATING...
            </>
          ) : (
            <>
              <span className="button-icon">[&gt;]</span>
              RUN_SIMULATION
              {file && employees && ` (${file ? 'CSV' : ''}${file && employees ? ' + ' : ''}${employees ? 'MANUAL' : ''})`}
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={`simulation-result ${result.success ? 'success' : 'error'}`}>
          <div className="result-header">
            <span className="result-status">
              {result.success ? '[SUCCESS]' : '[FAILED]'}
            </span>
          </div>

          {result.success ? (
            <div className="result-details">
              <div className="result-item">
                <span className="result-label">TX_HASH:</span>
                <span className="result-value">{result.transactionHash}</span>
              </div>
              <div className="result-item">
                <span className="result-label">GAS_ESTIMATE:</span>
                <span className="result-value">{result.gasUsed?.toLocaleString()}</span>
              </div>
              {result.logs && result.logs.length > 0 && (
                <div className="result-item">
                  <span className="result-label">EVENTS:</span>
                  <span className="result-value">{result.logs.length} emitted</span>
                </div>
              )}
              <div className="result-note">
                <span className="note-icon">[i]</span>
                <span className="note-text">
                  {result.transactionHash?.startsWith('0xrpc')
                    ? 'Real gas estimate via Tenderly RPC - accurate network simulation'
                    : result.transactionHash?.startsWith('0xestimate')
                    ? 'Gas estimation based on actual contract operations (Tenderly API does not support Hoodi network)'
                    : 'Simulation only - no blockchain execution or database save'}
                </span>
              </div>
              {!result.transactionHash?.startsWith('0xestimate') && !result.transactionHash?.startsWith('0xrpc') && (
                <div className="result-link">
                  <a
                    href={`https://dashboard.tenderly.co/${import.meta.env.VITE_TENDERLY_ACCOUNT || 'Yogii'}/${import.meta.env.VITE_TENDERLY_PROJECT || 'seclo-payroll'}/simulator/${result.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tenderly-link"
                  >
                    [VIEW_IN_TENDERLY] →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="result-error">
              <span className="error-label">ERROR:</span>
              <span className="error-message">{result.error}</span>
              <div className="error-help">
                <span className="help-icon">[?]</span>
                <span className="help-text">
                  Check backend logs for detailed error information
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TenderlySimulator;
