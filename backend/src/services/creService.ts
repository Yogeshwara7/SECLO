import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

export function runCREWorkflow(batch: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const batchId = batch?.batchId ?? "unknown";
    const recordCount = Array.isArray(batch?.records) ? batch.records.length : 0;
    
    console.log("===================================================");
    console.log("SECLO PAYROLL - CRE POLICY ENFORCEMENT");
    console.log("===================================================");
    console.log(`Initializing CRE workflow...`);
    console.log(`Batch ID: ${batchId}`);
    console.log(`Total Records: ${recordCount}`);
    console.log("VALIDATING AGAINST EMPLOYEE REGISTRY...");
    console.log("---------------------------------------------------");

    const creWorkflowDir = path.join(__dirname, "..", "..", "..", "cre-payroll-workflow");
    const workflowPath = path.join(creWorkflowDir, "Seclo");
    
    // Write payload to temporary file to avoid command-line escaping issues
    const tempFile = path.join(os.tmpdir(), `cre-payload-${batchId}.json`);
    const jsonPayload = JSON.stringify(batch, null, 2);
    
    try {
      fs.writeFileSync(tempFile, jsonPayload, 'utf8');
      console.log(`Payload written to temp file: ${tempFile}`);
    } catch (writeError) {
      console.error("Failed to write temp payload file:", writeError);
      reject("Failed to write payload file");
      return;
    }

    // Spawn CRE process with file reference
    const creProcess = spawn("cre", [
      "-T", "staging-settings",
      "workflow", "simulate", workflowPath,
      "--non-interactive",
      "--trigger-index", "0",
      "--http-payload", `@${tempFile}`
    ], { 
      cwd: creWorkflowDir,
      shell: true // Required on Windows
    });

    let stdout = "";
    let stderr = "";

    // Stream stdout to console in real-time
    creProcess.stdout.on("data", (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output); // Real-time streaming to backend terminal
    });

    // Stream stderr to console in real-time
    creProcess.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    // Handle process completion
    creProcess.on("close", (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
        console.log(`Temp file deleted: ${tempFile}`);
      } catch (cleanupError) {
        console.warn("Failed to delete temp file:", cleanupError);
      }
      
      console.log("===================================================");
      if (code === 0) {
        console.log("CRE workflow execution completed successfully");
        console.log("===================================================");
        resolve(stdout);
      } else {
        console.error(`CRE workflow failed with exit code ${code}`);
        console.log("===================================================");
        reject(stderr || `Process exited with code ${code}`);
      }
    });

    // Handle process errors
    creProcess.on("error", (error) => {
      console.error("CRE ERROR:", error);
      // Clean up temp file on error
      try {
        fs.unlinkSync(tempFile);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      reject(error.message);
    });
  });
}

