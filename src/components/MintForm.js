import React, { useState, useEffect, createContext } from 'react';
import { ethers } from 'ethers';
import { NFTStorage, File } from 'nft.storage';
import config from '../config';
import MyntedContract from '../abis/Mynted.json';
import styles from './MintForm.module.css';

export const WalletContext = createContext();

function MintForm() {
	const [provider, setProvider] = useState(null);
	const [account, setAccount] = useState(null);	

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState(null);
	const [media, setMedia] = useState(null);	

	const [uploading, setUploading] = useState(false);
	const [isMediaUploaded, setIsMediaUploaded] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);
	const [url, setURL] = useState(null);
	const [imageURL, setImageURL] = useState(null); 
	const [mediaURL, setMediaURL] = useState(null); 
	const [mintedTokenURI, setMintedTokenURI] = useState(null);


	const [mynted, setMynted] = useState(null);


	const loadBlockchainData = async () => {
	  const provider = new ethers.providers.Web3Provider(window.ethereum);
	  setProvider(provider);	

	  const network = await provider.getNetwork();	

	  const mynted = new ethers.Contract(config[network.chainId].mynted.address, MyntedContract, provider);
	  setMynted(mynted);	

	  const signer = provider.getSigner();
	  const account = await signer.getAddress();
	  setAccount(account);
	};

	const uploadImageAndMedia = async (imageData, mediaData) => {
	  const client = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_API_KEY });	

	  const metadata = {
	    name,
	    description,
	    image: new File([imageData], imageData.name, { type: imageData.type }),
	    media: mediaData ? new File([mediaData], mediaData.name, { type: mediaData.type }) : null,
	  };	

	  const result = await client.store(metadata);
	  const tokenURI = `https://ipfs.io/ipfs/${result.ipnft}/metadata.json`;
	  const imageURI = `https://ipfs.io/ipfs/${result.data.image.href}`;
	  const mediaURI = mediaData ? `https://ipfs.io/ipfs/${result.data.media.href}` : null;	

	  setURL(tokenURI);
	  setImageURL(imageURI);
	  setMediaURL(mediaURI);	

	  return { tokenURI, imageURI, mediaURI };
	};

	const mintMedia = async ({ tokenURI, imageURI, mediaURI }) => {
	  const signer = await provider.getSigner();
	  const transaction = await mynted.connect(signer).mintNFT(tokenURI, description, imageURI, mediaURI, { value: ethers.utils.parseUnits("1", "ether") });
	  await transaction.wait();

	  setMintedTokenURI(tokenURI);
	};

	const submitHandler = async (e) => {
	  e.preventDefault();     	

	  if (name === "" || description === "" || !image || !media) {
	    window.alert("Don't Forget The Name, Description, Image, and Media!");
	    return;
	  }     	

	  const { tokenURI, imageURI, mediaURI } = await uploadImageAndMedia(image, media);
	  await mintMedia({ tokenURI, description, imageURI, mediaURI });
	  setIsMediaUploaded(false); // Set media uploaded status back to false after minting
	};

  const handleFileChange = (event) => {
    setImage(event.target.files[0]);
    const previewURL = URL.createObjectURL(event.target.files[0]);
    setPreviewImage(previewURL);
  };

	const uploadButtonHandler = async () => {
	  setUploading(true);  // Start upload status	

	  try {
	    await uploadImageAndMedia(image, media);
	    setIsMediaUploaded(true); // Set media uploaded status to true after successful upload
	  } catch (error) {
	    console.error("Error uploading image:", error);
	  } finally {
	    setUploading(false);  // End upload status
	  }
	};

  useEffect(() => {
    loadBlockchainData();
  }, []);

	return (
	  <div className={styles.mintFormContainer}>
	    <h1>Mint your NFT</h1>
	    {account && <p className={styles.connectedAccount}>Connected Account: {account}</p>}
	    
	    {isMediaUploaded 
	      ? <p>Your media has been uploaded. You can now mint your NFT.</p>
	      : <p>Upload your media to mint your NFT.</p>
	    }	

	    <form onSubmit={submitHandler} className={styles.mintForm}>
	      <input 
	        type="text" 
	        placeholder="Name Your NFT" 
	        value={name} 
	        onChange={(e) => setName(e.target.value)} 
	        required
	      />
	      <br />
	      <input 
	        type="text" 
	        placeholder="Describe Your NFT" 
	        value={description} 
	        onChange={(e) => setDescription(e.target.value)} 
	        required
	      />
	      <br />
	      <label>
	        Display Image:
	        <input type="file" onChange={handleFileChange} required/>
	      </label>
	      <br />
	      {/* Display image preview */}
	      {previewImage && (
	        <div>
	          <h4>Image Preview:&nbsp;</h4>
	          <img src={previewImage} alt="Preview" style={{ width: '100%', maxWidth: '400px' }} />
	        </div>
	      )}
	      <br />
	      <label>
	        Media:
	        <input type="file" onChange={(event) => setMedia(event.target.files[0])} required />
	      </label>
	      <br />
	      <button 
	        onClick={uploadButtonHandler} 
	        disabled={!image || uploading} 
	        className={styles.uploadButton}
	      >
	        {uploading ? "Uploading..." : "Upload Image"}
	      </button>
	      <button type="submit" className={styles.mintFormButton} disabled={!name || !description || !image || !media || !account || !isMediaUploaded}>Mint NFT</button>
	    </form>
	  	{mintedTokenURI && (
			  <p>
			    <a href={mintedTokenURI} target="_blank" rel="noopener noreferrer">
			      View minted NFT metadata
			    </a>
			  </p>
			)}
	  </div>
	);
};

export default MintForm;
