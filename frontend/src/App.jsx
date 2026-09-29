import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import ErrorBoundary from './ErrorBoundary';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  return (
    <ErrorBoundary>
      <BrowserRouter>
        {user && <Navbar user={user} setUser={setUser} />}
        <div className="min-h-screen bg-slate-50">
          <Routes>
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
