# Wallet Integration Features

## Current Implementation
- Wallet connection via Reown AppKit
- Support for Hoodi Testnet (Chain ID: 40875)
- Display connected wallet address in navbar

## Possible Features to Implement

### 🔒 1. Admin Authentication (Quick Win - 30 mins)
**What:** Only authorized wallets can upload payroll CSVs

**Implementation:**
```typescript
// Add to backend/.env
ADMIN_WALLETS=0xYourWallet1,0xYourWallet2

// Update backend/src/routes/payroll.ts
router.post("/upload", upload.single("file"), (req, res) => {
  const { walletAddress } = req.body;
  const adminWallets = process.env.ADMIN_WALLETS?.split(',') || [];
  
  if (!adminWallets.includes(walletAddress.toLowerCase())) {
    return res.status(403).json({ message: "Unauthorized wallet" });
  }
  // ... rest of upload logic
});

// Update frontend to send wallet address
const { address } = useAccount();
formData.append('walletAddress', address);
```

**Benefits:**
- Prevents unauthorized payroll uploads
- Audit trail of who uploaded what
- Simple role-based access control

---

### 💰 2. Treasury Balance Check (Medium - 1 hour)
**What:** Check if company wallet has enough SCLO before processing

**Implementation:**
```typescript
// frontend/src/hooks/useTokenBalance.ts
import { useReadContract } from 'wagmi';

export function useTokenBalance(tokenAddress: string, walletAddress: string) {
  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [walletAddress],
  });
  
  return balance;
}

// Show in Upload page
const treasuryBalance = useTokenBalance(SCLO_TOKEN_ADDRESS, TREASURY_WALLET);
const totalPayroll = records.reduce((sum, r) => sum + r.amount, 0);

if (treasuryBalance < totalPayroll) {
  addTerminalLine('error', 'Insufficient treasury balance!');
  return;
}
```

**Benefits:**
- Prevent failed transactions
- Real-time balance visibility
- Better UX with pre-flight checks

---

### 🚀 3. On-Chain Payroll Execution (Advanced - 3 hours)
**What:** Actually transfer tokens instead of just validation

**Current State:**
- CRE workflow only validates (simulation mode)
- No actual token transfers happen

**Implementation Steps:**

1. **Deploy PayrollConsumer Contract** (you already have it!)
```solidity
// PayrollConsumer.sol is ready
// Deploy to Hoodi Testnet via Tenderly
```

2. **Update CRE Workflow to Execute Transfers**
```go
// cre-payroll-workflow/Seclo/main.go
// After validation, call smart contract
func executePayroll(authorizedPayouts []PayoutResult, runtime cre.Runtime) error {
    // Use Chainlink Functions to call PayrollConsumer contract
    // Transfer tokens to authorized employees
}
```

3. **Frontend Transaction Signing**
```typescript
// frontend/src/pages/Upload.tsx
import { useWriteContract } from 'wagmi';

const { writeContract } = useWriteContract();

const executeBatch = async (batchId: string) => {
  await writeContract({
    address: PAYROLL_CONTRACT_ADDRESS,
    abi: PayrollConsumerABI,
    functionName: 'processBatch',
    args: [batchId, authorizedRecords],
  });
};
```

**Benefits:**
- Actual payroll execution on-chain
- Immutable payment records
- Automated token distribution

---

### 👥 4. Employee Portal (Medium - 2 hours)
**What:** Employees connect wallet to view their payments

**Implementation:**
```typescript
// New page: frontend/src/pages/EmployeePortal.tsx
const EmployeePortal = () => {
  const { address } = useAccount();
  const [payments, setPayments] = useState([]);
  
  useEffect(() => {
    if (address) {
      // Fetch payment history for this wallet
      api.get(`/employee/payments/${address}`)
        .then(res => setPayments(res.data));
    }
  }, [address]);
  
  return (
    <div>
      <h1>Your Payment History</h1>
      {payments.map(p => (
        <div key={p.id}>
          <span>{p.date}</span>
          <span>{p.amount} SCLO</span>
          <span>{p.status}</span>
        </div>
      ))}
    </div>
  );
};
```

**Benefits:**
- Self-service for employees
- Transparency in payments
- Reduced HR support tickets

---

### 📝 5. Multi-Sig Approval (Advanced - 4 hours)
**What:** Require 2-of-3 admin signatures for large batches

**Implementation:**
```typescript
// Use Gnosis Safe or custom multi-sig
// Batches > $10k require multiple approvals

const requiresMultiSig = totalAmount > 10000;

if (requiresMultiSig) {
  // Create approval request
  await createApprovalRequest(batchId, [admin1, admin2, admin3]);
  addTerminalLine('warning', 'Batch requires multi-sig approval');
}
```

**Benefits:**
- Enhanced security for large amounts
- Fraud prevention
- Compliance with financial controls

---

### 📊 6. On-Chain Audit Trail (Medium - 2 hours)
**What:** Record all actions on-chain with signatures

**Implementation:**
```typescript
// Every action gets signed and recorded
const signAction = async (action: string, data: any) => {
  const message = JSON.stringify({ action, data, timestamp: Date.now() });
  const signature = await signMessage({ message });
  
  // Store signature on-chain or in database
  await api.post('/audit/log', { message, signature, wallet: address });
};

// Usage
await signAction('UPLOAD_PAYROLL', { batchId, recordCount });
await signAction('APPROVE_BATCH', { batchId });
```

**Benefits:**
- Immutable audit logs
- Compliance & regulatory requirements
- Dispute resolution

---

## Recommended Implementation Order

### Phase 1: Security (Week 1)
1. ✅ Wallet connection (DONE)
2. 🔒 Admin authentication
3. 💰 Treasury balance check

### Phase 2: Execution (Week 2)
4. 🚀 Deploy PayrollConsumer contract
5. 🚀 On-chain payroll execution
6. 📊 Basic audit trail

### Phase 3: Advanced (Week 3)
7. 👥 Employee portal
8. 📝 Multi-sig approval
9. 📊 Advanced analytics

---

## Quick Start: Admin Authentication

Want to implement admin authentication right now? Here's the complete code:

### Backend Changes
```typescript
// backend/.env
ADMIN_WALLETS=0xYourWalletAddress

// backend/src/routes/payroll.ts
router.post("/upload", upload.single("file"), (req, res) => {
  const { walletAddress } = req.body;
  
  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address required" });
  }
  
  const adminWallets = (process.env.ADMIN_WALLETS || '')
    .split(',')
    .map(w => w.toLowerCase().trim());
  
  if (!adminWallets.includes(walletAddress.toLowerCase())) {
    return res.status(403).json({ 
      message: "Unauthorized: Only admin wallets can upload payroll" 
    });
  }
  
  // ... rest of existing code
});
```

### Frontend Changes
```typescript
// frontend/src/components/UploadForm.tsx
import { useAccount } from 'wagmi';

const UploadForm = ({ onUploadStart, onUploadSuccess, onUploadError }) => {
  const { address, isConnected } = useAccount();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      onUploadError('Please connect your wallet first');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('walletAddress', address); // Add wallet address
    
    // ... rest of upload logic
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {!isConnected && (
        <div className="warning">
          Connect your wallet to upload payroll
        </div>
      )}
      {/* ... rest of form */}
    </form>
  );
};
```

This gives you immediate security with minimal code changes!
