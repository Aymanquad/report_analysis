const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Use node-fetch for compatibility (works with all Node versions)
const fetch = require('node-fetch');

// Import OpenAI
const OpenAI = require('openai');

// Load .env file from src/environments/.env
const envPath = path.join(__dirname, 'src/environments/.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('Environment variables loaded from', envPath);
} else {
  console.warn('Warning: .env file not found at', envPath);
  console.warn('Make sure to create src/environments/.env with your API keys');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize OpenAI with API key from .env
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  console.log('OpenAI initialized successfully');
} else {
  console.warn('Warning: OPENAI_API_KEY not found in .env');
}

// Generate report endpoint
app.post('/api/generate-report', async (req, res) => {
  try {
    const { name, companyName, userInput } = req.body;

    if (!name || !companyName || !userInput) {
      return res.status(400).json({ error: 'Missing required fields: name, companyName, userInput' });
    }

    if (!openai) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const prompt = `Create a comprehensive business report for ${name} from ${companyName}. 
    
Based on the following information provided by the user:
${userInput}

Please create a professional business report that includes:
1. Executive Summary
2. Business Analysis
3. Recommendations
4. Strategic Insights
5. Action Items

Make it detailed, professional, and tailored to their specific business needs.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional business analyst who creates comprehensive, insightful business reports.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const reportContent = completion.choices[0]?.message?.content || 'Report generation failed.';
      
      res.json({ 
        success: true, 
        report: reportContent 
      });
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      
      // Generate fallback report
      const fallbackReport = `
BUSINESS REPORT

Prepared for: ${name}
Company: ${companyName}
Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
This report has been prepared based on the information provided: ${userInput}

BUSINESS ANALYSIS
Based on the details provided, we recommend conducting a thorough analysis of your business operations, market position, and growth opportunities.

RECOMMENDATIONS
1. Review current business processes
2. Identify areas for improvement
3. Develop strategic initiatives
4. Monitor key performance indicators

STRATEGIC INSIGHTS
Consider leveraging technology and data analytics to drive business growth and improve operational efficiency.

ACTION ITEMS
- Schedule a follow-up consultation
- Review and implement recommendations
- Track progress and adjust strategies as needed

Thank you for using our business report service.
      `;
      
      res.json({ 
        success: true, 
        report: fallbackReport,
        note: 'Fallback report generated due to API error'
      });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message
    });
  }
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { email, name, pdfBase64, fromEmail, fromName } = req.body;

    if (!email || !name || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get Mailjet credentials from environment
    const mailjetApiKey = process.env.MAILJET_API_KEY;
    const mailjetSecretKey = process.env.MAILJET_SECRET_KEY;
    const mailjetFromEmail = fromEmail || process.env.MAILJET_FROM_EMAIL;
    const mailjetFromName = fromName || process.env.MAILJET_FROM_NAME || 'Business Report Generator';

    if (!mailjetApiKey || !mailjetSecretKey || !mailjetFromEmail) {
      return res.status(500).json({ error: 'Mailjet configuration missing' });
    }

    // Prepare Mailjet email data
    const emailData = {
      Messages: [
        {
          From: {
            Email: mailjetFromEmail,
            Name: mailjetFromName
          },
          To: [
            {
              Email: email,
              Name: name
            }
          ],
          Subject: 'Your Business Report is Ready',
          TextPart: `Dear ${name},\n\nYour business report has been generated and is attached to this email.\n\nThank you for using our service!`,
          HTMLPart: `
            <h2>Your Business Report is Ready</h2>
            <p>Dear ${name},</p>
            <p>Your business report has been generated and is attached to this email.</p>
            <p>Thank you for using our service!</p>
          `,
          Attachments: [
            {
              ContentType: 'application/pdf',
              Filename: `business-report-${Date.now()}.pdf`,
              Base64Content: pdfBase64
            }
          ]
        }
      ]
    };

    // Send email via Mailjet API
    try {
      const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${mailjetApiKey}:${mailjetSecretKey}`).toString('base64')}`
        },
        body: JSON.stringify(emailData)
      });

      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        result = { message: text };
      }

      if (!response.ok) {
        console.error('Mailjet API error:', {
          status: response.status,
          statusText: response.statusText,
          result: result
        });
        return res.status(response.status).json({ 
          error: 'Failed to send email', 
          details: result,
          status: response.status
        });
      }

      // Validate Mailjet response - check if email was actually accepted
      // Mailjet returns: { Messages: [{ Status: 'success', To: [{ Email, MessageID }] }] }
      const mailjetSuccess = result && result.Messages && result.Messages.length > 0;
      const firstMessage = mailjetSuccess ? result.Messages[0] : null;
      const messageStatus = firstMessage ? firstMessage.Status : 'unknown';
      const messageId = firstMessage && firstMessage.To && firstMessage.To[0] 
        ? firstMessage.To[0].MessageID 
        : null;
      
      console.log('📧 Mailjet API Response:', JSON.stringify({
        email: email,
        status: messageStatus,
        messageId: messageId,
        hasMessages: !!result.Messages,
        messagesCount: result.Messages ? result.Messages.length : 0
      }, null, 2));

      // Check if Mailjet accepted the email
      if (!mailjetSuccess) {
        console.error('❌ Mailjet response missing Messages array:', result);
        return res.status(500).json({ 
          error: 'Invalid response from Mailjet', 
          details: result,
          message: 'Mailjet did not return a valid response. Please check your API keys and account status.'
        });
      }

      if (messageStatus !== 'success') {
        console.error('❌ Mailjet did not accept the email. Status:', messageStatus, 'Response:', result);
        return res.status(500).json({ 
          error: 'Email was not accepted by Mailjet', 
          details: result,
          status: messageStatus,
          message: 'Please check: 1) Sender email is verified in Mailjet, 2) API keys are correct, 3) Account is active'
        });
      }

      console.log('✅ Email accepted by Mailjet!', {
        email: email,
        messageId: messageId,
        status: messageStatus
      });
      
      res.json({ 
        success: true, 
        message: 'Email sent successfully', 
        result: result,
        messageId: messageId,
        note: 'Email may take a few minutes to arrive. Please check spam folder if not in inbox.'
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`);
    console.error(`\nPlease do one of the following:`);
    console.error(`1. Stop the process using port ${PORT}:`);
    console.error(`   Windows: netstat -ano | findstr :${PORT}`);
    console.error(`   Then: taskkill /PID <PID> /F`);
    console.error(`\n2. Or change the PORT in your .env file or environment variables\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

