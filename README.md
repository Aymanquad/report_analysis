# Business Report Generator

An Angular application that generates AI-powered business reports and sends them via email.

## Features

- Simple text input for business requirements
- User details collection modal (name, email, phone, company)
- OpenAI integration for report generation
- PDF generation and email delivery
- Beautiful, modern UI with smooth animations

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   - Create a `.env` file in `src/environments/` folder (or copy from `.env.example`)
   - Add your API keys:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     MAILJET_API_KEY=your_mailjet_api_key_here
     MAILJET_SECRET_KEY=your_mailjet_secret_key_here
     MAILJET_FROM_EMAIL=your_email@example.com
     MAILJET_FROM_NAME=Business Report Generator
     ```
   - The environment files will be automatically generated when you run `npm start` or `npm run build`

3. **Get Mailjet API Keys** (Free Version)
   - Sign up at [Mailjet](https://www.mailjet.com/) (free tier available)
   - Go to Account Settings > API Keys
   - Copy your API Key and Secret Key
   - Add them to your `.env` file
   - Make sure your sender email is verified in Mailjet

4. **Run the Application**

   **Option 1: Run both servers together (Recommended)**
   ```bash
   npm run dev
   ```
   This will start both the backend server (port 3000) and Angular dev server (port 4200)

   **Option 2: Run servers separately**
   
   Terminal 1 - Backend Server:
   ```bash
   npm run server
   ```
   
   Terminal 2 - Angular App:
   ```bash
   npm start
   ```

   The Angular app will be available at `http://localhost:4200`
   The backend API will be available at `http://localhost:3000`

## Important Notes

- **Environment Variables**: All API keys are stored in `src/environments/.env` file which is automatically excluded from git. Never commit your `.env` file!

- **Backend Server**: The application now uses a backend server (Express.js) to handle email sending via Mailjet. This solves CORS issues and keeps API keys secure. The backend server must be running for email functionality to work.

- **Mailjet Setup**: 
  - The free tier of Mailjet allows 200 emails per day
  - Make sure to verify your sender email address in Mailjet dashboard
  - The email will be sent with the PDF attachment automatically (no download)

- **OpenAI API Key**: Make sure to add your OpenAI API key in the `.env` file. The environment files are auto-generated from `.env` when you run the app.

- **Security**: API keys are now stored securely on the backend server and not exposed to the browser.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── user-details-modal/
│   │       ├── user-details-modal.component.ts
│   │       ├── user-details-modal.component.html
│   │       └── user-details-modal.component.css
│   ├── services/
│   │   └── report.service.ts
│   ├── app.component.ts
│   ├── app.component.html
│   └── app.component.css
├── styles.css
└── main.ts
```

## Technologies Used

- Angular 17
- OpenAI API
- jsPDF for PDF generation
- TypeScript
- CSS3 with animations

