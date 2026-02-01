# Quick Start Guide

## Fixed Issues

✅ **CORS Error Fixed**: Created a backend server to handle Mailjet API calls (avoids CORS issues)
✅ **PDF Download Removed**: PDFs are now sent via email only (no automatic download)
✅ **Environment Variables**: All API keys are loaded from `.env` file securely

## Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure `.env` file**
   - Make sure `src/environments/.env` exists with:
     ```
     OPENAI_API_KEY=your_key_here
     MAILJET_API_KEY=your_key_here
     MAILJET_SECRET_KEY=your_key_here
     MAILJET_FROM_EMAIL=your_email@example.com
     MAILJET_FROM_NAME=Business Report Generator
     ```

3. **Run the Application**
   
   **Easiest way (runs both servers):**
   ```bash
   npm run dev
   ```
   
   This starts:
   - Backend server on `http://localhost:3000`
   - Angular app on `http://localhost:4200`

   **Or run separately:**
   ```bash
   # Terminal 1
   npm run server
   
   # Terminal 2
   npm start
   ```

## How It Works Now

1. User enters business details in the text field
2. User fills in their contact information (email, phone, name, company)
3. System generates AI report using OpenAI
4. System creates PDF from the report
5. **PDF is sent to user's email via Mailjet** (no download)
6. Success message is shown

## Troubleshooting

- **CORS Error**: Make sure the backend server is running on port 3000
- **Email Not Sending**: Check that Mailjet API keys are correct in `.env` file
- **Backend Not Starting**: Make sure all dependencies are installed (`npm install`)

