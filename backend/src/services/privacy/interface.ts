export interface PrivacyAdapter {
    sendConfidentialPayload(data: any): Promise<string>;
    executePrivateBatch(batchId: string, data: any): Promise<string>;
    generateProof(batchId: string): Promise<string>;
}