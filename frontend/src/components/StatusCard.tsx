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
        return '#FA8112'; // Orange for online
      case 'offline':
        return '#222222'; // Dark for offline
      case 'warning':
        return '#F5E7C6'; // Medium cream for warning
      default:
        return '#F5E7C6';
    }
  };

  return (
    <div style={{
      border: '2px solid #F5E7C6',
      borderRadius: '12px',
      padding: '20px',
      margin: '8px',
      backgroundColor: '#FAF3E1',
      boxShadow: '0 4px 8px rgba(34, 34, 34, 0.1)',
      transition: 'transform 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: getStatusColor(),
            marginRight: '12px',
            border: status === 'warning' ? '2px solid #222222' : 'none'
          }}
        />
        <h3 style={{ margin: 0, fontSize: '20px', color: '#222222' }}>{title}</h3>
      </div>
      {description && (
        <p style={{ 
          margin: 0, 
          color: '#222222', 
          fontSize: '14px',
          opacity: 0.8
        }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default StatusCard;