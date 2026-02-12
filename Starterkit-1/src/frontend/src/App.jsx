import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Status from './pages/Status.jsx';
import './App.css';

// A simple component for the home page
function Home() {
  return (
    <div>
      <h1>Welcome to the Azure SaaS Starter Kit</h1>
      <p>This is the home page.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/status">System Status</Link>
            </li>
          </ul>
        </nav>

        <hr />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/status" element={<Status />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
