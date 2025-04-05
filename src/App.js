import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/modules/Header';
import Home from './components/pages/Landing';
import PGNAnalyzer from './components/pages/PGNAnalyzer';
import Training from './components/pages/Training';
import Openings from './components/pages/Openings';
import LocalChessGame from './components/pages/Local';
import NotFound from './components/pages/NotFound';
import './i18n';

function App() {
    return (
        <Router>
            <Header />
            <div className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/analyze" element={<PGNAnalyzer />} />
                    <Route path="/training" element={<Training />} />
                    <Route path="/openings" element={<Openings />} />
                    <Route path="/local" element={<LocalChessGame />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;