import { v4 as uuidv4 } from "uuid";
import { PayrollBatch, PayrollRecord } from "../models/payroll";
import { privacyAdapter } from "./privacy";

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

    if (!batch || batch.status !== "uploaded") {
        throw new Error("Invalid batch");
    }
    updateStatus(batchId, "processing");

    // Transform PayrollBatch to ConfidentialPayload
    const confidentialPayload = {
        batchId: batch.id,
        records: batch.records
    };

    const encrypted = await privacyAdapter.sendConfidentialPayload(confidentialPayload);
    const txId = await privacyAdapter.executePrivateBatch(batchId, encrypted);
    const proof = await privacyAdapter.generateProof(batchId);

    updateStatus(batchId, "processed");
    return { txId, proof };
}
