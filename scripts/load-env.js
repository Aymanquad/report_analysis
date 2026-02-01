const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '../src/environments/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse .env file
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Generate environment.ts
const envTsContent = `export const environment = {
  production: false,
  openaiApiKey: '${envVars.OPENAI_API_KEY || ''}',
  mailjetApiKey: '${envVars.MAILJET_API_KEY || ''}',
  mailjetSecretKey: '${envVars.MAILJET_SECRET_KEY || ''}',
  mailjetFromEmail: '${envVars.MAILJET_FROM_EMAIL || ''}',
  mailjetFromName: '${envVars.MAILJET_FROM_NAME || 'Business Report Generator'}',
  apiUrl: '${envVars.API_URL || 'http://localhost:3000'}'
};
`;

// Generate environment.prod.ts
const envProdTsContent = `export const environment = {
  production: true,
  openaiApiKey: '${envVars.OPENAI_API_KEY || ''}',
  mailjetApiKey: '${envVars.MAILJET_API_KEY || ''}',
  mailjetSecretKey: '${envVars.MAILJET_SECRET_KEY || ''}',
  mailjetFromEmail: '${envVars.MAILJET_FROM_EMAIL || ''}',
  mailjetFromName: '${envVars.MAILJET_FROM_NAME || 'Business Report Generator'}',
  apiUrl: '${envVars.API_URL || 'http://localhost:3000'}'
};
`;

// Write environment files
fs.writeFileSync(
  path.join(__dirname, '../src/environments/environment.ts'),
  envTsContent
);

fs.writeFileSync(
  path.join(__dirname, '../src/environments/environment.prod.ts'),
  envProdTsContent
);

console.log('Environment files generated successfully!');

