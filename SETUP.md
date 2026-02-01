# Setup Guide

## Environment Variables Setup

1. **Create `.env` file** in `src/environments/` folder:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   MAILJET_API_KEY=your_mailjet_api_key_here
   MAILJET_SECRET_KEY=your_mailjet_secret_key_here
   MAILJET_FROM_EMAIL=your_email@example.com
   MAILJET_FROM_NAME=Business Report Generator
   ```

2. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Add it to your `.env` file

3. **Get Mailjet API Keys** (Free Version):
   - Sign up at https://www.mailjet.com/ (free tier: 200 emails/day)
   - Go to Account Settings > API Keys
   - Copy your **API Key** and **Secret Key**
   - Add them to your `.env` file
   - **Important**: Verify your sender email in Mailjet dashboard under Sender Addresses

## Important Notes

- The `.env` file is automatically excluded from git (see `.gitignore`)
- Environment files (`environment.ts` and `environment.prod.ts`) are auto-generated from `.env` when you run `npm start` or `npm run build`
- Never commit your `.env` file to version control!

## Running the Application

```bash
npm install
npm start
```

The app will automatically load your `.env` variables and be available at `http://localhost:4200`

