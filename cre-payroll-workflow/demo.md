# SECLO CRE Policy Enforcement Demo

## Flow Overview
```
HR prompt → AI converts → JSON → CRE validates → Policy enforcement → Success/Rejection
```

---

## Demo Sequence

### Step 1: Valid Payroll (Alice & Bob - 5000 tokens each)

**HR Prompt:**
```
"Pay Alice and Bob 5000 tokens each"
```

**AI Generated JSON:** `valid_payload.json`

**Run CRE:**
```bash
cd cre-payroll-workflow
cre workflow simulate Seclo --non-interactive --trigger-index 0 --http-payload "@valid_payload.json" --target staging-settings
```

**Expected Output:**
```
✅ Employee Alice authorized (Engineering)
✅ Employee Bob authorized (Marketing)
✅ Batch processed: All 2 transfers authorized, Total: 10000.00 SCLO
```

---

### Step 2: Attack Attempt (Unauthorized Address)

**Attacker Payload:** `attack_payload.json`
- Alice: 5000 (valid)
- 0xATTACKER: 99999 (UNAUTHORIZED)

**Run CRE:**
```bash
cre workflow simulate Seclo --non-interactive --trigger-index 0 --http-payload "@attack_payload.json" --target staging-settings
```

**Expected Output:**
```
✅ Employee Alice authorized
❌ REJECTED: Unauthorized employee
⚠️  Batch processed: 1 authorized, 1 REJECTED due to policy violations
ERROR: Unauthorized: 0xATTACKER...
```

---

### Step 3: Excessive Amount (Bob - 15000 exceeds limit)

**Payload:** `excessive_amount.json`
- Bob's max: 8000 SCLO
- Requested: 15000 SCLO

**Run CRE:**
```bash
cre workflow simulate Seclo --non-interactive --trigger-index 0 --http-payload "@excessive_amount.json" --target staging-settings
```

**Expected Output:**
```
❌ REJECTED: Amount 15000.00 exceeds max allowed 8000.00 for Bob
⚠️  Batch processed: 0 authorized, 1 REJECTED due to policy violations
```

---

## Policy Rules Enforced

1. ✅ **Employee Registry Validation**
   - Only authorized wallet addresses accepted
   - Unknown addresses immediately rejected

2. ✅ **Amount Limits**
   - Alice: Max 10,000 SCLO
   - Bob: Max 8,000 SCLO
   - Carol: Max 12,000 SCLO

3. ✅ **Batch Processing**
   - Validates each record independently
   - Rejects entire batch if any violation found
   - Provides detailed error messages

---

## Authorized Employees

| Name  | Wallet | Department | Max Amount |
|-------|--------|------------|------------|
| Alice | 0xA1B2...4567 | Engineering | 10,000 |
| Bob   | 0xB2C3...6789 | Marketing | 8,000 |
| Carol | 0xC3D4...89AB | Sales | 12,000 |

---

## Security Features

🔒 **Confidential Computation** - CRE processes in secure enclave
🛡️ **Policy Enforcement** - Registry validation before execution
📊 **Audit Trail** - Complete logs of all validations
❌ **Attack Prevention** - Unauthorized addresses blocked
⚠️ **Amount Limits** - Prevents excessive payouts
