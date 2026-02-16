import { v4 as uuidv4 } from "uuid";
import { PayrollBatch, PayrollRecord } from "../models/payroll";
import { runCREWorkflow } from "./creService";
import db from "../db/database";

export function createBatch(records: PayrollRecord[]): PayrollBatch {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    // Insert batch
    const insertBatch = db.prepare(`
        INSERT INTO payroll_batches (id, status, created_at)
        VALUES (?, ?, ?)
    `);
    insertBatch.run(id, "uploaded", createdAt);

    // Insert records
    const insertRecord = db.prepare(`
        INSERT INTO payroll_records (batch_id, wallet, amount, currency)
        VALUES (?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((records: PayrollRecord[]) => {
        for (const record of records) {
            insertRecord.run(id, record.wallet, record.amount, record.currency);
        }
    });
    
    insertMany(records);

    return {
        id,
        records,
        status: "uploaded",
        createdAt
    };
}

export function getBatch(id: string): PayrollBatch | undefined {
    // Get batch
    const batchRow = db.prepare(`
        SELECT id, status, created_at
        FROM payroll_batches
        WHERE id = ?
    `).get(id) as { id: string; status: string; created_at: string } | undefined;

    if (!batchRow) {
        return undefined;
    }

    // Get records
    const records = db.prepare(`
        SELECT wallet, amount, currency
        FROM payroll_records
        WHERE batch_id = ?
    `).all(id) as PayrollRecord[];

    return {
        id: batchRow.id,
        status: batchRow.status as PayrollBatch["status"],
        records,
        createdAt: batchRow.created_at
    };
}

export function getAllBatches(): PayrollBatch[] {
    const batches = db.prepare(`
        SELECT id, status, created_at
        FROM payroll_batches
        ORDER BY created_at DESC
    `).all() as { id: string; status: string; created_at: string }[];

    return batches.map(batch => {
        const records = db.prepare(`
            SELECT wallet, amount, currency
            FROM payroll_records
            WHERE batch_id = ?
        `).all(batch.id) as PayrollRecord[];

        return {
            id: batch.id,
            status: batch.status as PayrollBatch["status"],
            records,
            createdAt: batch.created_at
        };
    });
}

export function updateStatus(id: string, status: PayrollBatch["status"]): boolean {
    const result = db.prepare(`
        UPDATE payroll_batches
        SET status = ?
        WHERE id = ?
    `).run(status, id);

    return result.changes > 0;
}

export async function processPrivatePayout(batchId: string) {
  const batch = getBatch(batchId);

  if (!batch) {
    throw new Error("Batch not found");
  }

  if (!batch.records || !Array.isArray(batch.records) || batch.records.length === 0) {
    throw new Error("Batch has no valid records");
  }

  updateStatus(batchId, "processing");

  // Transform batch data to match CRE workflow expected format
  const workflowPayload = {
    batchId: batch.id,
    records: batch.records.map(record => ({
      employeeId: record.wallet,  // Map wallet to employeeId
      amount: record.amount
    }))
  };

  const creResult = await runCREWorkflow(workflowPayload);

  updateStatus(batchId, "processed");

  return {
    creResult
  };
}

