"use client";

import { useState, ChangeEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel"; // <-- import the branded Id type

export default function CreateCollection(): JSX.Element {
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
      let imageId: Id<"_storage"> | undefined; // <-- correctly typed

      if (collectionData.image) {
        const uploadUrl = await generateUploadUrl();

        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": collectionData.image.type },
          body: collectionData.image,
        });
        if (!res.ok) throw new Error(`Upload failed (${res.status})`);

        // JSON is plain strings, so cast to the branded Id type:
        const json: { storageId: string } = await res.json();
        imageId = json.storageId as Id<"_storage">;
      }

      await createCollection({
        name: collectionData.name,
        symbol: collectionData.symbol,
        description: collectionData.description,
        imageId, // <-- now matches Id<"_storage"> | undefined
      });

      setCollectionData({ image: null, name: "", symbol: "", description: "" });
    } catch (e: any) {
      setError(e?.message ?? "Failed to create collection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
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

                      <h4 className="title-create-item mn-3">Symbol</h4>
                      <input
                        type="text"
                        placeholder="Enter symbol"
                        value={collectionData.symbol}
                        onChange={(e) =>
                          setCollectionData({ ...collectionData, symbol: e.target.value })
                        }
                      />

                      <h4 className="title-create-item">Description</h4>
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
                        className="sc-button loadmore style fl-button pri-3"
                        onClick={onCreate}
                        disabled={
                          submitting || !collectionData.name || !collectionData.symbol
                        }
                        aria-busy={submitting}
                      >
                        {submitting ? "Creating Collection..." : "Create Collection"}
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Optional image preview for images only */}
              {/* {collectionData.image?.type.startsWith("image/") && (
                <div style={{ marginTop: 16 }}>
                  <strong>Preview:</strong>
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={URL.createObjectURL(collectionData.image)}
                      alt="preview"
                      style={{ maxWidth: 200, height: "auto", display: "block" }}
                    />
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
