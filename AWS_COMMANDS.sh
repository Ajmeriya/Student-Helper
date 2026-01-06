# AWS Deployment - Quick Start Commands

# This file contains all the commands you need to deploy to AWS
# Copy and paste these commands one by one

# ============================================
# STEP 1: Install Required Tools
# ============================================

# Install AWS CLI (Run PowerShell as Administrator)
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
# Or run:
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify AWS CLI
aws --version

# Install EB CLI
pip install awsebcli

# Verify EB CLI
eb --version


# ============================================
# STEP 2: Configure AWS Credentials
# ============================================

# Get credentials from: https://console.aws.amazon.com/iam/
# Your Name → Security Credentials → Create Access Key

aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region: ap-south-1 (or your preferred region)
# - Default output format: json


# ============================================
# STEP 3: Generate JWT Secret
# ============================================

# Generate a secure JWT secret (copy the output)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"


# ============================================
# STEP 4: Deploy Backend to Elastic Beanstalk
# ============================================

# Navigate to backend folder
cd backend

# Initialize Elastic Beanstalk
eb init

# Select:
# - Region: ap-south-1 (or your choice)
# - Create new application: student-helper-backend
# - Platform: Node.js
# - Platform branch: Node.js 18
# - CodeCommit: No
# - SSH: Yes

# Create environment and deploy
eb create student-helper-prod

# Wait 10-15 minutes...

# Set environment variables (IMPORTANT!)
eb setenv MONGODB_URI="your_mongodb_connection_string" JWT_SECRET="your_generated_secret" CLOUDINARY_CLOUD_NAME="your_cloud_name" CLOUDINARY_API_KEY="your_api_key" CLOUDINARY_API_SECRET="your_api_secret" NODE_ENV="production" PORT="8080" FRONTEND_URL="https://your-frontend-url.com"

# Get your backend URL
eb status

# Open in browser to test
eb open


# ============================================
# STEP 5: Deploy Frontend to S3
# ============================================

# Navigate to frontend folder
cd ../frontend

# Update .env.production with your backend URL
# VITE_API_BASE_URL=http://your-backend-url.elasticbeanstalk.com/api

# Build production bundle
npm install
npm run build

# Create S3 bucket (change bucket name if taken)
aws s3 mb s3://student-helper-frontend --region ap-south-1

# Enable static website hosting
aws s3 website s3://student-helper-frontend --index-document index.html --error-document index.html

# Apply bucket policy
cd ..
aws s3api put-bucket-policy --bucket student-helper-frontend --policy file://s3-bucket-policy.json

# Upload files to S3
cd frontend
aws s3 sync dist/ s3://student-helper-frontend --delete

# Your S3 URL: http://student-helper-frontend.s3-website.ap-south-1.amazonaws.com


# ============================================
# STEP 6: Create CloudFront Distribution
# ============================================

# Go to AWS Console: https://console.aws.amazon.com/cloudfront/
# Follow the guide in AWS_DEPLOYMENT_GUIDE.md
# This takes 15-20 minutes to provision


# ============================================
# STEP 7: Update Backend CORS
# ============================================

# After frontend is deployed, update backend FRONTEND_URL
cd backend
eb setenv FRONTEND_URL="https://your-cloudfront-url.cloudfront.net"


# ============================================
# USEFUL COMMANDS
# ============================================

# View backend logs
eb logs

# SSH into backend server
eb ssh

# Deploy backend updates
eb deploy

# Terminate environment (to save costs)
eb terminate

# Upload frontend updates
cd frontend
npm run build
aws s3 sync dist/ s3://student-helper-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"


# ============================================
# COST MONITORING
# ============================================

# Check current costs
aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-01-31 --granularity MONTHLY --metrics BlendedCost

# Set up billing alerts in AWS Console:
# https://console.aws.amazon.com/billing/


# ============================================
# TROUBLESHOOTING
# ============================================

# If backend deployment fails:
eb logs
eb health
eb status

# If frontend not loading:
# Check S3 bucket policy is public
# Check CloudFront error pages configured
# Check CORS in backend

# Database connection issues:
# MongoDB Atlas → Network Access → Add IP: 0.0.0.0/0


# ============================================
# GITHUB SECRETS (for CI/CD)
# ============================================

# Add these secrets in GitHub: Settings → Secrets and Variables → Actions
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_REGION (e.g., ap-south-1)
# - VITE_API_BASE_URL
# - S3_BUCKET_NAME (e.g., student-helper-frontend)
# - CLOUDFRONT_DISTRIBUTION_ID


# ============================================
# MONITORING
# ============================================

# CloudWatch dashboard:
# https://console.aws.amazon.com/cloudwatch/

# Elastic Beanstalk dashboard:
# https://console.aws.amazon.com/elasticbeanstalk/

# S3 bucket metrics:
# https://s3.console.aws.amazon.com/s3/buckets/student-helper-frontend?tab=metrics


# ============================================
# ALL DONE! 🎉
# ============================================

# Your application is now live on AWS!
# Frontend: https://your-cloudfront-url.cloudfront.net
# Backend: http://your-app.elasticbeanstalk.com
