// Quick test script to verify backend endpoints
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testBackend() {
  try {
    console.log('Testing backend API...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get('http://localhost:3001/api/health');
    console.log('✓ Health check:', health.data);
    
    // Test 2: Create a test CSV
    console.log('\n2. Creating test CSV...');
    const csvContent = 'wallet,amount,currency\n0x123,1000,USD\n0x456,2000,USD';
    fs.writeFileSync('test-payroll.csv', csvContent);
    console.log('✓ Test CSV created');
    
    // Test 3: Upload CSV
    console.log('\n3. Testing upload endpoint...');
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-payroll.csv'));
    
    const uploadRes = await axios.post('http://localhost:3001/payroll/upload', formData, {
      headers: formData.getHeaders()
    });
    console.log('✓ Upload response:', uploadRes.data);
    
    const batchId = uploadRes.data.batchId;
    
    // Test 4: Start workflow
    console.log('\n4. Testing start workflow endpoint...');
    const startRes = await axios.post('http://localhost:3001/payroll/start', { batchId });
    console.log('✓ Workflow response:', startRes.data);
    
    // Cleanup
    fs.unlinkSync('test-payroll.csv');
    console.log('\n✓ All tests passed!');
    
  } catch (error) {
    console.error('\n✗ Error:', error.response?.data || error.message);
  }
}

testBackend();
