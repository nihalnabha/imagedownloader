/* eslint-disable react/no-unescaped-entities */
import React, { useState } from "react";
import { Gallery } from "react-grid-gallery";
import { FaArrowRightLong } from "react-icons/fa6";
import JSZip from "jszip";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const IndexPage = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [docsId, setDocsId] = useState("");
  const [images, setImages] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track if form is submitted

  const handleInputChange = (event) => {
    const inputUrl = event.target.value;
    setUrl(inputUrl);
    setError("");

    const docsIDPattern = /\/document\/d\/([a-zA-Z0-9-_]+)\//;
    const match = inputUrl.match(docsIDPattern);
    if (match && match[1]) {
      setDocsId(match[1]);
    } else {
      setDocsId("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    toast.dismiss();

    if (!url.trim()) {
      return;
    }
    if (!docsId) {
      toast.error("Please Paste a  Google Docs link.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/download?docsId=${docsId}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.images.length === 0) {
        toast.error("Please Paste a valid public Google Docs link.");
        return;
      }

      const fetchedImgs = data.images.map((image, index) => {
        let mimeType = image.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
        let imgExt = mimeType.split("/")[1];
        const imgName = `image_${index + 1}.${imgExt}`;

        return {
          src: image,
          thumbnail: image,
          thumbnailWidth: 320,
          thumbnailHeight: 212,
          isSelected: false,
        };
      });
      setImages(fetchedImgs);
      setIsSubmitted(true); // Set isSubmitted to true after successfully fetching images
      toast.success("Images fetched successfully!");
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Error fetching images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const nextImages = images.map((image) => ({
      ...image,
      isSelected: !selectAll,
    }));
    setImages(nextImages);
    setSelectAll(!selectAll);
  };

  const handleSelect = (index, item, event) => {
    const nextImages = images.map((image, i) =>
      i === index ? { ...image, isSelected: !image.isSelected } : image
    );
    setImages(nextImages);
    if (nextImages.length === 0) {
      setSelectAll(false);
    } else {
      setSelectAll(true);
    }
  };

  const handleDownloadZip = () => {
    const selectedImages = images.filter((image) => image.isSelected);
    if (selectedImages.length === 0) {
      toast.error("Please select images to download.");
      return;
    }

    const zip = new JSZip();
    const promises = selectedImages.map((image, index) => {
      return fetch(image.src)
        .then((response) => response.blob())
        .then((blob) => {
          let mimeType = image.src.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
          let imgExt = mimeType.split("/")[1];

          const imgName = `image_${index + 1}.${imgExt}`;
          zip.file(imgName, blob);
        })
        .catch((error) => {
          console.error("Error downloading image:", error);
          setError("Error downloading images. Please try again.");
        });
    });

    Promise.all(promises)
      .then(() => {
        zip.generateAsync({ type: "blob" }).then((content) => {
          const url = URL.createObjectURL(content);
          const a = document.createElement("a");
          a.href = url;
          a.download = "selected_images.zip";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      })
      .catch((error) => {
        console.error("Error downloading images:", error);
        setError("Error downloading images. Please try again.");
      });
  };

  const handleReset = () => {

    setError("");
    setUrl("");
    setImages([]);
    setDocsId("");
    setSelectAll(false);
    setIsSubmitted(false);
   };
   ;

  return (
    <main className="bg-white flex flex-col min-h-screen pt-16">
      <div className="px-4 pt-8 md:px-8 lg:px-16 xl:px-32 ">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-center text-black mb-4">
            Download image Google Docs
          </h1>
          <div>
            <p className="text-center text-gray-700 mb-8">
              Downloading images from Google Docs is tedious. Use this free tool
              to download images in a click!
            </p>
          </div>

          <form
            className="flex flex-col items-center justify-center mb-2"
            onSubmit={handleSubmit}
          >
            <input
              type="url"
              placeholder="https://docs.google.com/document/d/xxxxxxxxx_xxxxxxxx/edit"
              className="text-black max-w-lg w-full px-4 py-2 hover:border-black border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-2 placeholder-gray-500 placeholder-opacity-100"
              value={url}
              onChange={handleInputChange}
            />
            <div className="text-sm text-center text-gray-700 mb-4">
              Paste a Google Docs link with access level: Anyone on the internet
              with the link can view.
            </div>
            <div className="flex justify-center">
              {isSubmitted ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-purple-500 focus:outline-none focus:bg-blue-700"
                >
                  Reset
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-purple-500 focus:outline-none focus:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        aria-hidden="true"
                        role="status"
                        className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="#1C64F2"
                        />
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    "Download Images"
                  )}
                  {!loading && <FaArrowRightLong className="ml-2" />}
                </button>
              )}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </form>
        </div>
      </div>

      {images.length > 0 && (
        <div className="bg-white sticky pt-4 flex justify-center w-full mt-10 mb-8">
          <button
            className={`px-4 py-2 rounded-md mb-4 mr-4 ${
              images.some((image) => image.isSelected)
                ? "bg-red-200 text-red-800"
                : "bg-blue-600 text-white"
            }`}
            onClick={handleSelectAll}
          >
            {images.some((image) => image.isSelected)
              ? "Deselect All"
              : "Select All"}
          </button>

          <button
            className={`px-4 py-2 rounded-md mb-4 ${
              images.some((image) => image.isSelected)
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-gray-700"
            }`}
            onClick={handleDownloadZip}
            disabled={!images.some((image) => image.isSelected)}
          >
            Download (ZIP)
          </button>
        </div>
      )}
      <div className="px-4 md:px-8 lg:px-16 xl:px-32 mb-10">
        {images.length > 0 && (
          <div className="px-4 md:px-8 lg:px-16 xl:px-32">
            <Gallery images={images} onSelect={handleSelect} />
          </div>
        )}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8 lg:px-16 xl:px-32">
        <div class="p-8 border border-gray-200 rounded-lg">
          <div class="bg-indigo-100 rounded-full w-16 h-16 flex justify-center items-center text-indigo-500 shadow-2xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6"
            >
              <path
                fill-rule="evenodd"
                d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h2 class="uppercase mt-6 text-indigo-700 font-medium text-center mb-3">
            Easy Image Downloads
          </h2>
          <p class="font-light text-sm text-gray-700 mb-3 text-center">
            Download individual images or the entire collection with ease.
          </p>
        </div>

        <div class="p-8 border border-gray-200 rounded-lg">
          <div class="bg-indigo-100 rounded-full w-16 h-16 flex justify-center items-center text-indigo-500 shadow-2xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6"
            >
              <path
                fill-rule="evenodd"
                d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h2 class="uppercase mt-6 text-indigo-700 font-medium text-center mb-3">
            Privacy Assured
          </h2>
          <p class="font-light text-sm text-gray-700 mb-3 text-center">
            Your data remains secure; we only require the Google Docs URL for
            extraction.
          </p>
        </div>

        <div class="p-8 border border-gray-200 rounded-lg">
          <div class="bg-indigo-100 rounded-full w-16 h-16 flex justify-center items-center text-indigo-500 shadow-2xl mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6"
            >
              <path
                fill-rule="evenodd"
                d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <h2 class="uppercase mt-6 text-indigo-700 font-medium text-center mb-3">
            Faster Workflow
          </h2>
          <p class="font-light text-sm text-gray-700 mb-3 text-center">
            Install our Google Workspace extension for seamless image downloads.
          </p>
          <div class="flex justify-center">
            <a
              href="#"
              class="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700 inline-block"
            >
              Install Extension
            </a>
          </div>
        </div>
      </div>

      <div className="pb-8 mt-12">
        <div className="text-xl font-bold text-center text-gray-800 mb-4">
          <h4>🤔 Questions or suggestions? Contact Us</h4>
        </div>
        <p className="text-black flex justify-center">
          Found a bug or need more features? Contact us at{" "}
          <a
            href="mailto:hey@typeflo.io"
            className="text-blue-500 hover:text-blue-700 ml-2"
          >
            hey@typeflo.io
          </a>
        </p>
      </div>
    </main>
  );
};

export default IndexPage;
