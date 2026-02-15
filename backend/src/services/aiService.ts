import { GoogleGenerativeAI } from '@google/generative-ai';
import { PayrollBatch, PayrollRecord } from '../models/payroll';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
  { name: "Alice", wallet: "0xA1B2C3D4E5F60123456789012345678901234567", department: "Engineering", maxAmount: 10000 },
  { name: "Bob", wallet: "0xB2C3D4E5F6012345678901234567890123456789", department: "Marketing", maxAmount: 8000 },
  { name: "Carol", wallet: "0xC3D4E5F6012345678901234567890123456789AB", department: "Sales", maxAmount: 12000 },
  { name: "David", wallet: "0xD4E5F6012345678901234567890123456789ABCD", department: "Engineering", maxAmount: 9000 },
  { name: "Eve", wallet: "0xE5F6012345678901234567890123456789ABCDE1", department: "HR", maxAmount: 7500 }
];

export class AIPayrollService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  async processQuery(userQuery: string): Promise<AIResponse> {
    try {
      console.log('🤖 AI Processing query:', userQuery);

      const systemPrompt = `
You are SECLO AI, an intelligent payroll assistant for a blockchain-based payroll system. 

CONTEXT:
- Company uses SCLO tokens for payments on Hoodi blockchain
- Employee registry: ${JSON.stringify(employeeRegistry, null, 2)}
- Historical data: ${JSON.stringify(mockHistoricalData, null, 2)}

CAPABILITIES:
1. PAYROLL PROCESSING: Convert natural language to payroll JSON
2. ANALYTICS: Analyze payroll data and trends
3. REPORTS: Generate detailed payroll reports

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
  "type": "payroll" | "analytics" | "report",
  "success": true/false,
  "data": {...},
  "message": "human readable response",
  "executionPlan": ["step1", "step2", ...]
}

PAYROLL FORMAT (when type="payroll"):
{
  "type": "payroll",
  "success": true,
  "data": {
    "batchId": "ai-generated-batch-id",
    "records": [
      {"employeeId": "wallet_address", "amount": number}
    ]
  },
  "message": "Processing payroll for X employees",
  "executionPlan": ["Validate employees", "Check amounts", "Execute CRE workflow"]
}

ANALYTICS FORMAT (when type="analytics"):
{
  "type": "analytics",
  "success": true,
  "data": {
    "totalAmount": number,
    "employeeCount": number,
    "averageAmount": number,
    "departmentBreakdown": {"Engineering": 25000, "Marketing": 15000},
    "trends": ["Cost increased 10% vs last month"],
    "recommendations": ["Consider salary bands for cost control"]
  },
  "message": "Analytics summary",
  "executionPlan": ["Analyze historical data", "Calculate trends", "Generate insights"]
}

REPORT FORMAT (when type="report"):
{
  "type": "report",
  "success": true,
  "data": {
    "title": "Monthly Payroll Report",
    "summary": "Executive summary text",
    "sections": [
      {"title": "Overview", "content": "..."},
      {"title": "Department Breakdown", "content": "..."}
    ],
    "charts": [
      {"type": "bar", "title": "Department Costs", "data": {...}}
    ]
  },
  "message": "Report generated successfully",
  "executionPlan": ["Gather data", "Analyze trends", "Format report"]
}

RULES:
- Only use employees from the registry
- Respect max amount limits
- Generate realistic batch IDs
- Provide helpful error messages
- Always include execution plan
`;

      const prompt = `${systemPrompt}\n\nUser Query: "${userQuery}"\n\nRespond with appropriate JSON:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('🤖 AI Raw response:', text);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const aiResponse: AIResponse = JSON.parse(jsonMatch[0]);
      console.log('🤖 AI Parsed response:', aiResponse);

      return aiResponse;

    } catch (error) {
      console.error('❌ AI Service error:', error);
      return {
        type: 'report',
        success: false,
        message: `AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionPlan: ['Error occurred during processing']
      };
    }
  }

  async generatePayrollAnalytics(batches: PayrollBatch[]): Promise<PayrollAnalytics> {
    const totalAmount = batches.reduce((sum, batch) => 
      sum + batch.records.reduce((batchSum, record) => batchSum + record.amount, 0), 0
    );

    const totalEmployees = new Set(
      batches.flatMap(batch => batch.records.map(record => record.wallet))
    ).size;

    const departmentBreakdown: Record<string, number> = {};
    
    batches.forEach(batch => {
      batch.records.forEach(record => {
        const employee = employeeRegistry.find(emp => 
          emp.wallet.toLowerCase() === record.wallet.toLowerCase()
        );
        if (employee) {
          departmentBreakdown[employee.department] = 
            (departmentBreakdown[employee.department] || 0) + record.amount;
        }
      });
    });

    return {
      totalAmount,
      employeeCount: totalEmployees,
      averageAmount: totalAmount / totalEmployees,
      departmentBreakdown,
      trends: [
        `Total payroll: ${totalAmount.toLocaleString()} SCLO`,
        `Average per employee: ${(totalAmount / totalEmployees).toFixed(0)} SCLO`,
        'Engineering department has highest costs'
      ],
      recommendations: [
        'Consider implementing salary bands',
        'Monitor department cost growth',
        'Review high-cost employees for retention'
      ]
    };
  }
}

export const aiService = new AIPayrollService();