import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoanApplicationPage from './pages/LoanApplicationPage';
import Navbar from './components/Navbar';
import "./App.css"

function App() {
    return (
        <Router>
            <div className="app-main-wrapper">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<LoanApplicationPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;