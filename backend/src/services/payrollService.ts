import { v4 as uuidv4 } from "uuid";
import { PayrollBatch, PayrollRecord } from "../models/payroll";
import { runCREWorkflow } from "./creService";
import db from "../db/database";

export function createBatch(records: PayrollRecord[]): PayrollBatch {
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    // Insert batch with 'pending' status
    const insertBatch = db.prepare(`
        INSERT INTO payroll_batches (id, status, created_at)
        VALUES (?, ?, ?)
    `);
    insertBatch.run(id, "pending", createdAt);

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
        status: "pending",
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
            SELECT wallet, amount, currency, validation_status, rejection_reason
            FROM payroll_records
            WHERE batch_id = ?
        `).all(batch.id) as (PayrollRecord & { validation_status?: string; rejection_reason?: string })[];

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

// Helper function to extract JSON from text by counting braces
function extractJSON(text: string): string {
  let depth = 0;
  let endIndex = 0;
  let started = false;
  
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      depth++;
      started = true;
    }
    if (text[i] === '}') {
      depth--;
      if (started && depth === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }
  
  return endIndex > 0 ? text.substring(0, endIndex) : '';
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

  try {
    // Transform batch data to match CRE workflow expected format
    const workflowPayload = {
      batchId: batch.id,
      records: batch.records.map(record => ({
        employeeId: record.wallet,
        amount: record.amount
      }))
    };

    console.log('=== WORKFLOW PAYLOAD BEING SENT TO CRE ===');
    console.log(JSON.stringify(workflowPayload, null, 2));
    console.log('===========================================');

    const creResult = await runCREWorkflow(workflowPayload);

    console.log('=== Starting CRE result parsing ===');
    console.log('CRE Result length:', creResult.length);

    // Parse the CRE result to extract validation details
    let finalStatus: "completed" | "failed" = "completed";
    let authorizedCount = 0;
    let rejectedCount = 0;
    
    // Remove ANSI codes
    const cleanOutput = creResult.replace(/\x1b\[[0-9;]*m/g, '');
    
    // The CRE CLI outputs the workflow result as JSON at the end
    // Look for the last occurrence of a JSON object in the output
    let jsonString = '';
    let workflowResult: any = null;
    
    // Find all opening braces and try to extract JSON from each
    const braceIndices: number[] = [];
    for (let i = 0; i < cleanOutput.length; i++) {
      if (cleanOutput[i] === '{') {
        braceIndices.push(i);
      }
    }
    
    console.log(`Found ${braceIndices.length} potential JSON start positions`);
    
    // Try from the last brace backwards (most likely to be the result JSON)
    for (let i = braceIndices.length - 1; i >= 0; i--) {
      const startPos = braceIndices[i];
      const candidate = extractJSON(cleanOutput.substring(startPos));
      
      if (candidate) {
        try {
          const parsed = JSON.parse(candidate);
          // Check if this looks like our ExecutionResult structure
          if (parsed.result || parsed.payouts || parsed.Result || parsed.Payouts) {
            jsonString = candidate;
            workflowResult = parsed;
            console.log(`Found valid JSON at position ${startPos}`);
            break;
          }
        } catch (e) {
          // Not valid JSON, try next
          continue;
        }
      }
    }
    
    // Try to parse the extracted JSON
    if (workflowResult) {
      console.log('Successfully parsed workflow result');
      console.log('Result keys:', Object.keys(workflowResult));
      
      // Handle both lowercase and uppercase field names
      const payouts = workflowResult.payouts || workflowResult.Payouts;
      
      if (payouts && Array.isArray(payouts)) {
        console.log(`Processing ${payouts.length} payout records`);
        
        for (const payout of payouts) {
          // Handle both lowercase and uppercase field names
          const employee = payout.employee || payout.Employee;
          const payoutStatus = payout.status || payout.Status;
          const message = payout.message || payout.Message;
          
          const status = payoutStatus === 'authorized' ? 'authorized' : 'rejected';
          const reason = status === 'rejected' ? (message || 'Unauthorized employee or amount exceeds limit') : null;
          
          console.log(`Updating record: ${employee} with status: ${status}`);
          
          // Update record in database (case-insensitive wallet match)
          try {
            const result = db.prepare(`
              UPDATE payroll_records 
              SET validation_status = ?, rejection_reason = ?
              WHERE batch_id = ? AND LOWER(wallet) = LOWER(?)
            `).run(status, reason, batchId, employee);
            
            console.log(`Updated ${result.changes} record(s) for wallet ${employee}`);
            
            if (result.changes === 0) {
              console.warn(`No records updated for wallet ${employee} - wallet might not exist in batch`);
            }
          } catch (updateError) {
            console.error(`Failed to update record ${employee}:`, updateError);
          }
          
          if (status === 'authorized') {
            authorizedCount++;
          } else {
            rejectedCount++;
          }
        }
        
        console.log(`Batch ${batchId}: ${authorizedCount} authorized, ${rejectedCount} rejected`);
        
        // Update batch with counts
        try {
          db.prepare(`
            UPDATE payroll_batches 
            SET authorized_count = ?, rejected_count = ?
            WHERE id = ?
          `).run(authorizedCount, rejectedCount, batchId);
          
          console.log(`Updated batch ${batchId} with counts`);
        } catch (batchUpdateError) {
          console.error(`Failed to update batch counts:`, batchUpdateError);
        }
        
        // If all records were rejected, mark as failed
        if (authorizedCount === 0 && rejectedCount > 0) {
          finalStatus = "failed";
        }
      } else {
        console.log('No payouts array found in workflow result');
      }
    } else {
      console.log('Could not extract valid workflow result JSON from output');
      console.log('Output sample (last 800 chars):', cleanOutput.substring(Math.max(0, cleanOutput.length - 800)));
    }

    console.log('=== Finished CRE result parsing ===');
    console.log(`Final status: ${finalStatus}, Authorized: ${authorizedCount}, Rejected: ${rejectedCount}`);

    updateStatus(batchId, finalStatus);

    return {
      creResult
    };
  } catch (error) {
    // Mark as failed if CRE execution fails
    updateStatus(batchId, "failed");
    throw error;
  }
}

