# CI Pipeline Overview

This repository uses **GitHub Actions** to run a Continuous Integration (CI) pipeline for a Next.js application with Prisma and PostgreSQL.

---

## CI Tool Used

- **GitHub Actions**  
  The pipeline automates linting, type checking, testing, and building on specific branches to ensure quality and stability.

---

## Tasks Implemented in the Pipeline

### **1. Linting & Formatting**
- Runs **ESLint** to ensure code quality.
- Runs **Prettier** in check mode to maintain consistent formatting.

### **2. Type Checking**
- Uses TypeScript (`tsc`) to validate type correctness.

### **3. Testing**
- Installs dependencies with `npm ci`.
- Applies Prisma migrations using `npx prisma migrate deploy`.
- Runs Jest unit tests.

### **4. Build**
- Builds the Next.js application to ensure it compiles without errors.

Each job depends on the previous job to ensure early failure detection.

---

## How to Trigger the Pipeline

### Push to the `onboarding` branch
```yaml
on:
  push:
    branches:
      - onboarding
