"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react";

export default function CreateCollection(): JSX.Element {
  const account = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  const walletLoading = connectionStatus === "unknown" || connectionStatus === "connecting";
  const walletConnected = connectionStatus === "connected" && !!account;

  const [collectionData, setCollectionData] = useState<{
    image: File | null;
    name: string;
    symbol: string;
    description: string;
  }>({
    image: null,
    name: "",
    symbol: "",
    description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; kind: "success" | "error"; text: string }>({
    show: false,
    kind: "success",
    text: "",
  });

  // Auto-hide toast after 4s
  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, show: false })), 4000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const createCollection = useMutation(api.collections.create);
  const generateUploadUrl = useMutation(api.collections.generateUploadUrl);

  const uploadHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCollectionData((prev) => ({ ...prev, image: file }));
  };

  const onCreate = async () => {
    setError(null);
    setSubmitting(true);
    try {
      let imageId: Id<"_storage"> | undefined;

      if (collectionData.image) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": collectionData.image.type },
          body: collectionData.image,
        });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);

        const json: { storageId: string } = await res.json();
        imageId = json.storageId as Id<"_storage">;
      }

      await createCollection({
        name: collectionData.name,
        symbol: collectionData.symbol,
        description: collectionData.description,
        imageId,
        creator: account?.address ?? ""
      });

      setCollectionData({ image: null, name: "", symbol: "", description: "" });

      // Success toast
      setToast({
        show: true,
        kind: "success",
        text: "Collection created successfully",
      });
    } catch (e: any) {
      const msg = e?.message ?? "Failed to create collection.";
      setError(msg);
      setToast({ show: true, kind: "error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (!walletConnected) {
    return (
      <div className="tf-connect-wallet tf-section">
        <div className="ibthemes-container">
          <div className="row">
            <div className="col-12">
              <h2 className="tf-title-heading ct style-2 mg-bt-12">Connect Your Wallet</h2>
              <h5 className="sub-title ct style-1 pad-400">
                To create a collection, you need to connect your wallet.
              </h5>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast container (Bootstrap 5) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed top-0 end-0 p-3"
        style={{ zIndex: 1080 }}
      >
        <div
          className={`toast ${toast.show ? "show" : "hide"} border-0`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            minWidth: 280,
            borderRadius: "0.75rem", // <- rounded toast
            overflow: "hidden",
          }}
        >
          <div
            className={`toast-body d-flex align-items-center ${
              toast.kind === "success" ? "bg-success" : "bg-danger"
            } text-white`}
            style={{
              borderRadius: "0.75rem", // <- rounded body
            }}
          >
            <span className="me-auto fs-5" style={{ fontWeight: 500 }}>
              {toast.text}
            </span>
            <button
              type="button"
              className="btn-close btn-close-white ms-3"
              aria-label="Close"
              onClick={() => setToast((s) => ({ ...s, show: false }))}
            />
          </div>
        </div>
      </div>

      <div className="tf-create-item tf-section">
        <div className="ibthemes-container">
          <div className="row">
            <div className="col-xl-12 col-lg-12 col-md-12 col-12">
              <div className="form-create-item">
                <form action="#" onSubmit={(e) => e.preventDefault()}>
                  <h4 className="title-create-item">
                    Upload file <small>(collection avatar image)</small>
                  </h4>

                  <label className="uploadFile">
                    <span className="filename">
                      {collectionData.image
                        ? collectionData.image.name
                        : "PNG, JPG, GIF, WEBP or MP4. Max 200mb."}
                    </span>
                    <input
                      type="file"
                      className="inputfile form-control"
                      name="file"
                      onChange={uploadHandler}
                      accept="image/*,video/mp4"
                    />
                  </label>

                  <div className="flat-tabs tab-create-item">
                    <div className="content-tab">
                      <div className="content-inner">
                        <h4 className="title-create-item">Name</h4>
                        <input
                          type="text"
                          placeholder="Enter collection name"
                          value={collectionData.name}
                          onChange={(e) =>
                            setCollectionData({ ...collectionData, name: e.target.value })
                          }
                        />

                        <h4 className="title-create-item mt-5">Symbol</h4>
                        <input
                          type="text"
                          placeholder="Enter symbol"
                          value={collectionData.symbol}
                          onChange={(e) =>
                            setCollectionData({ ...collectionData, symbol: e.target.value })
                          }
                        />

                        <h4 className="title-create-item mt-5">Description</h4>
                        <textarea
                          placeholder='e.g. “This is the best collection in the world”'
                          value={collectionData.description}
                          onChange={(e) =>
                            setCollectionData({
                              ...collectionData,
                              description: e.target.value,
                            })
                          }
                        />

                        {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}

                        <button
                          type="button"
                          className="sc-button loadmore style fl-button pri-3 mt-4"
                          onClick={onCreate}
                          disabled={submitting || !collectionData.name || !collectionData.symbol}
                          aria-busy={submitting}
                        >
                          {submitting ? "Creating Collection..." : "Create Collection"}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Optional image preview... */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
