import { exec } from "child_process";
import path from "path";

export function runCREWorkflow(batch: any): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = JSON.stringify(batch);

    const workflowPath = path.join(
      __dirname,
      "../../cre-workflow/Seclo/payroll-workflow/workflow.yaml"
    );

    exec(
      `cre run ${workflowPath} --input '${input}'`,
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        } else {
          resolve(stdout);
        }
      }
    );
  });
}
