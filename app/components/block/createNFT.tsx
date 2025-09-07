"use client";
import { useState, ChangeEvent, useEffect } from "react";
import { useQuery, useConvex } from "convex/react";
import { useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react";
import { prepareContractCall, sendTransaction, toUnits, getContract } from "thirdweb";
import client from "@/app/thirdwebClient";
import { sepolia } from "thirdweb/chains";
import { api } from "@/convex/_generated/api";
import ProductCard9 from "../card/ProductCard9";
import Dropdown2 from "../dropdown/Dropdown2";
import { product1 } from "@/data/product";

interface Collection {
  name: string;
  imageId: string;
  _id: string;
  imageUrl?: string;
}

export default function CreateNFT(): JSX.Element {
  const [getImage, setImage] = useState<null | File>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [creating, setCreating] = useState<boolean>(false);
  const [mintStatus, setMintStatus] = useState<string>("");
  const [mintError, setMintError] = useState<string>("");

  // Form state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  const convex = useConvex();
  const account = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  
  const walletLoading = connectionStatus === "unknown" || connectionStatus === "connecting";
  const walletConnected = connectionStatus === "connected" && !!account;

  const myCollections = useQuery(api.collections.getByCreator, { 
    creator: account?.address ?? "" 
  });

  useEffect(() => {
    if (myCollections) {
      setCollections(myCollections);

      // Fetch image URLs for each collection
      const fetchImageUrls = async () => {
        const urls: { [key: string]: string } = {};
        for (const collection of myCollections) {
          try {
            const url = await convex.query(api.collections.getUrl, {
              imageId: collection.imageId,
            });
            urls[collection._id] = url || "/assets/images/box-item/card-item8.jpg";
          } catch (error) {
            console.error("Failed to fetch image URL:", error);
            urls[collection._id] = "/default-image.jpg";
          }
        }
        setImageUrls(urls);
      };

      fetchImageUrls();
    }
  }, [myCollections, convex]);

  const uploadHandler = (e: ChangeEvent<HTMLInputElement>): void => {
    const file: File | null = e.target.files?.[0] || null;
    setImage(file);
  };

  const handleCollectionChange = (selectedValue: string) => {
    const selected = collections.find(
      (collection) => collection.name === selectedValue
    );
    if (selected) {
      setSelectedCollection(selected);
      setSelectedCollectionId(selected._id);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleCreateNFT = async () => {
    if (!getImage) {
      setMintError("Please upload an image");
      return;
    }
    
    if (!title || !description) {
      setMintError("Please fill in all required fields");
      return;
    }
    
    if (!account?.address) {
      setMintError("Wallet not connected");
      return;
    }

    setCreating(true);
    setMintStatus("Uploading image...");
    setMintError("");

    try {
      // In a real implementation, you would upload to IPFS here
      setMintStatus("Uploading metadata...");
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // This is where you would get the actual IPFS URL
      const imageUrl = URL.createObjectURL(getImage);
      
      setMintStatus("Minting NFT...");

      const contract = getContract({
        client: client,
        chain: sepolia,
        address: process.env.NEXT_PUBLIC_COLLECTION_SMART_CONTRACT_ADDRESS!,
      });
      
      // Prepare the contract call using the new ThirdWeb SDK
      const transaction = prepareContractCall({
        contract: contract,
        method: "function mintTo(address to, string memory uri) public",
        params: [account.address, imageUrl] // In production, use IPFS URL
      });
      
      // Send the transaction
      const { transactionHash } = await sendTransaction({
        transaction,
        account: account
      });
      
      setMintStatus(`NFT minted successfully! Transaction hash: ${transactionHash}`);
      setCreating(false);
      
      // Reset form
      setImage(null);
      setTitle("");
      setDescription("");
      setSelectedCollection(null);
      
    } catch (error: any) {
      setMintError(`Error: ${error.message}`);
      setCreating(false);
      setMintStatus("");
    }
  };

  if (!walletConnected) {
    return (
      <div className="tf-connect-wallet tf-section">
        <div className="ibthemes-container">
          <div className="row">
            <div className="col-12">
              <h2 className="tf-title-heading ct style-2 mg-bt-12">
                Connect Your Wallet
              </h2>
              <h5 className="sub-title ct style-1 pad-400">
                To create an NFT, you need to connect your wallet.
              </h5>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tf-create-item tf-section">
      <div className="ibthemes-container">
        <div className="row">
          <div className="col-xl-3 col-lg-6 col-md-6 col-12">
            <h4 className="title-create-item">Preview NFT</h4>
            <ProductCard9
              data={{
                img: getImage ? URL.createObjectURL(getImage) : "/assets/images/box-item/card-item8.jpg",
                title: title || "NFT Title",
                description: description.length > 50 
                  ? description.substring(0, 50) + " ..." 
                  : description || "NFT Description",
                collection: selectedCollection || { name: "Select a collection" },
              }}
            />
          </div>
          <div className="col-xl-9 col-lg-6 col-md-12 col-12">
            <div className="form-create-item">
              <form>
                <h4 className="title-create-item">Upload file</h4>
                <label className="uploadFile">
                  <span className="filename">
                    {getImage !== null
                      ? getImage?.name
                      : `PNG, JPG, GIF, WEBP or MP4. Max 200mb.`}
                  </span>
                  <input
                    type="file"
                    className="inputfile form-control"
                    name="file"
                    onChange={uploadHandler}
                    disabled={creating}
                  />
                </label>
              </form>
              <div className="flat-tabs tab-create-item">
                <div className="content-tab">
                  <div className="content-inner">
                    <form>
                      <h4 className="title-create-item">Collection</h4>
                      <Dropdown2
                        id="full_item_category"
                        defaultSelect="Select a collection"
                        style={{ width: "100% !important" }}
                        className="style-3"
                        data={collections.map(collection => ({
                          ...collection,
                          imageUrl: imageUrls[collection._id],
                        }))}
                        onChange={handleCollectionChange}
                      />
                      <h4 className="title-create-item">Title</h4>
                      <input
                        type="text"
                        placeholder="Enter NFT name"
                        value={title}
                        onChange={handleTitleChange}
                        disabled={creating}
                      />
                      <h4 className="title-create-item">Description</h4>
                      <textarea
                        placeholder="e.g. “This is very limited item”"
                        value={description}
                        rows={6}
                        onChange={handleDescriptionChange}
                        disabled={creating}
                      />
                      
                      {mintStatus && (
                        <div className="mint-status">
                          <p>{mintStatus}</p>
                        </div>
                      )}
                      
                      {mintError && (
                        <div className="mint-error">
                          <p>{mintError}</p>
                        </div>
                      )}
                      
                      <button
                        type="button"
                        className="sc-button loadmore style fl-button pri-3 mt-4"
                        onClick={handleCreateNFT}
                        disabled={creating}
                      >
                        {creating ? "Creating NFT..." : "Create NFT"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .mint-status {
          background-color: #f0f9ff;
          color: #0369a1;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
        }
        
        .mint-error {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin: 16px 0;
        }
        
        .uploadFile {
          display: block;
          padding: 24px;
          border: 2px dashed #ddd;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.3s;
        }
        
        .uploadFile:hover {
          border-color: #8364e2;
        }
        
        .inputfile {
          display: none;
        }
        
        .filename {
          color: #666;
        }
        
        input, textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 16px;
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}