import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/user/update-phone', {
      email: 'test@example.com',
      phone: '+911234567890',
      name: 'Test Member'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
