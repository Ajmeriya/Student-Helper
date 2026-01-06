# AWS Deployment Checklist

Use this checklist to track your deployment progress.

## Prerequisites
- [ ] AWS Account created
- [ ] AWS CLI installed and configured
- [ ] EB CLI installed
- [ ] MongoDB Atlas database ready
- [ ] Cloudinary account configured
- [ ] Domain purchased (optional)

## Backend Deployment (Elastic Beanstalk)
- [ ] Navigate to backend folder
- [ ] Run `eb init` to initialize EB
- [ ] Run `eb create` to create environment
- [ ] Set environment variables with `eb setenv`
- [ ] Verify deployment with `eb open`
- [ ] Test API endpoints
- [ ] Configure HTTPS (optional)
- [ ] Save backend URL for frontend

## Frontend Deployment (S3 + CloudFront)
- [ ] Update `.env.production` with backend URL
- [ ] Build production bundle: `npm run build`
- [ ] Create S3 bucket
- [ ] Configure bucket for static hosting
- [ ] Apply public access policy
- [ ] Upload files to S3
- [ ] Test S3 website URL
- [ ] Create CloudFront distribution
- [ ] Configure error pages (403/404 → index.html)
- [ ] Wait for CloudFront deployment (~15-20 min)
- [ ] Test CloudFront URL

## Post-Deployment Configuration
- [ ] Update backend FRONTEND_URL with CloudFront URL
- [ ] Redeploy backend with `eb deploy`
- [ ] Test CORS between frontend and backend
- [ ] Configure custom domain (optional)
- [ ] Set up SSL certificates (optional)
- [ ] Configure DNS records (optional)

## Testing
- [ ] User registration works
- [ ] User login works
- [ ] Student dashboard loads
- [ ] Broker can add/edit PGs
- [ ] Hostel admin can manage hostels
- [ ] Image uploads work (Cloudinary)
- [ ] Map displays correctly
- [ ] Distance calculation works
- [ ] Marketplace functionality works
- [ ] Chat/messaging works
- [ ] Mobile responsive design works

## Monitoring & Security
- [ ] Set up CloudWatch alarms
- [ ] Configure billing alerts
- [ ] Enable CloudTrail logging
- [ ] Review security groups
- [ ] Enable WAF (optional)
- [ ] Set up backups
- [ ] Document environment variables

## GitHub CI/CD (Optional)
- [ ] Push code to GitHub
- [ ] Add GitHub Actions workflows
- [ ] Configure GitHub secrets
- [ ] Test automatic deployment
- [ ] Set up branch protection rules

## Cost Optimization
- [ ] Review free tier usage
- [ ] Set monthly budget alerts
- [ ] Consider reserved instances (after 1 year)
- [ ] Optimize CloudFront cache settings
- [ ] Review S3 storage classes
- [ ] Monitor EB auto-scaling

## Documentation
- [ ] Document environment variables
- [ ] Update README with deployment info
- [ ] Create runbook for common issues
- [ ] Document rollback procedures
- [ ] Share access with team members

## Final Steps
- [ ] Share application URL with stakeholders
- [ ] Monitor initial traffic and errors
- [ ] Set up error tracking (Sentry, optional)
- [ ] Plan for future AI integration
- [ ] Celebrate! 🎉

---

## Important URLs

**AWS Console**: https://console.aws.amazon.com/
**Backend URL**: _____________________________________
**Frontend URL**: _____________________________________
**CloudFront URL**: _____________________________________
**MongoDB Atlas**: https://cloud.mongodb.com/
**Cloudinary**: https://cloudinary.com/console

---

## Emergency Contacts

**AWS Support**: https://console.aws.amazon.com/support/
**MongoDB Support**: https://support.mongodb.com/
**Cloudinary Support**: https://support.cloudinary.com/

---

## Estimated Timeline

- Backend deployment: 15-20 minutes
- Frontend S3 setup: 5-10 minutes
- CloudFront distribution: 15-20 minutes
- Testing & configuration: 30-60 minutes
- **Total**: ~1.5-2 hours

---

## Notes

Add any deployment notes, issues encountered, or special configurations here:

_____________________________________________________________________

_____________________________________________________________________

_____________________________________________________________________
