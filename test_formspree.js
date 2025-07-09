// Test script to verify Formspree forms are working
require('isomorphic-fetch');

const testFormspreeUrls = [
  'https://formspree.io/f/xjkrej',
  'https://formspree.io/f/xeokv',
  'https://formspree.io/f/mwpb',
  'https://formspree.io/f/mrbk'
];

async function testFormspreeForm(url) {
  try {
    console.log(`\n🧪 Testing Formspree form: ${url}`);
    
    const testData = {
      email: 'test@example.com',
      name: 'Test User',
      subject: 'Test Email from Tire Management System',
      message: 'This is a test email to verify the Formspree form is working correctly.',
      _replyto: 'test@example.com'
    };
    
    console.log('Sending test data:', testData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams(testData)
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`Response body: ${responseText}`);
    
    if (response.ok) {
      console.log('✅ Form test successful!');
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('JSON response:', jsonResponse);
      } catch (e) {
        console.log('Response is not JSON');
      }
    } else {
      console.log('❌ Form test failed!');
    }
    
    return response.ok;
    
  } catch (error) {
    console.error(`❌ Error testing form ${url}:`, error.message);
    return false;
  }
}

async function testAllForms() {
  console.log('🚀 Starting Formspree form tests...\n');
  
  let successCount = 0;
  
  for (const url of testFormspreeUrls) {
    const success = await testFormspreeForm(url);
    if (success) successCount++;
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n📊 Test Results: ${successCount}/${testFormspreeUrls.length} forms working`);
  
  if (successCount === 0) {
    console.log('\n❌ All forms failed. Possible issues:');
    console.log('1. Formspree forms are not configured correctly');
    console.log('2. Forms are not active or verified');
    console.log('3. Network connectivity issues');
    console.log('4. Rate limiting from Formspree');
  } else if (successCount < testFormspreeUrls.length) {
    console.log('\n⚠️  Some forms failed. Check individual form configurations.');
  } else {
    console.log('\n✅ All forms are working correctly!');
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testAllForms().catch(console.error);
}

module.exports = { testFormspreeForm, testAllForms };
