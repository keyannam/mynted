import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletContext } from './App';
import './LandingPage.css'; // import the styling
import { ethers } from 'ethers';

function LandingPage() {
  const { account, setAccount } = useContext(WalletContext);
  const [connectionSuccess, setConnectionSuccess] = useState(false);
  const navigate = useNavigate();

  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
    console.log(`Wallet connected: ${account}`);

    setConnectionSuccess(true);
    setTimeout(() => {
      navigate("/mint");
    }, 2000);
  };

  return (
    <div className="landing-container">
      <h1>Welcome to MYNTED</h1>
      <p>Upload, Mint & Display Your NFTs In 60 Seconds Or Less...</p>
      {
        account ?
        <button className="cta-button" onClick={() => navigate("/mint")}>Go to Mint Page</button>
        :
        <button className="cta-button" onClick={connectHandler}>Connect Metamask</button>
      }
      {connectionSuccess && <p>Your wallet is connected! Redirecting...</p>}
    </div>
  );
}

export default LandingPage;
