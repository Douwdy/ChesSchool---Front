import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './components/modules/Header';
import Home from './components/pages/Landing';
import PGNAnalyzer from './components/pages/PGNAnalyzer';
import Training from './components/pages/Training';
import Openings from './components/pages/Openings';
import LocalChessGame from './components/pages/Local';
import NotFound from './components/pages/NotFound';
import './i18n';

function App() {
    const { i18n } = useTranslation();
    
    useEffect(() => {
        // For first-time visitors, detect browser language and apply it
        const savedLang = localStorage.getItem('i18nextLng');
        
        if (!savedLang) {
            // Get browser language
            const browserLang = navigator.language.split('-')[0]; // e.g., "en-US" -> "en"
            
            // Check if we support this language
            const supportedLanguages = ['fr', 'en', 'it', 'zh', 'jp', 'hi'];
            
            if (supportedLanguages.includes(browserLang)) {
                i18n.changeLanguage(browserLang);
            } else {
                // Default to French if browser language is not supported
                i18n.changeLanguage('fr');
            }
        }
    }, [i18n]);

    useEffect(() => {
        // Set the HTML lang attribute whenever the language changes
        document.documentElement.lang = i18n.language;
        
        // You can also make other language-specific adjustments here
        // For example, adjusting RTL/LTR direction if needed
        const direction = ['ar', 'he', 'fa', 'ur'].includes(i18n.language) ? 'rtl' : 'ltr';
        document.documentElement.dir = direction;
        
        // Listen for language changes
        const handleLanguageChanged = (lng) => {
            document.documentElement.lang = lng;
            // Save to localStorage (optional, as i18next already does this)
            localStorage.setItem('i18nextLng', lng);
        };
        
        i18n.on('languageChanged', handleLanguageChanged);
        
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

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