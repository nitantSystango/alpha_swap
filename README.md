# AlphaSwap

AlphaSwap is a decentralized exchange (DEX) aggregator designed to provide users with the best token swap rates while offering protection against MEV (Maximal Extractable Value). It leverages the CoW Protocol to batch orders and find the most efficient execution paths.

## Features

- **Best Execution**: Aggregates liquidity from multiple sources to ensure optimal swap rates.
- **MEV Protection**: Protects users from front-running and sandwich attacks via CoW Protocol.
- **Gas-less Orders**: Users sign messages instead of submitting transactions, saving on gas fees for failed trades.
- **Dynamic Token List**: Fetches and displays an extensive list of tokens with logos, similar to major DEX interfaces.
- **User-Friendly Interface**: A clean, modern UI built with React and Vite, featuring a seamless swap experience.

## Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: CSS Modules / Vanilla CSS
- **Web3 Integration**: [Ethers.js](https://docs.ethers.org/v6/), [CoW SDK](https://docs.cow.fi/sdk)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Utilities**: [CoW SDK](https://docs.cow.fi/sdk) for quote fetching and order placement

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd alpha_swap
    ```

2.  **Install Root Dependencies:**
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd web
    npm install
    cd ..
    ```

## Running the Project

To run both the backend server and the frontend application concurrently:

```bash
npm start
```

This command will:
- Start the backend server on `http://localhost:3000`
- Start the frontend development server (usually on `http://localhost:5173`)

## Project Structure

```
alpha_swap/
├── src/                # Backend source code
│   ├── controllers/    # Request handlers
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic and external API integration
│   └── server.ts       # Entry point for the backend
├── web/                # Frontend source code
│   ├── src/            # React components, hooks, and styles
│   ├── public/         # Static assets
│   └── vite.config.ts  # Vite configuration
├── package.json        # Root configuration and scripts
└── README.md           # Project documentation
```

## License

This project is licensed under the ISC License.
