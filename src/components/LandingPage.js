import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { WalletContext } from './App';
import './LandingPage.css'; // import the styling
import { ethers } from 'ethers';

function LandingPage() {
  const { account, setAccount } = useContext(WalletContext);

  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
    console.log(`Wallet connected: ${account}`);
  };

  return (
    <div className="landing-container">
      <h1>Welcome to MYNTED</h1>
      <p>Upload, Mint & Display Your NFTs In 60 Seconds Or Less...</p>
      {
        account ?
        <button className="cta-button" onClick={() => window.location.href="/mint"}>Go to Mint Page</button>
        :
        <button className="cta-button" onClick={connectHandler}>Connect Metamask</button>
      }
    </div>
  );
}

export default LandingPage;
