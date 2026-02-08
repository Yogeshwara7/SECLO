import { v4 as uuidv4 } from "uuid";
import { PayrollBatch, PayrollRecord } from "../models/payroll";
import { privacyAdapter } from "./privacy";
import { runCREWorkflow } from "./creService";


const batches: Record<string, PayrollBatch> = {};

export function createBatch(records: PayrollRecord[]): PayrollBatch {
    const id = uuidv4();

    const batch: PayrollBatch = {
        id,
        records,
        status: "uploaded"
    };
    batches[id] = batch;
    return batch;
}

export function getBatch(id: string) {
    return batches[id];
}

export function updateStatus(id: string, status: PayrollBatch["status"]) {
    if (!batches[id]) {
        return false;
    }
    batches[id].status = status;
    return true;
}

export async function processPrivatePayout(batchId: string) {
  const batch = getBatch(batchId);

  if (!batch) {
    throw new Error("Batch not found");
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

