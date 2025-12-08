---
sidebar_position: 4
---

# Getting Started

This guide will help you get up and running with the Node OData Framework quickly.

## Overview

The Node OData Framework provides **two powerful integration approaches** to suit different application architectures:

### 1. **ExpressRouter** - Complete Express.js Solution

A fully-managed solution for OData application. The framework automatically:

- Registers all OData endpoints based on your controllers
- Sets up the `$metadata` endpoint for API discovery
- Handles request parsing and response formatting
- Manages error handling and logging

**Best for:** When you want minimal setup and easy integration with the complete solution

👉 **[Complete Express.js Guide](./express-getting-started.md)**

### 2. **OpenRouter** - Framework-Agnostic Solution

A flexible, low-level solution that integrates with any Node.js framework or serverless environment. You have full control over:

- Route registration and endpoint paths
- Request/response handling
- Middleware integration
- Custom authentication and authorization

**Best for:** When you need maximum flexibility and control over the application

👉 **[Next.js Getting Started Guide](./nextjs-getting-started.md)**
👉 **[Serverless Getting Started Guide](./serverless-getting-started.md)**

---

## Quick Comparison

| Feature                | ExpressRouter                         | OpenRouter                             |
| ---------------------- | ------------------------------------- | -------------------------------------- |
| **Setup Complexity**   | Simple - automatic route registration | Moderate - manual route setup          |
| **Framework Support**  | Express.js only                       | Any framework (Next.js, Fastify, etc.) |
| **Serverless Support** | ❌ No                                 | ✅ Yes                                 |
| **Metadata Endpoint**  | ✅ Automatic                          | Manual setup required                  |
| **Custom Controllers** | ✅ Yes                                | ❌ No (direct model querying)          |
| **Middleware Control** | Limited                               | Full control                           |
| **Best Use Case**      | Minimal setup and Easy integration    | When need maximum flexibility          |
