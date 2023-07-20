import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import 'bootstrap/dist/css/bootstrap.css';
import Spinner from 'react-bootstrap/Spinner'
import { NFTStorage, File } from 'nft.storage';

import { ethers } from 'ethers';
import config from '../config';
import MyntedContract from '../abis/Mynted.json';

import styles from './MintForm.module.css';
import logo from '../myntedlogo.png';

function MintForm() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [image, setImage] = useState(null);
	const [media, setMedia] = useState(null);	

	const [showModal, setShowModal] = useState(null);
	const handleClose = () => setShowModal(null);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const [uploading, setUploading] = useState(false);
	const [isMediaUploaded, setIsMediaUploaded] = useState(false);
	const [previewImage, setPreviewImage] = useState(null);
	const [url, setURL] = useState(null);

	const [imageURL, setImageURL] = useState(null); 
	const [mediaURL, setMediaURL] = useState(null); 
	const [minting, setMinting] = useState(false);

	const [mintedTokenURI, setMintedTokenURI] = useState(null);
	const [mintedTokenId, setMintedTokenId] = useState(null);

	const [mintedNFTs, setMintedNFTs] = useState([]);

	const [mynted, setMynted] = useState(null);

	const loadBlockchainData = async () => {
	  const provider = new ethers.providers.Web3Provider(window.ethereum);
	  setProvider(provider);  	

	  const networkData = await provider.getNetwork(); // <-- Fetch network data
	  setNetwork(networkData); // <-- Set network data in state	

	  const mynted = new ethers.Contract(
	    config[networkData.chainId].mynted.address, 
	    MyntedContract, 
	    provider
	  );	

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

	  // Use the URLs from the NFTStorage API
	  const tokenURI = result.url;
	  let imageURI = result.data.image.href;
	  let mediaURI = mediaData ? result.data.media.href : null;	

	  // Remove 'ipfs://' from the start of the URLs, if it exists
	  imageURI = imageURI.startsWith('ipfs://') ? imageURI.substring(7) : imageURI;
	  mediaURI = mediaURI && mediaURI.startsWith('ipfs://') ? mediaURI.substring(7) : mediaURI;	

	  // Now append 'https://ipfs.io/ipfs/' to the start of the URLs
	  imageURI = `https://ipfs.io/ipfs/${imageURI}`;
	  if (mediaURI) {
	    mediaURI = `https://ipfs.io/ipfs/${mediaURI}`;
	  }	

	  setURL(tokenURI);
	  setImageURL(imageURI);
	  setMediaURL(mediaURI);	

	  return { tokenURI, imageURI, mediaURI };
	  
	};

	const mintMedia = async ({ tokenURI, imageURI, mediaURI }) => {
	  try {
	  	setMinting(true); // set minting state to true

	    const signer = await provider.getSigner();
	    const transaction = await mynted.connect(signer).mintNFT(tokenURI, description, imageURI, mediaURI, { value: ethers.utils.parseUnits("1", "ether") });
	    const receipt = await transaction.wait();	

	    // Check if the transaction was successful
	    if (receipt.status === 0) {
	      setShowModal({
	        title: "Error",
	        body: "Transaction failed",
	        footer: "Please try again"
	      });
	      return;
	    }	

	    let tokenId;	

	    for (let i in receipt.events) {
	      let event = receipt.events[i];
	      if (event.event === "NFTMinted") {
	        tokenId = event.args.tokenId;
	        break;
	      }
	    }	

	    setMintedTokenURI(tokenURI);
	    setMintedTokenId(tokenId);	

	    // Add NFT info to state
	    setMintedNFTs((prevNFTs) => [
	      ...prevNFTs,
	      {
	        tokenId,
	        tokenURI,
	        imageURI,
	        mediaURI,
	        name,
	        description,
	      },
	    ]);	

	    // Clean up media data and preview
	    setImage(null);
	    setMedia(null);
	    setPreviewImage(null);
	    setName("");
	    setDescription("");	

	    setIsMediaUploaded(false); // Set media uploaded status back to false after minting
	    setShowModal({
	      title: "Success",
	      body: "Congrats homie, you have minted your NFT!",
	      footer: (
	        <Button variant="success" onClick={handleClose}>
	          Close
	        </Button>
	      ),
	    }); // Show success modal after minting 

	  } catch (error) {
	    let errorMessage = "An error occurred while minting the media: " + error.message;
	    if (error.message.includes("Nonce too high")) {
	      errorMessage = "Please wait for your previous transaction to finish before sending a new one.";
	    }
	    setShowModal({
	      title: "Error",
	      body: errorMessage,
	      footer: "Please check your inputs and try again"
	    });

	 } finally {
    setMinting(false); // Set minting state back to false
	 }
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
  if (name === "" || description === "" || !image || !media) {
    // Replace window.alert with setShowModal to show the modal with an error message
    setShowModal({
      title: "Upload Failed",
      body: "Don't Forget The Name, Description, Image, and Media!",
      footer: (
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
      ),
    });
    return;
  }

  setUploading(true);  

  try {
    await uploadImageAndMedia(image, media);
    setIsMediaUploaded(true);  // Set media uploaded status to true after successful upload
    // Show the modal with a success message
    setShowModal({
      title: "Upload Successful",
      body: "Your media has been uploaded. You can now mint your NFT.",
      footer: (
        <Button variant="success" onClick={handleClose}>
          Close
        </Button>
      ),
    });
  } catch (error) {
    
    setShowModal({
      title: "Upload Failed",
      body: "An error occurred while uploading your media.",
      footer: (
        <Button variant="danger" onClick={handleClose}>
          Close
        </Button>
      ),
    });
  } finally {
    setUploading(false);  // End upload status
  }
};

  useEffect(() => {
    loadBlockchainData();
  }, []);

