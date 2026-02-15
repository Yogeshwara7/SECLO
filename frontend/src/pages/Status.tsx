import React, { useEffect, useState } from "react";
import { api } from "../services/api";

interface PayrollBatch {
  id: string;
  status: 'uploaded' | 'processing' | 'processed' | 'failed';
  records: number;
  createdAt?: string;
  totalAmount?: number;
}

const Status = () => {
  const [batches, setBatches] = useState<PayrollBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<PayrollBatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredBatch, setHoveredBatch] = useState<string | null>(null);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        const response = await api.get('/payroll/batches');
        setBatches(response.data);
      } catch (err) {
        console.error('Failed to fetch batches:', err);
        setError('Failed to load payroll batches');
      } finally {
        setLoading(false);
      }
    };

    fetchBatches();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'uploaded': return '#2196F3';
      case 'failed': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return '✅';
      case 'processing': return '⏳';
      case 'uploaded': return '📤';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const handleBatchClick = async (batch: PayrollBatch) => {
    setSelectedBatch(batch);
    // Fetch detailed batch info from backend
    try {
      const response = await api.get(`/payroll/status?batchId=${batch.id}`);
      // Merge the detailed info with the batch summary
      setSelectedBatch({
        ...batch,
        ...response.data
      });
    } catch (err) {
      console.error('Failed to fetch batch details:', err);
      // Still show the batch summary even if detailed fetch fails
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#FAF3E1',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h3 style={{ color: '#222222' }}>Loading payroll status...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        backgroundColor: '#FAF3E1',
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
          <h3 style={{ color: '#F44336' }}>{error}</h3>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#FA8112',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#FAF3E1',
      minHeight: 'calc(100vh - 80px)'
    }}>
      <h3 style={{ 
        fontSize: '28px', 
        color: '#222222', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        📊 Payroll Status Dashboard
      </h3>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: selectedBatch ? '1fr 1fr' : '1fr',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Batch List */}
        <div style={{
          backgroundColor: '#F5E7C6',
          borderRadius: '12px',
          border: '2px solid #FA8112',
          padding: '20px'
        }}>
          <h4 style={{ 
            color: '#222222', 
            marginBottom: '20px',
            fontSize: '20px'
          }}>
            📋 Recent Payroll Batches
          </h4>

          {batches.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
              <p>No payroll batches found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => handleBatchClick(batch)}
                  onMouseEnter={() => setHoveredBatch(batch.id)}
                  onMouseLeave={() => setHoveredBatch(null)}
                  style={{
                    padding: '15px',
                    backgroundColor: hoveredBatch === batch.id ? '#F0E6D2' : '#FAF3E1',
                    border: `2px solid ${selectedBatch?.id === batch.id ? '#FA8112' : '#222222'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <div style={{ 
                      fontWeight: 'bold',
                      color: '#222222',
                      fontSize: '16px'
                    }}>
                      {batch.id}
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: getStatusColor(batch.status),
                      fontWeight: 'bold'
                    }}>
                      {getStatusIcon(batch.status)} {batch.status.toUpperCase()}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    <div>👥 {batch.records} employees</div>
                    <div>💰 {batch.totalAmount?.toLocaleString()} SCLO</div>
                  </div>
                  
                  <div style={{ 
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '8px'
                  }}>
                    📅 {formatDate(batch.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Batch Details */}
        {selectedBatch && (
          <div style={{
            backgroundColor: '#F5E7C6',
            borderRadius: '12px',
            border: '2px solid #FA8112',
            padding: '20px'
          }}>
            <h4 style={{ 
              color: '#222222', 
              marginBottom: '20px',
              fontSize: '20px'
            }}>
              🔍 Batch Details
            </h4>

            <div style={{ 
              backgroundColor: '#FAF3E1',
              padding: '20px',
              borderRadius: '8px',
              border: '2px solid #222222'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h5 style={{ 
                  color: '#222222',
                  margin: 0,
                  fontSize: '18px'
                }}>
                  {selectedBatch.id}
                </h5>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: getStatusColor(selectedBatch.status),
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  {getStatusIcon(selectedBatch.status)} {selectedBatch.status.toUpperCase()}
                </div>
              </div>

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div>
                  <strong>👥 Employees:</strong>
                  <div style={{ fontSize: '24px', color: '#FA8112', fontWeight: 'bold' }}>
                    {selectedBatch.records}
                  </div>
                </div>
                <div>
                  <strong>💰 Total Amount:</strong>
                  <div style={{ fontSize: '24px', color: '#FA8112', fontWeight: 'bold' }}>
                    {selectedBatch.totalAmount?.toLocaleString()} SCLO
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <strong>📅 Created:</strong>
                <div style={{ color: '#666', marginTop: '5px' }}>
                  {formatDate(selectedBatch.createdAt)}
                </div>
              </div>

              {selectedBatch.status === 'processing' && (
                <div style={{ 
                  backgroundColor: '#FFF3CD',
                  border: '2px solid #FF9800',
                  borderRadius: '6px',
                  padding: '15px',
                  marginTop: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '20px' }}>⏳</div>
                    <div>
                      <strong>Processing in progress...</strong>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                        CRE workflow is validating and executing transfers
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedBatch.status === 'processed' && (
                <div style={{ 
                  backgroundColor: '#D4EDDA',
                  border: '2px solid #4CAF50',
                  borderRadius: '6px',
                  padding: '15px',
                  marginTop: '15px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '20px' }}>✅</div>
                    <div>
                      <strong>Successfully processed!</strong>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                        All transfers completed and validated by CRE
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{ 
        marginTop: '40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        maxWidth: '1200px',
        margin: '40px auto 0'
      }}>
        <div style={{
          backgroundColor: '#E8F5E8',
          border: '2px solid #4CAF50',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#4CAF50', fontWeight: 'bold' }}>
            {batches.filter(b => b.status === 'processed').length}
          </div>
          <div style={{ color: '#222222', fontWeight: 'bold' }}>Completed</div>
        </div>

        <div style={{
          backgroundColor: '#FFF3CD',
          border: '2px solid #FF9800',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#FF9800', fontWeight: 'bold' }}>
            {batches.filter(b => b.status === 'processing').length}
          </div>
          <div style={{ color: '#222222', fontWeight: 'bold' }}>Processing</div>
        </div>

        <div style={{
          backgroundColor: '#E3F2FD',
          border: '2px solid #2196F3',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#2196F3', fontWeight: 'bold' }}>
            {batches.filter(b => b.status === 'uploaded').length}
          </div>
          <div style={{ color: '#222222', fontWeight: 'bold' }}>Pending</div>
        </div>

        <div style={{
          backgroundColor: '#F5E7C6',
          border: '2px solid #FA8112',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', color: '#FA8112', fontWeight: 'bold' }}>
            {batches.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}
          </div>
          <div style={{ color: '#222222', fontWeight: 'bold' }}>Total SCLO</div>
        </div>
      </div>
    </div>
  );
};

export default Status;