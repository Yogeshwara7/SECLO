export interface ConfidentialPayload{
    batchId:string;
    records:{
        wallet:string;
        amount:number;
        currency:string;
    }[];
}

export interface PrivateExecutionResult{
    transactionId:string;
    proof:string;
}
