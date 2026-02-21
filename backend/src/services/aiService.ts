import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PayrollBatch } from '../models/payroll';
import { employeeRegistry } from '../data/employeeRegistry';

export interface AIResponse {
  type: 'payroll' | 'analytics' | 'report';
  success: boolean;
  data?: any;
  message: string;
  executionPlan?: string[];
}

export interface PayrollAnalytics {
  totalAmount: number;
  employeeCount: number;
  averageAmount: number;
  departmentBreakdown: Record<string, number>;
  trends: string[];
  recommendations: string[];
}

export class AIPayrollService {

  private model;

  constructor() {

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables");
      throw new Error("Missing GEMINI_API_KEY in .env file");
    }

    console.log("Gemini API key loaded");

    const genAI = new GoogleGenerativeAI(apiKey);

    this.model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
  }

  async processQuery(userQuery: string): Promise<AIResponse> {

    try {

      console.log('AI processing query:', userQuery);

      const systemPrompt = `
You are SECLO AI, an intelligent payroll assistant for a blockchain payroll system.

CONTEXT:
Company uses SCLO tokens on Hoodi blockchain.

Employee Registry:
${JSON.stringify(employeeRegistry, null, 2)}

RESPONSE FORMAT:
Return ONLY valid JSON (no markdown, no code blocks).

For PAYROLL requests, use this exact format:
{
  "type": "payroll",
  "success": true,
  "data": {
    "records": [
      {"employeeId": "0xA1B2C3D4E5F60123456789012345678901234567", "amount": 5000},
      {"employeeId": "0xB2C3D4E5F6012345678901234567890123456789", "amount": 5000}
    ]
  },
  "message": "Processing payroll for Alice (5000 SCLO) and Bob (5000 SCLO)",
  "executionPlan": ["Validate employees", "Check amounts", "Execute CRE workflow"]
}

CRITICAL: Use "records" not "payments". Use "employeeId" not "wallet".

For ANALYTICS requests:
{
  "type": "analytics",
  "success": true,
  "data": {
    "totalAmount": 100000,
    "employeeCount": 15,
    "averageAmount": 6666,
    "departmentBreakdown": {"Engineering": 50000},
    "trends": ["Trend info"],
    "recommendations": ["Recommendation"]
  },
  "message": "Analytics summary",
  "executionPlan": ["Analyze data"]
}

For REPORT requests:
{
  "type": "report",
  "success": true,
  "data": {
    "title": "Report Title",
    "summary": "Summary text",
    "sections": [{"title": "Section", "content": "Content"}]
  },
  "message": "Report generated",
  "executionPlan": ["Generate report"]
}

CRITICAL RULES:
- For payroll: data.records MUST be an array with employeeId and amount
- Use exact wallet addresses from employee registry
- Respect maxAmount limits
- Always include executionPlan array
`;

      const prompt = `${systemPrompt}

User wants: "${userQuery}"

Extract employee names, find their wallet addresses from registry, and return the JSON with records array filled.

JSON response:`;

      const result = await this.model.generateContent(prompt);

      const text = result.response.text();

      console.log("Raw Gemini response:", text);

      // Extract JSON safely
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }

      const parsed: AIResponse = JSON.parse(jsonMatch[0]);

      console.log("Parsed response before normalization:", JSON.stringify(parsed, null, 2));

      // FIX: Auto-repair response structure for payroll with STRICT validation
      if (parsed.type === "payroll") {
        // Ensure data object exists
        if (!parsed.data) {
          console.log("No data object found; creating empty records array");
          parsed.data = { records: [] };
        }
        
        // Handle various field names AI might use (transactions, payments, etc.)
        if (!parsed.data.records || !Array.isArray(parsed.data.records)) {
          console.log("No valid records array found; checking alternatives...");
          
          // Try to find records under different names
          let possibleRecords = parsed.data.transactions || 
                                  parsed.data.payments || 
                                  parsed.data.payroll ||
                                  parsed.data.entries;
          
          // CRITICAL: If it's an object (not array), try to extract array from it
          if (possibleRecords && typeof possibleRecords === 'object' && !Array.isArray(possibleRecords)) {
            console.log("Found object instead of array; attempting to extract array...");
            // Try common nested patterns or convert object values to array
            possibleRecords = possibleRecords.items || 
                            possibleRecords.list || 
                            possibleRecords.data || 
                            Object.values(possibleRecords);
          }
          
          if (possibleRecords && Array.isArray(possibleRecords)) {
            console.log(`Found ${possibleRecords.length} records under an alternative field name`);
            parsed.data.records = possibleRecords;
          } else {
            console.log("No valid records array found; initializing empty array");
            parsed.data.records = [];
          }
        }
        
        // CRITICAL FIX: Ensure records is ALWAYS an array
        if (!Array.isArray(parsed.data.records)) {
          console.log("records is not an array; converting to empty array");
          parsed.data.records = [];
        }
        
        // Normalize field names in records (employeeId, wallet, address -> employeeId)
        if (Array.isArray(parsed.data.records) && parsed.data.records.length > 0) {
          console.log(`Normalizing ${parsed.data.records.length} record(s)...`);
          try {
            parsed.data.records = parsed.data.records.map((record: any) => {
              // Ensure record is an object
              if (!record || typeof record !== 'object') {
                console.warn("Invalid record found; skipping:", record);
                return null;
              }
              
              return {
                employeeId: record.employeeId || record.wallet || record.address || '',
                amount: typeof record.amount === 'number' ? record.amount : 0
              };
            }).filter((record: any) => record !== null && record.employeeId); // Remove invalid records
          } catch (mapError) {
            console.error("Error during record normalization:", mapError);
            parsed.data.records = [];
          }
        }
        
        // FINAL VALIDATION: Ensure records array is valid
        if (!Array.isArray(parsed.data.records)) {
          console.error("records is still not an array after normalization");
          parsed.data.records = [];
        }
        
        // Clean up alternative field names to avoid confusion
        delete parsed.data.payments;
        delete parsed.data.transactions;
        delete parsed.data.payroll;
        delete parsed.data.entries;
      }

      console.log("Parsed response after normalization:", JSON.stringify(parsed, null, 2));

      return parsed;

    } catch (error: any) {

      console.error("AI service error:", error.message);
      console.error("Error stack:", error.stack);

      return {
        type: "report",
        success: false,
        message: `AI processing failed: ${error.message}`,
        executionPlan: ["AI processing failed"],
        data: { records: [] } // IMPORTANT: Always include empty records for consistency
      };

    }

  }

  async generatePayrollAnalytics(
    batches: PayrollBatch[]
  ): Promise<PayrollAnalytics> {

    // Validate batches array input
    if (!batches || !Array.isArray(batches)) {
      console.warn("Invalid batches array provided to generatePayrollAnalytics");
      return {
        totalAmount: 0,
        employeeCount: 0,
        averageAmount: 0,
        departmentBreakdown: {},
        trends: ["No payroll data available"],
        recommendations: ["Start by creating payroll batches"]
      };
    }

    // Calculate total amount across all batches
    const totalAmount = batches.reduce(
      (sum, batch) => {
        // Validate batch.records exists and is an array
        if (!batch?.records || !Array.isArray(batch.records)) {
          console.warn("Batch missing records array:", batch);
          return sum;
        }
        return sum + batch.records.reduce(
          (batchSum, record) => batchSum + (record?.amount || 0),
          0
        );
      },
      0
    );

    // Extract unique employee wallets across all batches
    const uniqueEmployees = new Set(
      batches.flatMap(batch => {
        // Validate batch.records exists and is an array
        if (!batch?.records || !Array.isArray(batch.records)) {
          return [];
        }
        return batch.records.map(record => 
          record?.wallet?.toLowerCase() || ''
        ).filter(wallet => wallet); // Remove empty wallets
      })
    );

    // Calculate department-wise spending breakdown
    const departmentBreakdown: Record<string, number> = {};

    batches.forEach(batch => {
      // Validate batch.records exists and is an array
      if (!batch?.records || !Array.isArray(batch.records)) {
        return;
      }

      batch.records.forEach(record => {
        if (!record?.wallet) {
          return;
        }

        // Match record to employee in registry
        const employee = employeeRegistry.find(
          emp =>
            emp.wallet.toLowerCase() ===
            record.wallet.toLowerCase()
        );

        if (employee) {
          departmentBreakdown[employee.department] =
            (departmentBreakdown[employee.department] || 0)
            + (record.amount || 0);
        }
      });
    });

    const employeeCount = uniqueEmployees.size;

    return {

      totalAmount,

      employeeCount,

      averageAmount:
        employeeCount === 0
          ? 0
          : totalAmount / employeeCount,

      departmentBreakdown,

      trends: [
        `Total payroll: ${totalAmount} SCLO`,
        `Employees paid: ${employeeCount}`
      ],

      recommendations: [
        "Monitor payroll growth",
        "Optimize department spending"
      ]

    };

  }

}

export const aiService = new AIPayrollService();