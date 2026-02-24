import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import './WalletButton.css';

const WalletButton = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  const handleConnect = () => {
    open();
  };

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <span className="wallet-address">
          [{address.substring(0, 6)}...{address.substring(38)}]
        </span>
        <button className="wallet-disconnect" onClick={() => disconnect()}>
          [DISCONNECT]
        </button>
      </div>
    );
  }

  return (
    <button className="wallet-connect" onClick={handleConnect}>
      [CONNECT_WALLET]
    </button>
  );
};

export default WalletButton;
