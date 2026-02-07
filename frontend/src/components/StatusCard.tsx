import React from 'react';

interface StatusCardProps {
  title: string;
  status: 'online' | 'offline' | 'warning';
  description?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, status, description }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#4CAF50';
      case 'offline':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            marginRight: '8px'
          }}
        />
        <h3 style={{ margin: 0, fontSize: '18px' }}>{title}</h3>
      </div>
      {description && (
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default StatusCard;