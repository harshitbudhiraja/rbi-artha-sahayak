# RBI Artha Sahayak

## Overview

**RBI Artha Sahayak** is a web application designed to provide financial assistance and insights to users, leveraging **Pro‑Databricks** for data processing and analytics. The platform aims to empower users with real‑time financial data, analytics dashboards, and tools to make informed decisions.

## Features

- **Real‑time Data Processing** using Databricks clusters.
- Interactive dashboards built with React and TypeScript.
- Secure API server (Node/Express) handling user requests.
- Integration with RBI data sources for compliance and reporting.
- Responsive UI with modern design aesthetics.

## Technology Stack

- **Frontend**: React, TypeScript, Vite (or Create‑React‑App), optional Tailwind CSS for styling.
- **Backend**: Node.js, TypeScript, Express (`server.ts`).
- **Data Platform**: Databricks (Pro‑Databricks) for ETL and analytics.
- **Version Control**: Git.
- **Deployment**: Docker (optional) or direct deployment to cloud platforms.

## Getting Started

### Prerequisites

- Node.js (>= 18)
- npm or yarn
- Access to a Databricks workspace (Pro‑Databricks) with appropriate credentials.

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/rbi-artha-sahayak.git
cd rbi-artha-sahayak

# Install dependencies
npm install
```

### Running the Development Server

```bash
# Start the backend server
npm run dev:server   # or `ts-node server.ts`

# Start the frontend (if using Vite)
npm run dev
```

The application will be available at `http://localhost:3000` (frontend) and the API at `http://localhost:5000` (backend).

## Configuration

Create a `.env` file in the project root with the following variables:

```dotenv
# Databricks configuration
DATABRICKS_HOST=https://<your-databricks-workspace>.cloud.databricks.com
DATABRICKS_TOKEN=your_databricks_token

# Server configuration
PORT=5000
```

## License

This project is licensed under the MIT License.

---

*For more detailed documentation, refer to the `docs/` directory (if present) or contact the development team.*
