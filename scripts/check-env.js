// Check environment variables (without exposing sensitive data)
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking environment files...\n');

const envFiles = ['.env.local', '.env'];
let foundFiles = [];

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    foundFiles.push(file);
    console.log(`✅ Found: ${file}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.trim().startsWith('DATABASE_URL=')) {
        const url = line.split('=')[1]?.trim().replace(/^["']|["']$/g, '');
        if (url) {
          try {
            const parsed = new URL(url);
            console.log(`\n📋 DATABASE_URL in ${file}:`);
            console.log(`   Protocol: ${parsed.protocol}`);
            console.log(`   Host: ${parsed.hostname}`);
            console.log(`   Port: ${parsed.port || '5432 (default)'}`);
            console.log(`   Username: ${parsed.username}`);
            console.log(`   Database: ${parsed.pathname.slice(1)}`);
            console.log(`   Password: ${parsed.password ? '***' + parsed.password.slice(-2) : 'NOT SET'}`);
            
            // Check for placeholder values
            if (parsed.username === 'username' || parsed.username === 'user') {
              console.log(`\n⚠️  WARNING: Username appears to be a placeholder!`);
              console.log(`   You need to replace '${parsed.username}' with your actual PostgreSQL username`);
            }
            
            if (!parsed.password || parsed.password === 'password') {
              console.log(`\n⚠️  WARNING: Password appears to be missing or a placeholder!`);
              console.log(`   You need to set your actual PostgreSQL password`);
            }
          } catch (e) {
            console.log(`\n❌ Invalid DATABASE_URL format in ${file}`);
          }
        }
      }
    });
  }
});

if (foundFiles.length === 0) {
  console.log('❌ No .env files found!');
  console.log('\n💡 Create a .env.local or .env file with:');
  console.log('   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/internly?schema=public"');
} else {
  console.log('\n📝 To fix:');
  console.log('1. Open your .env.local or .env file');
  console.log('2. Replace the username and password with your actual PostgreSQL credentials');
  console.log('3. Common format: postgresql://postgres:YOUR_PASSWORD@localhost:5432/internly?schema=public');
  console.log('4. Restart your dev server');
}
