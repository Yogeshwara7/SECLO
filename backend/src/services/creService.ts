import { exec } from "child_process";
import path from "path";

export function runCREWorkflow(batch: any): Promise<string> {
  return new Promise((resolve, reject) => {
    // Avoid logging sensitive payroll payloads (wallets/amounts) in plaintext.
    const batchId = batch?.batchId ?? "unknown";
    const recordCount = Array.isArray(batch?.records) ? batch.records.length : 0;
    console.log(`RUN CRE WORKFLOW CALLED (batchId=${batchId}, records=${recordCount})`);

    const creWorkflowDir = path.join(__dirname, "..", "..", "..", "cre-payroll-workflow");
    const workflowPath = path.join(creWorkflowDir, "Seclo");
    
    // Convert batch to JSON string and escape for command line
    const jsonPayload = JSON.stringify(batch);
    const escapedPayload = jsonPayload.replace(/"/g, '\\"');

    // NOTE: Use absolute workflow path (Windows-friendly) and `--target/-T` is a global flag.
    const command = `cre -T staging-settings workflow simulate "${workflowPath}" --non-interactive --trigger-index 0 --http-payload "${escapedPayload}"`;
    // Don't log the full command (it contains the full payload).
    console.log("Executing CRE simulation for workflow:", workflowPath);

    exec(command, { cwd: creWorkflowDir }, (error, stdout, stderr) => {
      if (error) {
        console.error("CRE ERROR:", stderr);
        reject(stderr);
      } else {
        // Keep logs small; caller can store stdout if needed.
        console.log("CRE simulation completed");
        resolve(stdout);
      }
    });
  });
}

