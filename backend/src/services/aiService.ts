import dotenv from "dotenv";
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PayrollBatch } from '../models/payroll';

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

// Mock historical data for analytics
const mockHistoricalData = [
  { month: 'Jan 2024', total: 45000, employees: 12 },
  { month: 'Feb 2024', total: 47000, employees: 13 },
  { month: 'Mar 2024', total: 52000, employees: 15 },
  { month: 'Apr 2024', total: 48000, employees: 14 },
  { month: 'May 2024', total: 55000, employees: 16 },
];

// Employee registry for AI context
const employeeRegistry = [
  {
    name: "Alice",
    wallet: "0xA1B2C3D4E5F60123456789012345678901234567",
    department: "Engineering",
    maxAmount: 10000
  },
  {
    name: "Bob",
    wallet: "0xB2C3D4E5F6012345678901234567890123456789",
    department: "Marketing",
    maxAmount: 8000
  },
  {
    name: "Carol",
    wallet: "0xC3D4E5F6012345678901234567890123456789AB",
    department: "Sales",
    maxAmount: 12000
  },
  {
    name: "David",
    wallet: "0xD4E5F6012345678901234567890123456789ABCD",
    department: "Engineering",
    maxAmount: 9000
  },
  {
    name: "Eve",
    wallet: "0xE5F6012345678901234567890123456789ABCDE1",
    department: "HR",
    maxAmount: 7500
  }
];

export class AIPayrollService {

  private model;

  constructor() {

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not found in environment variables");
      throw new Error("Missing GEMINI_API_KEY in .env file");
    }

    console.log("✅ Gemini API key loaded");

    const genAI = new GoogleGenerativeAI(apiKey);

    this.model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });
  }

  async processQuery(userQuery: string): Promise<AIResponse> {

    try {

      console.log('🤖 AI Processing query:', userQuery);

      const systemPrompt = `
You are SECLO AI, an intelligent payroll assistant for a blockchain payroll system.

CONTEXT:
Company uses SCLO tokens on Hoodi blockchain.

Employee Registry:
${JSON.stringify(employeeRegistry, null, 2)}

Historical Data:
${JSON.stringify(mockHistoricalData, null, 2)}

RESPONSE FORMAT:
Return ONLY valid JSON.

{
  "type": "payroll" | "analytics" | "report",
  "success": true,
  "data": {},
  "message": "",
  "executionPlan": []
}

RULES:
- Only use employees from registry
- Respect maxAmount limits
- Always include executionPlan
`;

      const prompt = `
${systemPrompt}

User Query: ${userQuery}

Return JSON only:
`;

      const result = await this.model.generateContent(prompt);

      const text = result.response.text();

      console.log("🤖 Raw Gemini response:", text);

      // Extract JSON safely
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {

        throw new Error("No JSON found in AI response");

      }

      const parsed: AIResponse = JSON.parse(jsonMatch[0]);

      console.log("✅ Parsed AI response:", parsed);

      return parsed;

    } catch (error: any) {

      console.error("❌ AI Service error:", error.message);

      return {
        type: "report",
        success: false,
        message: error.message,
        executionPlan: ["AI processing failed"]
      };

    }

  }

  async generatePayrollAnalytics(
    batches: PayrollBatch[]
  ): Promise<PayrollAnalytics> {

    const totalAmount = batches.reduce(
      (sum, batch) =>
        sum +
        batch.records.reduce(
          (batchSum, record) => batchSum + record.amount,
          0
        ),
      0
    );

    const uniqueEmployees = new Set(
      batches.flatMap(batch =>
        batch.records.map(record => record.wallet.toLowerCase())
      )
    );

    const departmentBreakdown: Record<string, number> = {};

    batches.forEach(batch => {

      batch.records.forEach(record => {

        const employee = employeeRegistry.find(
          emp =>
            emp.wallet.toLowerCase() ===
            record.wallet.toLowerCase()
        );

        if (employee) {

          departmentBreakdown[employee.department] =
            (departmentBreakdown[employee.department] || 0)
            + record.amount;

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