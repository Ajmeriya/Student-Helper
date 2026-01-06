# 🚀 AWS Deployment - Step-by-Step Instructions

Follow these steps exactly. I'll help you through each one.

## STEP 1: Install AWS CLI ⏳ (5 minutes)

### Download and Install:
1. Download AWS CLI installer for Windows:
   https://awscli.amazonaws.com/AWSCLIV2.msi

2. Run the installer (double-click the downloaded file)
3. Follow the installation wizard (keep default settings)
4. Close and reopen your terminal/VS Code after installation

### Verify Installation:
```powershell
aws --version
# Should show: aws-cli/2.x.x
```

---

## STEP 2: Install EB CLI ⏳ (2 minutes)

```powershell
pip install awsebcli
```

### Verify Installation:
```powershell
eb --version
# Should show: EB CLI 3.x.x
```

---

## STEP 3: Get AWS Account Credentials ⏳ (5 minutes)

### If you don't have an AWS account:
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process
4. Verify your email and add payment method (free tier available)

### Get Your Access Keys:
1. Log into AWS Console: https://console.aws.amazon.com/
2. Click your name (top right) → **Security Credentials**
3. Scroll to **Access Keys** section
4. Click **Create Access Key**
5. Choose **Command Line Interface (CLI)**
6. Check the confirmation box
7. Click **Create Access Key**
8. **IMPORTANT**: Download the .csv file or copy both keys
   - AWS Access Key ID: AKIA...
   - AWS Secret Access Key: (long secret string)

---

## STEP 4: Configure AWS CLI ⏳ (2 minutes)

Run this command and enter your credentials:
```powershell
aws configure
```

You'll be asked for:
- **AWS Access Key ID**: [Paste from Step 3]
- **AWS Secret Access Key**: [Paste from Step 3]
- **Default region name**: `ap-south-1` (or your preferred region)
- **Default output format**: `json`

---

## STEP 5: Create Environment Variables ⏳ (5 minutes)

I'll help you create the .env file with your actual credentials.

You'll need:
1. **MongoDB Atlas URI** - From your MongoDB Atlas dashboard
2. **Cloudinary credentials** - From Cloudinary console
3. **JWT Secret** - We'll generate this

---

## Ready to Continue?

Once you've completed Steps 1-4, let me know and I'll help you with:
- Creating the .env file
- Deploying the backend
- Deploying the frontend
- Testing everything

**Current Step**: Install AWS CLI from the link above, then tell me when done! 👍
