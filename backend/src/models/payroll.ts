export interface PayrollRecord{
    wallet:string;
    amount:number;
    currency:string;
}

export interface PayrollBatch{
    id:string;
    records:PayrollRecord[];
    status:"uploaded"| "processing" | "processed" | "failed";
}