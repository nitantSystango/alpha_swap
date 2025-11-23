import { useCowSdk } from './hooks/useCowSdk';
import { WalletConnect } from './components/WalletConnect';
import { NetworkIndicator } from './components/NetworkIndicator';
import { OrderForm } from './components/OrderForm';
import './App.css';

function App() {
  const cowSdk = useCowSdk();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <img src="/alphaswap_logo_v2.svg" alt="AlphaSwap Logo" className="app-logo" />
          <div className="app-title">AlphaSwap</div>
        </div>

        <nav className="nav-links">
          <a href="#" className="nav-link active">Trade</a>
          <a href="#" className="nav-link">Pool</a>
          <a href="#" className="nav-link">Explore</a>
        </nav>

        <div className="header-actions">
          <NetworkIndicator chainId={cowSdk.chainId} />
          <WalletConnect cowSdk={cowSdk} />
        </div>
      </header>

      <main className="app-main">
        <OrderForm cowSdk={cowSdk} />

        <div className="info-section">
          <h3 className="info-title">Why AlphaSwap?</h3>
          <p>Experience the future of decentralized trading with MEV protection and gasless orders.</p>

          <div className="info-grid">
            <div className="info-item">
              <h4>$12B+</h4>
              <p>Volume Traded</p>
            </div>
            <div className="info-item">
              <h4>300K+</h4>
              <p>Trades Protected</p>
            </div>
            <div className="info-item">
              <h4>0</h4>
              <p>Failed Transactions</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
