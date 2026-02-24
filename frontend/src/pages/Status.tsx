import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import TickerBar from '../components/TickerBar';
import './Status.css';

interface PayrollBatch {
  id: string;
  status: string;
  createdAt: string;
  records: PayrollRecord[];
}

interface PayrollRecord {
  wallet: string;
  amount: number;
  currency?: string;
}

const Status = () => {
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<PayrollBatch | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await api.get('/payroll/batches');
      setBatches(response.data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchClick = (batch: PayrollBatch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBatch(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const calculateStats = () => {
    const completed = batches.filter(b => b.status === 'completed').length;
    const processing = batches.filter(b => b.status === 'processing').length;
    const pending = batches.filter(b => b.status === 'pending').length;
    const totalAmount = batches.reduce((sum, batch) => {
      return sum + (batch.records?.reduce((s, r) => s + (r.amount || 0), 0) || 0);
    }, 0);

    return { completed, processing, pending, totalAmount };
  };

  const stats = calculateStats();
  
  const getPercentage = (value: number) => {
    if (batches.length === 0) return 0;
    return (value / batches.length) * 100;
  };

  return (
    <>
      <TickerBar 
        enclaveStatus="active" 
        chainId={40875}
      />
      
      <div className="status-container">
        <div className="status-header">
          <h1 className="status-title">BATCH_STATUS_MONITOR</h1>
          <span className="status-subtitle">REAL-TIME PAYROLL TRACKING</span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">COMPLETED</div>
            <div className="stat-value text-green">{stats.completed}</div>
            <div className="stat-bar">
              <div className="stat-bar-fill green" style={{ width: `${getPercentage(stats.completed)}%` }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">PROCESSING</div>
            <div className="stat-value text-yellow">{stats.processing}</div>
            <div className="stat-bar">
              <div className="stat-bar-fill yellow" style={{ width: `${getPercentage(stats.processing)}%` }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">PENDING</div>
            <div className="stat-value text-cyan">{stats.pending}</div>
            <div className="stat-bar">
              <div className="stat-bar-fill cyan" style={{ width: `${getPercentage(stats.pending)}%` }}></div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">TOTAL_SCLO</div>
            <div className="stat-value text-cyan">{stats.totalAmount.toFixed(2)}</div>
            <div className="stat-bar">
              <div className="stat-bar-fill cyan" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <span className="loading-spinner">[-]</span>
            <span className="loading-text">LOADING_BATCHES...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">[!]</div>
            <div className="empty-text">NO_BATCHES_FOUND</div>
            <div className="empty-subtext">Upload a payroll CSV to get started</div>
          </div>
        ) : (
          <div className="batches-grid">
            {batches.map((batch) => (
              <div key={batch.id} className="batch-card">
                <div className="batch-header">
                  <div className="batch-id">
                    <span className="batch-label">BATCH_ID:</span>
                    <span className="batch-value">{batch.id}</span>
                  </div>
                  <div className={`batch-status ${getStatusColor(batch.status)}`}>
                    [{batch.status.toUpperCase()}]
                  </div>
                </div>

                <div className="batch-details">
                  <div className="batch-detail-item">
                    <span className="detail-label">CREATED:</span>
                    <span className="detail-value">
                      {new Date(batch.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="batch-detail-item">
                    <span className="detail-label">RECORDS:</span>
                    <span className="detail-value text-cyan">
                      {batch.records?.length || 0}
                    </span>
                  </div>

                  <div className="batch-detail-item">
                    <span className="detail-label">AMOUNT:</span>
                    <span className="detail-value text-green">
                      {batch.records?.reduce((sum, r) => sum + (r.amount || 0), 0).toFixed(2)} SCLO
                    </span>
                  </div>
                </div>

                <button 
                  className="batch-details-btn"
                  onClick={() => handleBatchClick(batch)}
                >
                  [VIEW DETAILS]
                </button>

                {batch.records && batch.records.length > 0 && (
                  <div className="batch-records">
                    <div className="records-header">TRANSACTION_LOG:</div>
                    <div className="records-list">
                      {batch.records.slice(0, 3).map((record, idx) => (
                        <div key={idx} className="record-item">
                          <span className="record-address">{record.wallet?.substring(0, 10)}...</span>
                          <span className="record-amount text-cyan">{record.amount} SCLO</span>
                        </div>
                      ))}
                      {batch.records.length > 3 && (
                        <div className="record-item text-muted">
                          +{batch.records.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for batch details */}
      {showModal && selectedBatch && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">BATCH DETAILS</h2>
              <button className="modal-close" onClick={closeModal}>[X]</button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info">
                <div className="modal-info-item">
                  <span className="modal-label">BATCH_ID:</span>
                  <span className="modal-value">{selectedBatch.id}</span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-label">STATUS:</span>
                  <span className={`modal-value ${getStatusColor(selectedBatch.status)}`}>
                    [{selectedBatch.status.toUpperCase()}]
                  </span>
                </div>
                <div className="modal-info-item">
                  <span className="modal-label">CREATED:</span>
                  <span className="modal-value">{new Date(selectedBatch.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="modal-terminal">
                <div className="terminal-header">VALIDATION RESULTS:</div>
                {selectedBatch.records && selectedBatch.records.length > 0 ? (
                  selectedBatch.records.map((record: any, idx: number) => (
                    <div key={idx} className="terminal-record">
                      <div className="terminal-line">
                        <span className="terminal-label">Record {idx + 1}/{selectedBatch.records.length}</span>
                      </div>
                      <div className="terminal-line">
                        <span className="terminal-text">   Address: {record.wallet}</span>
                      </div>
                      <div className="terminal-line">
                        <span className="terminal-text">   Amount: {record.amount} SCLO</span>
                      </div>
                      <div className="terminal-line">
                        <span className={`terminal-status ${record.validation_status === 'authorized' ? 'text-green' : record.validation_status === 'rejected' ? 'text-red' : 'text-yellow'}`}>
                          {record.validation_status === 'authorized' && '   AUTHORIZED'}
                          {record.validation_status === 'rejected' && `   REJECTED: ${record.rejection_reason || 'Unauthorized'}`}
                          {record.validation_status === 'pending' && '   PENDING VALIDATION'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="terminal-empty">No records found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Status;
