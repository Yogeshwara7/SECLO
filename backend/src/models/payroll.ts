export interface PayrollRecord{
    wallet:string;
    amount:number;
    currency:string;
}

export interface PayrollBatch{
    id:string;
    records:PayrollRecord[];
    status:"pending" | "processing" | "completed" | "failed";
    createdAt?: string;
}