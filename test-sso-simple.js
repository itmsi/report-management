const axios = require('axios');

// Konfigurasi test
const BASE_URL = 'http://localhost:9588';
const TEST_USER = {
  username: 'admin',
  password: 'admin123',
  client_id: 'test_client',
  redirect_uri: 'http://localhost:3001/callback'
};

// Helper function untuk test
async function testSSOFlow() {
  console.log('🚀 Memulai test SSO Handler...\n');

  try {
    // Test 1: Login SSO
    console.log('1️⃣ Testing Login SSO...');
    const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/sso/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password,
      client_id: TEST_USER.client_id,
      redirect_uri: TEST_USER.redirect_uri
    });

    if (loginResponse.data.success) {
      console.log('✅ Login berhasil');
      console.log('📋 User data:', loginResponse.data.data);
      
      const authCode = loginResponse.data.data.authorization_code;
      
      // Test 2: Token Exchange
      console.log('\n2️⃣ Testing Token Exchange...');
      const tokenResponse = await axios.post(`${BASE_URL}/api/v1/auth/sso/token`, {
        grant_type: 'authorization_code',
        code: authCode,
        client_id: TEST_USER.client_id,
        client_secret: 'test_secret',
        redirect_uri: TEST_USER.redirect_uri
      });

      if (tokenResponse.data.success) {
        console.log('✅ Token exchange berhasil');
        console.log('🔑 Access token:', tokenResponse.data.data.access_token.substring(0, 50) + '...');
        
        const accessToken = tokenResponse.data.data.access_token;
        
        // Test 3: User Info
        console.log('\n3️⃣ Testing User Info...');
        const userInfoResponse = await axios.get(`${BASE_URL}/api/v1/auth/sso/userinfo`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (userInfoResponse.data.success) {
          console.log('✅ User info berhasil');
          console.log('👤 User info:', userInfoResponse.data.data);
          
          // Test 4: Logout
          console.log('\n4️⃣ Testing Logout...');
          const logoutResponse = await axios.post(`${BASE_URL}/api/v1/auth/sso/logout`, {
            token: accessToken
          });

          if (logoutResponse.data.success) {
            console.log('✅ Logout berhasil');
            
            // Test 5: Verify token invalidated
            console.log('\n5️⃣ Testing Token Invalidation...');
            try {
              await axios.get(`${BASE_URL}/api/v1/auth/sso/userinfo`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              });
              console.log('❌ Token masih valid (seharusnya sudah invalid)');
            } catch (error) {
              if (error.response?.status === 401) {
                console.log('✅ Token berhasil di-invalidate');
              } else {
                console.log('❌ Error tidak terduga:', error.message);
              }
            }
          } else {
            console.log('❌ Logout gagal:', logoutResponse.data.message);
          }
        } else {
          console.log('❌ User info gagal:', userInfoResponse.data.message);
        }
      } else {
        console.log('❌ Token exchange gagal:', tokenResponse.data.message);
      }
    } else {
      console.log('❌ Login gagal:', loginResponse.data.message);
    }

    // Test 6: Authorization Flow
    console.log('\n6️⃣ Testing Authorization Flow...');
    const authResponse = await axios.get(`${BASE_URL}/api/v1/auth/sso/authorize`, {
      params: {
        client_id: TEST_USER.client_id,
        redirect_uri: TEST_USER.redirect_uri,
        response_type: 'code',
        state: 'test_state'
      }
    });

    if (authResponse.data.success) {
      console.log('✅ Authorization berhasil');
      console.log('🔗 Authorization URL:', authResponse.data.data.authorization_url);
      
      // Test callback dengan code dari authorization
      const authCode = authResponse.data.data.code;
      console.log('\n7️⃣ Testing Callback...');
      const callbackResponse = await axios.get(`${BASE_URL}/api/v1/auth/sso/callback`, {
        params: {
          code: authCode,
          state: 'test_state'
        }
      });

      if (callbackResponse.data.success) {
        console.log('✅ Callback berhasil');
        console.log('📋 Callback data:', callbackResponse.data.data);
      } else {
        console.log('❌ Callback gagal:', callbackResponse.data.message);
      }
    } else {
      console.log('❌ Authorization gagal:', authResponse.data.message);
    }

    console.log('\n🎉 Test SSO Handler selesai!');

  } catch (error) {
    console.error('❌ Error selama testing:', error.message);
    if (error.response) {
      console.error('📋 Response data:', error.response.data);
    }
  }
}

// Test error cases
async function testErrorCases() {
  console.log('\n🔍 Testing Error Cases...\n');

  try {
    // Test invalid credentials
    console.log('1️⃣ Testing invalid credentials...');
    try {
      await axios.post(`${BASE_URL}/api/v1/auth/sso/login`, {
        username: 'invalid',
        password: 'invalid'
      });
      console.log('❌ Seharusnya gagal dengan kredensial invalid');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials ditolak dengan benar');
      }
    }

    // Test missing parameters
    console.log('\n2️⃣ Testing missing parameters...');
    try {
      await axios.post(`${BASE_URL}/api/v1/auth/sso/login`, {
        username: 'admin'
        // password missing
      });
      console.log('❌ Seharusnya gagal dengan parameter missing');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Missing parameters ditolak dengan benar');
      }
    }

    // Test invalid token
    console.log('\n3️⃣ Testing invalid token...');
    try {
      await axios.get(`${BASE_URL}/api/v1/auth/sso/userinfo`, {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      });
      console.log('❌ Seharusnya gagal dengan token invalid');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token ditolak dengan benar');
      }
    }

    console.log('\n✅ Error cases testing selesai!');

  } catch (error) {
    console.error('❌ Error selama error testing:', error.message);
  }
}

// Main function
async function main() {
  console.log('🧪 SSO Handler Test Suite');
  console.log('========================\n');
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/api/v1`);
    console.log('✅ Server berjalan di', BASE_URL);
  } catch (error) {
    console.log('❌ Server tidak berjalan di', BASE_URL);
    console.log('💡 Pastikan server sudah dijalankan dengan: npm run dev');
    return;
  }

  await testSSOFlow();
  await testErrorCases();
}

// Run tests
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSSOFlow, testErrorCases };
