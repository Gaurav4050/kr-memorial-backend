# K.R. Memorial Hospital - Credentials Guide

This guide explains where to get all the required credentials for the backend `.env` file.

---

## 1. **MongoDB URI**

### Environment Variable
```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/kr-memorial?retryWrites=true&w=majority
```

### Where to Get It
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in to your account
3. Create a new cluster or use an existing one
4. Click **"Connect"** button
5. Select **"Connect your application"**
6. Copy the connection string
7. Replace `<username>`, `<password>`, and `<cluster>` with your actual values

---

## 2. **JWT Secret**

### Environment Variable
```
JWT_SECRET=your_super_secret_jwt_key_here_change_this
```

### Where to Get It
- Generate a strong random string (at least 32 characters)
- Use an online tool: [Generate Random String](https://1password.com/password-generator/)
- Or run in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 3. **Admin Email & Password Hash**

### Environment Variables
```
ADMIN_EMAIL=admin@krmemorialhospital.com
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password_here
```

### Where to Get the Password Hash
1. Use [Bcrypt Online Generator](https://bcrypt-generator.com/)
2. Or install bcrypt locally: `npm install bcrypt`
3. Run this in Node.js:
   ```javascript
   const bcrypt = require('bcrypt');
   const password = 'your_password_here';
   const hashed = bcrypt.hashSync(password, 10);
   console.log(hashed);
   ```
4. Use the hashed output in your `.env` file

---

## 4. **Email Service (Gmail - Nodemailer)**

### Environment Variables
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password_here
EMAIL_FROM=K.R. Memorial Hospital <your_gmail@gmail.com>
```

### Where to Get Gmail App Password
1. Go to [Google Cloud Console](https://myaccount.google.com/apppasswords)
2. Make sure **2-Factor Authentication** is enabled on your Gmail account
3. Create a new **App Password** for "Mail" and "Windows Computer"
4. Google will generate a 16-character password
5. Use this password in `EMAIL_PASS` (remove spaces if any)

**Important:** Use an App Password, NOT your actual Gmail password

---

## 5. **Twilio (WhatsApp Notifications)**

### Environment Variables
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Where to Get Twilio Credentials
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up or log in
3. Find your **Account SID** and **Auth Token** in the dashboard
4. Copy both values to your `.env`
5. For WhatsApp, you'll need to:
   - Set up a Twilio WhatsApp Sandbox or Business Number
   - The `TWILIO_WHATSAPP_FROM` will be provided by Twilio

---

## 6. **Cloudinary (Doctor Image Upload)**

### Environment Variables
```
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Where to Get Cloudinary Credentials
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Sign up or log in
3. On the dashboard, you'll see:
   - **Cloud Name** - top of the page
   - **API Key** - in the Account Details section
   - **API Secret** - in the Account Details section
4. Copy all three values to your `.env`

**Important:** Keep `API_SECRET` confidential and never share it publicly

---

## 7. **Frontend URL (CORS)**

### Environment Variable
```
FRONTEND_URL=http://localhost:3000
```

### Values
- **Development:** `http://localhost:3000`
- **Production:** Your actual frontend domain (e.g., `https://krmemorialhospital.com`)

---

## Quick Setup Checklist

- [ ] MongoDB connection URI
- [ ] JWT Secret (generated)
- [ ] Admin email and bcrypt hashed password
- [ ] Gmail app password (with 2FA enabled)
- [ ] Twilio Account SID and Auth Token
- [ ] Cloudinary credentials (Cloud Name, API Key, API Secret)
- [ ] Frontend URL configured

---

## Security Tips

1. **Never commit `.env` file to Git** - Add it to `.gitignore`
2. **Use strong passwords** - Especially for admin and JWT secret
3. **Rotate credentials regularly** - Update API keys and tokens periodically
4. **Use different credentials for dev and prod** - Don't use production secrets in development
5. **Keep secrets secure** - Don't share `.env` file contents via email or chat

---

## Troubleshooting

### MongoDB Connection Failed
- Check username and password are URL-encoded
- Verify IP whitelist in MongoDB Atlas includes your current IP
- Ensure database name is correct

### Email Not Sending
- Verify 2FA is enabled on Gmail
- Check if App Password is correct (16 characters, no spaces)
- Ensure sender email matches `EMAIL_USER`

### Cloudinary Upload Issues
- Double-check Cloud Name spelling (case-sensitive)
- Verify API Key and Secret are correct
- Check folder permissions in Cloudinary dashboard

### Twilio WhatsApp Not Working
- Verify Twilio WhatsApp Sandbox is activated
- Check phone number format (include country code)
- Ensure Account SID and Auth Token are correct
