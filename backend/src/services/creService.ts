import { exec } from "child_process";
import path from "path";

export function runCREWorkflow(batch: any): Promise<string> {
  return new Promise((resolve, reject) => {

    console.log("RUN CRE WORKFLOW CALLED");
    console.log("BATCH DATA:", batch);

    const creWorkflowDir = path.join(__dirname, "..", "..", "..", "cre-payroll-workflow");
    
    // Convert batch to JSON string and escape for command line
    const jsonPayload = JSON.stringify(batch);
    const escapedPayload = jsonPayload.replace(/"/g, '\\"');

    const command = `cre workflow simulate Seclo --non-interactive --trigger-index 0 --http-payload "${escapedPayload}" --target staging-settings`;

    console.log("EXECUTING COMMAND:", command);
    console.log("WORKING DIRECTORY:", creWorkflowDir);

    exec(command, { cwd: creWorkflowDir }, (error, stdout, stderr) => {
      if (error) {
        console.error("CRE ERROR:", stderr);
        reject(stderr);
      } else {
        console.log("CRE OUTPUT:", stdout);
        resolve(stdout);
      }
    });
  });
}

