# MakerDAO Keeper Alert

## Overview

This project contains an AWS Lambda function written in TypeScript that monitors MakerDAO jobs and sends a Discord alert if any job hasn't been worked for the past 10 consecutive blocks. The function uses the Serverless Framework for deployment and management.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started/)

## Setup

### 1. Clone the Repository

### 2. Install Serverless Framework

Install the Serverless Framework globally if you haven't already:

```bash
npm install -g serverless
```

### 3. Install Dependencies 

```bash
npm install ethers axios
npm install --save-dev @types/node @types/aws-lambda @types/axios
npm install --save-dev jest @types/jest ts-jest
```

### 5. Update Your Infura and Discord Webhook URL

In `src/handler.ts` and `serverless.yml` update the values accordingly.

### 6. Deploy

```bash
serverless deploy
```

If you encounter an issue setting up the credentials, please refer to: https://www.serverless.com/framework/docs/providers/aws/guide/credentials

### 6. Run the Tests

```bash
npm test
```
