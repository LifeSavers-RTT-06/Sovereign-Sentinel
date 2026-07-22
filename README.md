# Sovereign Sentinel (PrepTrack)

> **AWS Serverless Emergency Supply Tracking Application**  
> *A multi-tenant, event-driven web application featuring three-layer security, IDOR resistance, and zero-trust user data isolation.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-lifesavers.base44.app-blue?style=flat&logo=amazon-aws)](https://lifesavers.base44.app/)
[![AWS Architecture](https://img.shields.io/badge/AWS-Serverless-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![Security](https://img.shields.io/badge/Security-IDOR_Protected-green)](#-security--hardening-architecture)

---

## 📌 Executive Summary

**Sovereign Sentinel** is a serverless AWS emergency supply tracking application designed to enforce strict multi-tenant data isolation. Built as an AWS re/Start capstone project, the system implements defense-in-depth across the network, identity, and authorization layers to guarantee that user data remains isolated at scale.

---

## 🛠️ System Architecture

![Sovereign Sentinel Architecture](./Architecture_Diagrams/Architecture_ss.png)

* **Frontend:** Mobile-first static application hosted on **Amazon S3** and delivered globally via **Amazon CloudFront** over HTTPS.
* **Authentication & Identity:** **Amazon Cognito User Pools** handling user signup, email verification, JWT session token generation, and identity federation.
* **API Routing:** **Amazon API Gateway** protected by a **Cognito Authorizer**, enforcing token validity at the edge and blocking unauthenticated traffic (401 Unauthorized) before backend execution.
* **Compute & Logic:** **AWS Lambda** functions handling core CRUD operations, JSON serialization, and dynamic payload parsing.
* **Storage Tier:** **Amazon DynamoDB** (`SS_Supplies` table) using composite partition/sort keys (`userId` + `itemId`) mapped directly to Cognito UUIDs.
* **Alerting & Automation:** **Amazon EventBridge** daily cron triggers firing automated supply expiration scans, routing alerts via per-user **Amazon SNS** topics.

---

## 🛡️ Security & Hardening Architecture

### 1. IDOR Prevention Pattern
Rather than relying on client-supplied parameters in request bodies or query strings, backend Lambda functions extract identity exclusively from validated Cognito JWT claims:
```javascript
// Extracting user identity directly from verified JWT claim
const userId = event.requestContext.authorizer.claims.sub;
