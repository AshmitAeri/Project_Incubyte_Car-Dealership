const axios = require('axios');

async function run() {
  try {
    // 1. Register admin
    const email = 'admin' + Date.now() + '@test.com';
    const regRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Admin',
      email: email,
      password: 'password123'
    });
    console.log('Registered admin');
    
    // The default role is user, we need to make him admin in DB
    const token = regRes.data.token;
    
    // Oh wait, we need admin role. Let me write a script to do mongoose directly to set admin
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
