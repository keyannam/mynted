import React, { useState, createContext } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styles from './App.css'

import LandingPage from './LandingPage'; 
import MintForm from './MintForm'; 

export const WalletContext = createContext();

function App() {
  const [account, setAccount] = useState(null);

  return (
    <WalletContext.Provider value={{ account, setAccount }}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mint" element={<MintForm />} />
        </Routes>
      </Router>
    </WalletContext.Provider>
  );
}

export default App;
