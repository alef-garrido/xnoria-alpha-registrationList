import 'dotenv/config';
import bcrypt from 'bcrypt';

async function test() {
  const testPassword = 'admin123';
  const storedHash = '$2b$12$wD7aHVHOb8vJSvPsa5tNGOa9H0GPPx3OjedNM3AiG6EIiqn56DRjK';
  
  console.log('Testing password verification...');
  console.log('Test password:', testPassword);
  console.log('Stored hash:', storedHash);
  
  const isValid = await bcrypt.compare(testPassword, storedHash);
  console.log('Password matches:', isValid);
}

test().catch(console.error);
