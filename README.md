# Realtime Currency Exchange

This project aims to develop a Real-Time Notification System for a Fintech Application. The system uses currency exchange rates as event triggers. The backend periodically fetches exchange rates from `openexchangerates.org`, detects changes from previous rates, and sends real-time notifications to connected client applications.

## Setup

This project is an Nx integrated monorepo containing two applications: the frontend and the backend. To set up the project, run `npm install` in the root directory. Ensure you have Node.js installed on your machine.

### Backend Setup

Create a `.env` file in the `apps/backend/` directory with the following environment variable:

```bash
OPEN_EXCHANGE_RATES_APP_ID=YOUR_OPEN_EXCHANGE_RATES_APP_ID
```

Refer to the `.env.example` file in the `apps/backend/` directory for guidance.

### Frontend Setup

Create a `.env` file in the `apps/frontend/` directory with the following environment variable:

```bash
SOCKET_SERVER_HOST_URL=http://localhost:5000
```

Refer to the `.env.example` file in the `apps/frontend/` directory for guidance.

## Running the Project

After setting up the project, you can run it using the following command in the root directory:

```bash
npx nx run-many -t serve dev
```

This command will start both the frontend and backend. The frontend will be available at `http://localhost:5100`, and the backend will be available at `http://localhost:5000`.

### Running with Nx Globally

If you prefer not to use Nx under npx, you can install Nx globally:

```bash
npm install -g nx
```

Then, run the project with:

```bash
nx run-many -t serve dev
```

### Running Applications Separately

You can also run the frontend and backend separately with the following commands in the root directory:

```bash
nx serve frontend
```

```bash
nx serve backend
```

## Running with Docker

To run the application with Docker, create a `.env` file in the root directory with the following environment variable:

```bash
OPEN_EXCHANGE_RATES_APP_ID=YOUR_OPEN_EXCHANGE_RATES_APP_ID
```

Then, run the application with Docker Compose:

```bash
docker-compose up
```

## Additional Information

- Ensure you have Docker and Docker Compose installed on your machine.
- The backend fetches exchange rates every 10 seconds.
- When exchange rate changes are detected, the backend only sends changes and not the entire list of exchange rates.