return (
	<div className={styles.mintFormContainer}>
	  <img src={logo} alt="Logo" className={styles.logo} />
	  	{account && <div className={styles.connectedAccount}>Connected Account: <span>{account}</span></div>}
	  
		  {isMediaUploaded 
		    ? <p>Your media has been uploaded. You can now mint your NFT.</p>
		    : <h3>Tell Us About Your NFT </h3>
		  }  
		<form onSubmit={submitHandler} className={styles.mintForm}>
		  <input 
		    type="text" 
		    placeholder="Name Your NFT" 
		    value={name} 
		    onChange={(e) => setName(e.target.value)} 
		    required
		    className={styles.inputField}
		  />
		  <input 
		    type="text" 
		    placeholder="Describe Your NFT" 
		    value={description} 
		    onChange={(e) => setDescription(e.target.value)} 
		    required
		    className={styles.inputField}
		  />
		  {/* Display image preview */}
		  {previewImage && (
		    <div className={styles.previewContainer}>
		      <h4>Image Preview:</h4>
		      <img src={previewImage} alt="Preview" className={styles.previewImage} />
		    </div>
		  )}
		  <label className={styles.customFileUpload}>
		    <input type="file" onChange={handleFileChange} required style={{display: 'none'}} disabled={!name || !description}/>
		    Choose Display Image
		  </label>
		  <label className={styles.customFileUpload}>
		    <input type="file" onChange={(event) => setMedia(event.target.files[0])} required style={{display: 'none'}} disabled={!name || !description || !image}/>
		    Select Your Media
		  </label>
		  <button 
		    onClick={uploadButtonHandler} 
		    disabled={!name || !description || !image || !media || uploading} 
		    className={styles.uploadButton}
		  >
		    {uploading ? "Uploading..." : "Upload Your Files"}
		  </button>
		  <button type="submit" className={styles.mintFormButton} disabled={!name || !description || !image || !media || !account || !isMediaUploaded || minting}>
		  {minting ? "Minting..." : "Mint NFT"}</button>
		</form>

	   <div className={styles.cardsContainer}>
			{mintedNFTs.map((nft) => (
			  <div key={nft.tokenId} className="card">
			    <img src={nft.imageURI} alt={nft.name} className="card-img-top" />
			    <div className="card-body">
			      <h5 className="card-title">{nft.name}</h5>
			      <p className="card-text">{nft.description}</p>
			      <a href={`https://testnets.opensea.io/assets/sepolia/${config[network.chainId].mynted.address}/${nft.tokenId}`} 
			         target="_blank" 
			         rel="noopener noreferrer" 
			         className="btn btn-primary">
			        View on Opensea
			      </a>
			    </div>
			    {nft.mediaURI && (
			      <div className="card-footer">
			        <a href={nft.mediaURI} 
			           target="_blank" 
			           rel="noopener noreferrer" 
			           className="btn btn-secondary">
			          View Additional Media
			        </a>
			      </div>
			    )}
			  </div>
			))}
		</div>

			{showModal && (
			  <Modal show={true} onHide={handleClose}>
			    <Modal.Header closeButton>
			      <Modal.Title>{showModal.title}</Modal.Title>
			    </Modal.Header>
			    <Modal.Body>{showModal.body}</Modal.Body>
			    <Modal.Footer>{showModal.footer}</Modal.Footer>
			  </Modal>
			  )}
	  </div>

	);
};

export default MintForm;
