#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🏗️  Memory Palace Mobile Setup');
console.log('=====================================');
console.log('');
console.log('This script will help you configure your backend connection.');
console.log('');

// Get current IP from config
const configPath = path.join(__dirname, '..', 'config', 'app.ts');
let currentIP = 'http://192.168.1.100:8000';

try {
  const configContent = fs.readFileSync(configPath, 'utf8');
  const match = configContent.match(/API_BASE_URL:\s*"([^"]+)"/);
  if (match) {
    currentIP = match[1];
  }
} catch (error) {
  console.log('⚠️  Could not read current config');
}

console.log(`Current backend URL: ${currentIP}`);
console.log('');

rl.question('Enter your backend IP address (e.g., 192.168.1.100): ', (ip) => {
  if (!ip.trim()) {
    console.log('❌ No IP address provided. Exiting...');
    rl.close();
    return;
  }

  // Validate IP format (basic)
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip.trim())) {
    console.log('❌ Invalid IP address format. Please use format like: 192.168.1.100');
    rl.close();
    return;
  }

  const newBaseUrl = `http://${ip.trim()}:8000`;
  
  rl.question(`Port (default: 8000): `, (port) => {
    const finalPort = port.trim() || '8000';
    const finalUrl = `http://${ip.trim()}:${finalPort}`;
    
    console.log('');
    console.log(`🔧 Updating backend URL to: ${finalUrl}`);
    
    try {
      // Update config file
      const configContent = fs.readFileSync(configPath, 'utf8');
      const updatedConfig = configContent.replace(
        /API_BASE_URL:\s*"[^"]+"/,
        `API_BASE_URL: "${finalUrl}"`
      );
      fs.writeFileSync(configPath, updatedConfig);
      
      console.log('✅ Configuration updated successfully!');
      console.log('');
      console.log('📱 Next steps:');
      console.log('1. Make sure your backend is running on the specified IP and port');
      console.log('2. Ensure your mobile device is on the same network');
      console.log('3. Run: npx expo start');
      console.log('4. Test the connection by uploading a memory');
      console.log('');
      console.log('🔍 Troubleshooting:');
      console.log('- Check if backend is accessible: curl ' + finalUrl + '/memories');
      console.log('- Verify firewall settings on backend machine');
      console.log('- Ensure both devices are on same WiFi network');
      
    } catch (error) {
      console.log('❌ Error updating configuration:', error.message);
    }
    
    rl.close();
  });
});

rl.on('close', () => {
  console.log('');
  console.log('👋 Setup complete!');
  process.exit(0);
});