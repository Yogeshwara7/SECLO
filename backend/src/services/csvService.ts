import {parse} from 'csv-parse/sync';
import { PayrollRecord } from '../models/payroll';

export function parseCSV(buffer:Buffer):PayrollRecord[]{
    const data=parse(buffer,{
        columns:true,
        skip_empty_lines:true,
    });

    return data.map((row:any)=>({
        wallet:row.wallet,
        amount:parseFloat(row.amount),
        currency:row.currency,
    }));
}