# Environment Configuration Guide

## Overview
The PayRise Admin application uses environment variables to configure the API endpoints and environment mode. These are loaded from `.env` files using Vite's built-in environment variable support.

## Environment Variables

### `VITE_APP_ENVIRONMENT`
- **Type**: `string`
- **Options**: `development`, `TEST`, `LIVE`
- **Description**: Determines which base URL to use for API requests
- **Default**: `development`

### `VITE_APP_BASE_URL_TEST`
- **Type**: `string` (URL)
- **Description**: API endpoint for development/testing environment
- **Default**: `http://localhost:8082`

### `VITE_APP_BASE_URL_LIVE`
- **Type**: `string` (URL)
- **Description**: API endpoint for production environment
- **Default**: `http://localhost:8082`

## Files

- **`.env`** - Your local environment configuration (not tracked in git)
- **`.env.example`** - Template showing required variables (tracked in git)
- **`.env.development`** - Development environment defaults
- **`.env.production`** - Production environment defaults

## Setup Instructions

### 1. Initial Setup
```bash
cp .env.example .env
```

### 2. Configure for Your Environment
Edit `.env` and set the appropriate values:

```env
VITE_APP_ENVIRONMENT=development
VITE_APP_BASE_URL_TEST=http://localhost:8082
VITE_APP_BASE_URL_LIVE=https://api.payrise.com
```

### 3. Running the Application

**Development**:
```bash
npm run dev
```
This automatically loads `.env.development` + `.env` overrides.

**Production Build**:
```bash
npm run build
```
This uses `.env.production` + `.env` overrides.

## How It Works

1. Vite loads environment files in this order (later overwrites earlier):
   - `.env` (all environments)
   - `.env.{mode}` (environment-specific)

2. Environment variables are injected at build time
3. Access them in code via `import.meta.env.VITE_*`

## Environment Selection

The app determines which API URL to use based on `VITE_APP_ENVIRONMENT`:
- Set to `TEST` or `LIVE` to match the key in the baseUrls object
- Defaults to using TEST URL if environment doesn't match a key

## Adding New Variables

To add new environment variables:

1. Define in `.env.example` with description
2. Add to `.env.development` and `.env.production` with defaults
3. Use in code: `import.meta.env.VITE_YOUR_VAR_NAME`

**Important**: Only variables prefixed with `VITE_` are exposed to the client!
