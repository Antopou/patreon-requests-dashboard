# Google OAuth Setup Guide

Follow these steps to set up Google OAuth for the Colab integration:

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Drive API
   - Google Colab API (if available)
   - Google Sheets API

## 2. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Add these **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## 3. Update Environment Variables

Update your `.env.local` file:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-key
```

## 4. Generate NEXTAUTH_SECRET

Run this command to generate a secret:
```bash
openssl rand -base64 32
```

## 5. Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:3000`
3. Scroll down to the "🤖 AI Training Tools" section
4. Click "Sign in with Google"
5. Select a Colab notebook and click "Open in Google Colab"

## Features

✅ **Google OAuth Login** - Secure authentication with your Google account
✅ **Colab Integration** - Direct access to Dataset Maker and LoRA Trainer
✅ **Auto-authentication** - Pass your Google session to Colab
✅ **Tool Selection** - Choose between Dataset Maker and LoRA Trainer

## How It Works

1. **Sign In**: Users sign in with their Google account
2. **Select Tool**: Choose between Dataset Maker or LoRA Trainer
3. **Open Colab**: The selected notebook opens in a new tab with authentication
4. **Train Models**: Use the notebooks to create datasets and train LoRA models

## Notes

- You need sufficient GPU credits in Colab for training
- The Colab notebooks will open with your Google account already authenticated
- Make sure your Google Cloud project has the necessary APIs enabled
- For production deployment, update the NEXTAUTH_URL to your production domain
