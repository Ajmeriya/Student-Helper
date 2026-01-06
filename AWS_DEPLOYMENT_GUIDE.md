# AWS Free Tier Deployment Guide

This guide will help you deploy the Student Helper application on AWS using free tier services.

## 🎯 Architecture Overview

- **Frontend**: AWS Amplify (Free Tier)
- **Backend**: AWS Elastic Beanstalk (Free Tier)
- **Database**: AWS RDS MySQL (Free Tier - 750 hours/month)
- **Storage**: Cloudinary (Free Tier)
- **Domain**: Route 53 (Optional, ~$0.50/month)

## 📋 Prerequisites

1. AWS Account (Free Tier eligible)
2. AWS CLI installed and configured
3. Git repository with your code
4. Cloudinary account (for image storage)

## 🚀 Step 1: Prepare Backend for Deployment

### 1.1 Update application.properties

Ensure your `backend-spring/src/main/resources/application.properties` uses environment variables:

```properties
server.port=${SERVER_PORT:5000}
spring.datasource.url=jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT:3306}/${MYSQL_DATABASE}
spring.datasource.username=${MYSQL_USERNAME}
spring.datasource.password=${MYSQL_PASSWORD}
spring.jpa.hibernate.ddl-auto=${HIBERNATE_DDL_AUTO:update}
jwt.secret=${JWT_SECRET}
cloudinary.cloud_name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api_key=${CLOUDINARY_API_KEY}
cloudinary.api_secret=${CLOUDINARY_API_SECRET}
cors.allowed-origins=${CORS_ALLOWED_ORIGINS}
```

### 1.2 Create .ebextensions for Elastic Beanstalk

Create `backend-spring/.ebextensions/environment.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    SERVER_PORT: '5000'
    SPRING_PROFILES_ACTIVE: 'production'
  aws:elasticbeanstalk:container:java:
    JVMOptions: '-Xmx512m -Xms256m'
```

## 🗄️ Step 2: Setup RDS MySQL Database

### 2.1 Create RDS Instance

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose:
   - **Engine**: MySQL
   - **Version**: 8.0
   - **Template**: Free tier
   - **DB Instance Identifier**: student-helper-db
   - **Master Username**: admin
   - **Master Password**: [Choose strong password]
   - **DB Instance Class**: db.t2.micro (Free Tier)
   - **Storage**: 20 GB (Free Tier)
   - **Public Access**: Yes (for Elastic Beanstalk)
   - **VPC Security Group**: Create new
   - **Database Name**: Student_Helper

### 2.2 Configure Security Group

1. Go to EC2 → Security Groups
2. Find your RDS security group
3. Add inbound rule:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: Your Elastic Beanstalk security group

## 🔧 Step 3: Deploy Backend to Elastic Beanstalk

### 3.1 Install EB CLI

```bash
pip install awsebcli
```

### 3.2 Initialize Elastic Beanstalk

```bash
cd backend-spring
eb init -p java-17 student-helper-backend --region us-east-1
```

### 3.3 Create Environment

```bash
eb create student-helper-env \
  --instance-type t2.micro \
  --platform "Java 17" \
  --envvars \
    SERVER_PORT=5000,\
    MYSQL_HOST=[RDS_ENDPOINT],\
    MYSQL_PORT=3306,\
    MYSQL_DATABASE=Student_Helper,\
    MYSQL_USERNAME=admin,\
    MYSQL_PASSWORD=[YOUR_PASSWORD],\
    HIBERNATE_DDL_AUTO=update,\
    JWT_SECRET=[GENERATE_SECRET],\
    CLOUDINARY_CLOUD_NAME=[YOUR_CLOUD_NAME],\
    CLOUDINARY_API_KEY=[YOUR_API_KEY],\
    CLOUDINARY_API_SECRET=[YOUR_API_SECRET],\
    CORS_ALLOWED_ORIGINS=[FRONTEND_URL]
```

### 3.4 Deploy

```bash
eb deploy
```

### 3.5 Get Backend URL

```bash
eb status
```

Save the CNAME URL (e.g., `student-helper-env.eba-xxxxx.us-east-1.elasticbeanstalk.com`)

## 🎨 Step 4: Deploy Frontend to AWS Amplify

### 4.1 Prepare Frontend

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com/api
```

### 4.2 Deploy via Amplify Console

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your Git repository
4. Configure build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

5. Add environment variables:
   - `VITE_API_BASE_URL`: Your backend URL

6. Deploy

### 4.3 Alternative: Deploy via CLI

```bash
cd frontend
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

## 🔐 Step 5: Security Configuration

### 5.1 Update CORS

Update backend environment variable:
```
CORS_ALLOWED_ORIGINS=https://your-amplify-url.amplifyapp.com
```

### 5.2 Update Frontend API URL

Update Amplify environment variable:
```
VITE_API_BASE_URL=https://your-backend-url.elasticbeanstalk.com/api
```

## 📊 Step 6: Monitoring & Health Checks

### 6.1 Backend Health Check

Your backend has a health endpoint at `/api/health`

### 6.2 CloudWatch Logs

- Backend logs: Elastic Beanstalk → Logs
- Frontend logs: Amplify → App settings → Logs

## 💰 Cost Estimation (Free Tier)

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| RDS MySQL | 750 hours | $0 |
| Elastic Beanstalk | 750 hours | $0 |
| Amplify | 5 GB storage, 15 GB transfer | $0 |
| CloudWatch | 5 GB logs | $0 |
| **Total** | | **$0** |

## 🔄 Step 7: Continuous Deployment

### 7.1 Backend Auto-Deploy

Elastic Beanstalk automatically deploys on `eb deploy` or Git push (if configured)

### 7.2 Frontend Auto-Deploy

Amplify automatically deploys on Git push to main branch

## 🐛 Troubleshooting

### Backend Issues

1. Check Elastic Beanstalk logs:
   ```bash
   eb logs
   ```

2. Check RDS connectivity:
   - Verify security groups
   - Check RDS endpoint in environment variables

### Frontend Issues

1. Check Amplify build logs
2. Verify environment variables
3. Check browser console for CORS errors

## 📝 Environment Variables Summary

### Backend (Elastic Beanstalk)
```
SERVER_PORT=5000
MYSQL_HOST=[RDS_ENDPOINT]
MYSQL_PORT=3306
MYSQL_DATABASE=Student_Helper
MYSQL_USERNAME=admin
MYSQL_PASSWORD=[PASSWORD]
HIBERNATE_DDL_AUTO=update
JWT_SECRET=[64_CHAR_SECRET]
CLOUDINARY_CLOUD_NAME=[CLOUD_NAME]
CLOUDINARY_API_KEY=[API_KEY]
CLOUDINARY_API_SECRET=[API_SECRET]
CORS_ALLOWED_ORIGINS=[FRONTEND_URL]
PAYMENT_MODE=dummy
```

### Frontend (Amplify)
```
VITE_API_BASE_URL=https://[BACKEND_URL]/api
```

## ✅ Post-Deployment Checklist

- [ ] Backend health check passes
- [ ] Frontend loads correctly
- [ ] Database connection works
- [ ] User registration/login works
- [ ] Image uploads work (Cloudinary)
- [ ] CORS configured correctly
- [ ] HTTPS enabled (Amplify default)
- [ ] Environment variables set
- [ ] Logs accessible

## 🎉 Success!

Your application is now deployed on AWS Free Tier!

**Backend URL**: `https://your-backend.elasticbeanstalk.com`  
**Frontend URL**: `https://your-app.amplifyapp.com`
