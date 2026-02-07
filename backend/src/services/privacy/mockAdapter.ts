import { PrivacyAdapter } from "./interface";
import { ConfidentialPayload } from "./types";

function fakeEncrypt(data: any) {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function fakeProof(data: any) {
  return "proof_" + Math.random().toString(36).substring(2, 12);
}

export class MockPrivacyAdapter implements PrivacyAdapter {

  async sendConfidentialPayload(data: ConfidentialPayload): Promise<string> {
    console.log("Mock confidential payload sent");

    const encrypted = fakeEncrypt(data);

    return encrypted;
  }

  async executePrivateBatch(batchId: string, data: any): Promise<string> {
    console.log("Simulating private transaction for batch:", batchId);

    return "private_tx_" + batchId;
  }

  async generateProof(batchId: string): Promise<string> {
    return fakeProof(batchId);
  }
}
