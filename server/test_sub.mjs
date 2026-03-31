import axios from 'axios';

async function testSubscription() {
  try {
    console.log('--- Case 1: SMS enabled but NO phone (should fail) ---');
    // First, clear any user to be sure
    // Actually, I'll just use a non-existent email
    const res1 = await axios.post('http://localhost:5000/api/subscriptions', {
      serviceName: 'Netflix',
      amount: 499,
      billingCycle: 'Monthly',
      nextRenewalDate: new Date().toISOString(),
      category: 'OTT',
      reminders: { sms: true },
      userEmail: 'no-phone@example.com'
    });
    console.log('Error Case Failed to show error:', res1.data);
  } catch (err) {
    console.log('Expected Error:', err.response?.data || err.message);
  }

  try {
    console.log('\n--- Case 2: SMS enabled with phone (should succeed) ---');
    // We already created 'test@example.com' with a phone in previous step
    const res2 = await axios.post('http://localhost:5000/api/subscriptions', {
      serviceName: 'Spotify',
      amount: 119,
      billingCycle: 'Monthly',
      nextRenewalDate: new Date().toISOString(),
      category: 'Music',
      reminders: { sms: true },
      userEmail: 'test@example.com'
    });
    console.log('Success Case:', res2.data.serviceName);
  } catch (err) {
    console.log('Success Case Failed:', err.response?.data || err.message);
  }
}

testSubscription();
