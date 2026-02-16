import React, { useState } from "react";
import { api } from "../services/api";

interface AIResponse {
  type: 'payroll' | 'analytics' | 'report';
  success: boolean;
  data?: any;
  message: string;
  executionPlan?: string[];
  execution?: {
    batchId?: string;
    creResult?: string;
    status: 'completed' | 'failed';
    error?: string;
  };
}

const AIInterface = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      console.log("Sending AI query:", query);
      const res = await api.post("/ai/query", { query });
      console.log("AI response:", res.data);
      setResponse(res.data);
    } catch (error) {
      console.error("AI query failed:", error);
      setResponse({
        type: 'report',
        success: false,
        message: "AI query failed. Please try again.",
        executionPlan: ["Error occurred"]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPayrollData = (data: any) => {
    // Handle multiple possible field names for records
    const records = data.records || data.payments || data.transactions || [];
    const batchId = data.batchId || response?.execution?.batchId || 'N/A';
    
    return (
      <div style={{ marginTop: '15px' }}>
        <h4 style={{ color: '#222222', marginBottom: '10px' }}>Payroll Details</h4>
        <div style={{ 
          backgroundColor: '#FAF3E1', 
          padding: '15px', 
          borderRadius: '8px',
          border: '2px solid #FA8112'
        }}>
          <p><strong>Batch ID:</strong> {batchId}</p>
          <p><strong>Employees:</strong> {Array.isArray(records) ? records.length : 0}</p>
          {Array.isArray(records) && records.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <strong>Records:</strong>
              {records.map((record: any, index: number) => (
                <div key={index} style={{ 
                  marginLeft: '20px', 
                  padding: '5px 0',
                  borderBottom: '1px solid #F5E7C6'
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {(record.employeeId || record.wallet || 'Unknown')?.substring(0, 10)}...
                  </span>
                  <span style={{ float: 'right', fontWeight: 'bold' }}>
                    {record.amount || 0} SCLO
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnalyticsData = (data: any) => (
    <div style={{ marginTop: '15px' }}>
      <h4 style={{ color: '#222222', marginBottom: '10px' }}>Analytics</h4>
      <div style={{ 
        backgroundColor: '#FAF3E1', 
        padding: '15px', 
        borderRadius: '8px',
        border: '2px solid #FA8112'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <p><strong>Total Amount:</strong> {data.totalAmount?.toLocaleString()} SCLO</p>
            <p><strong>Employee Count:</strong> {data.employeeCount}</p>
            <p><strong>Average Amount:</strong> {data.averageAmount?.toFixed(0)} SCLO</p>
          </div>
          <div>
            <strong>Department Breakdown:</strong>
            {Object.entries(data.departmentBreakdown || {}).map(([dept, amount]: [string, any]) => (
              <div key={dept} style={{ marginLeft: '10px' }}>
                {dept}: {amount.toLocaleString()} SCLO
              </div>
            ))}
          </div>
        </div>
        
        {Array.isArray(data.trends) && data.trends.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <strong>Trends:</strong>
            <ul style={{ marginLeft: '20px' }}>
              {data.trends.map((trend: string, index: number) => (
                <li key={index}>{trend}</li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <strong>Recommendations:</strong>
            <ul style={{ marginLeft: '20px' }}>
              {data.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderReportData = (data: any) => (
    <div style={{ marginTop: '15px' }}>
      <h4 style={{ color: '#222222', marginBottom: '10px' }}>{data.title || 'Report'}</h4>
      <div style={{ 
        backgroundColor: '#FAF3E1', 
        padding: '15px', 
        borderRadius: '8px',
        border: '2px solid #FA8112'
      }}>
        {data.summary && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Executive Summary:</strong>
            <p style={{ marginTop: '5px' }}>{data.summary}</p>
          </div>
        )}
        
        {data.sections?.map((section: any, index: number) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <h5 style={{ color: '#FA8112' }}>{section.title}</h5>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExecutionResult = (execution: any) => (
    <div style={{ marginTop: '15px' }}>
      <h4 style={{ color: '#222222', marginBottom: '10px' }}>Execution Result</h4>
      <div style={{ 
        backgroundColor: execution.status === 'completed' ? '#E8F5E8' : '#FFE8E8', 
        padding: '15px', 
        borderRadius: '8px',
        border: `2px solid ${execution.status === 'completed' ? '#4CAF50' : '#F44336'}`
      }}>
        <p><strong>Status:</strong> {execution.status}</p>
        {execution.batchId && <p><strong>Batch ID:</strong> {execution.batchId}</p>}
        {execution.records !== undefined && <p><strong>Records Processed:</strong> {execution.records}</p>}
        {execution.creResult && (
          <div style={{ marginTop: '10px' }}>
            <strong>CRE Result:</strong>
            <pre style={{ 
              backgroundColor: '#F5F5F5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {typeof execution.creResult === 'string' 
                ? execution.creResult 
                : JSON.stringify(execution.creResult, null, 2)}
            </pre>
          </div>
        )}
        {execution.error && (
          <div style={{ marginTop: '10px', color: '#F44336' }}>
            <strong>Error:</strong> {execution.error}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#FAF3E1',
      minHeight: 'calc(100vh - 80px)'
    }}>
      <h3 style={{ 
        fontSize: '28px', 
        color: '#222222', 
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        SECLO Assistant
      </h3>
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: '#F5E7C6',
        borderRadius: '12px',
        border: '2px solid #FA8112',
        padding: '30px'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#222222'
            }}>
              Ask me anything about payroll:
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Examples:
• Pay Alice and Bob 5000 tokens each
• Show me payroll analytics for this month
• Generate a payroll report for engineering team
• What's our average salary cost?
• Who got paid last week?"
              style={{
                width: '100%',
                height: '120px',
                padding: '15px',
                borderRadius: '8px',
                border: '2px solid #222222',
                backgroundColor: '#FAF3E1',
                color: '#222222',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || !query.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: isLoading ? '#F5E7C6' : '#FA8112',
              color: isLoading ? '#222222' : '#FAF3E1',
              border: '2px solid #222222',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? 'Processing...' : 'Ask SECLO AI'}
          </button>
        </form>

        {response && (
          <div style={{ marginTop: '30px' }}>
            <div style={{
              padding: '15px',
              backgroundColor: response.success ? '#E8F5E8' : '#FFE8E8',
              border: `2px solid ${response.success ? '#4CAF50' : '#F44336'}`,
              borderRadius: '8px',
              marginBottom: '15px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#222222' }}>
                {response.type.toUpperCase()} Response
              </h4>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{response.message}</p>
            </div>

            {response.executionPlan && Array.isArray(response.executionPlan) && response.executionPlan.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Execution Plan:</strong>
                <ol style={{ marginLeft: '20px' }}>
                  {response.executionPlan.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}

            {response.success && response.data && (
              <>
                {response.type === 'payroll' && renderPayrollData(response.data)}
                {response.type === 'analytics' && renderAnalyticsData(response.data)}
                {response.type === 'report' && renderReportData(response.data)}
              </>
            )}

            {response.execution && renderExecutionResult(response.execution)}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInterface;