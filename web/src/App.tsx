import { useCowSdk } from './hooks/useCowSdk';
import { WalletConnect } from './components/WalletConnect';
import { OrderForm } from './components/OrderForm';
import './App.css';

function App() {
  const cowSdk = useCowSdk();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <h1>CoW Swap Bot</h1>
        </div>
        <WalletConnect cowSdk={cowSdk} />
      </header>

      <main className="app-main">
        <OrderForm cowSdk={cowSdk} />
      </main>
    </div>
  );
}

export default App;
