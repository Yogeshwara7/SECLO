import { PayrollRecord } from "../models/payroll";
import { employeeRegistry } from "../data/employeeRegistry";

export interface RiskViolation {
  wallet: string;
  amount: number;
  reason: string;
  employeeName?: string;
  maxAllowed?: number;
  department?: string;
}

export interface RiskCheckResult {
  approved: PayrollRecord[];
  violations: RiskViolation[];
}

export function evaluatePayrollRisk(records: PayrollRecord[]): RiskCheckResult {
  const violations: RiskViolation[] = [];
  const approved: PayrollRecord[] = [];

  for (const record of records) {
    const wallet = (record.wallet || "").toLowerCase();
    const employee = employeeRegistry.find(
      (e) => e.wallet.toLowerCase() === wallet
    );

    if (!employee) {
      violations.push({
        wallet: record.wallet,
        amount: record.amount,
        reason: "UNAUTHORIZED_EMPLOYEE",
      });
      continue;
    }

    if (record.amount > employee.maxAmount) {
      violations.push({
        wallet: record.wallet,
        amount: record.amount,
        reason: "AMOUNT_EXCEEDS_LIMIT",
        employeeName: employee.name,
        maxAllowed: employee.maxAmount,
        department: employee.department,
      });
      continue;
    }

    approved.push(record);
  }

  return { approved, violations };
}


