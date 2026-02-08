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
  
    if (!batch) throw new Error("Batch not found");
  
    updateStatus(batchId, "processing");
  
    const creResult = await runCREWorkflow(batch);
  
    updateStatus(batchId, "processed");
  
    return {
      creResult,
      proof: "mock-proof"
    };
  }
