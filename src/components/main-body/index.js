import React, { useState } from "react";
import { Gallery } from "react-grid-gallery";
import { FaArrowRightLong, FaDownload } from "react-icons/fa6";
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
    if (!url.trim()) {
      showError("Please paste a Google Docs URL");
      return;
    }
    if (!docsId) {
      showError("Please paste a valid Google Docs URL.");
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

      const fetchedImgs = data.images.map((image, index) => ({
        src: image,
        thumbnail: image,
        thumbnailWidth: 320,
        thumbnailHeight: 212,
        isSelected: false,
        customOverlay: (
          <div className="overlay flex justify-end items-end absolute bottom-0 right-0 p-4">
            <a
              href={image}
              download="image.jpg"
              className="download-btn"
            >
              <FaDownload />
            </a>
          </div>
        ),
      }));
      setImages(fetchedImgs);
      toast.success("Images fetched successfully!");
    } catch (error) {
      console.error("Error fetching images:", error);
      showError("Error fetching images. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (errorMessage) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };


  const handleImageDownload = async (index) => {
    try {
      const imageUrl = images[index].src; // Get the image URL from the images array
      console.log("Image URL:", imageUrl);
      if (typeof imageUrl !== "string") {
        throw new Error("Invalid image URL");
      }
  
      const response = await fetch(imageUrl);
      const blob = await response.blob();
  
      // Get the image extension dynamically
      const imgExtMatch = imageUrl.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
      let imgExt = 'jpg'; // Default to jpg if extension cannot be extracted
      if (imgExtMatch) {
        imgExt = imgExtMatch[1];
      }
  
      // Create a blob URL for the image blob
      const blobUrl = URL.createObjectURL(blob);
  
      // Create an anchor element to trigger the download
      const link = document.createElement("a");
      link.href = blobUrl;
  
      // Set appropriate download file name based on image extension
      let fileName = "image";
      if (imgExt) {
        fileName += `.${imgExt}`;
      }
  
      link.setAttribute("download", fileName);
      link.style.display = "none";
  
      // Append the anchor element to the document body
      document.body.appendChild(link);
  
      // Simulate click event to trigger the download
      link.click();
  
      // Remove the anchor element from the document body
      document.body.removeChild(link);
  
      // Clean up the object URL after download
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading image:", error);
      showError("Error downloading image. Please try again.");
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

  const handleDownloadZip = () => {
    const selectedImages = images.filter((image) => image.isSelected);
    if (selectedImages.length === 0) {
      showError("Please select images to download.");
      return;
    }
  
    const zip = new JSZip();
    const promises = selectedImages.map((image, index) => {
      return fetch(image.src)
        .then((response) => response.blob())
        .then((blob) => {
          zip.file(`image_${index + 1}.jpg`, blob);
        })
        .catch((error) => {
          console.error("Error downloading image:", error);
          showError("Error downloading images. Please try again.");
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
        showError("Error downloading images. Please try again.");
      });
  };
  

  
  return (
    <main className="bg-white flex flex-col justify-between min-h-screen pt-16">
      <div className="px-4 py-8 md:px-8 lg:px-16 xl:px-32 flex-grow">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-bold text-center text-black mb-4">
            Google Docs Image Downloader
          </h1>
          <p className="text-center text-gray-700 mb-8">
            Download docs images in a single click. Try it now to streamline
            your processes & save time.
          </p>
          <form
            className="flex flex-col sm:flex-row items-center justify-between mb-8"
            onSubmit={handleSubmit}
          >
            <input
              type="url"
              placeholder="https://docs.google.com/document/d/xxxxxxxxx_xxxxxxxx/edit"
              className="text-black max-w-lg w-full px-4 py-2 hover:border-black border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mb-4 sm:mb-0 sm:mr-4 placeholder-gray-500 placeholder-opacity-100"
              value={url}
              onChange={handleInputChange}
            />
            {images.length === 0 && (
              <button
                type="submit"
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-purple-500 focus:outline-none focus:bg-blue-700 mt-2 sm:mt-0"
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
                  "Submit"
                )}
                {!loading && <FaArrowRightLong className="ml-2" />}
              </button>
            )}
          </form>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>

      {images.length > 0 && (
        <div className="px-4 md:px-8 lg:px-16 xl:px-32">
          <Gallery
            images={images}
            onClick={(index) => handleImageDownload(index)}
          />
        </div>
      )}

      {images.length > 0 && (
        <div className="bg-white p-4 flex justify-center  w-full ">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4 mr-4"
            onClick={handleSelectAll}
          >
            {selectAll ? "Deselect All" : "Select All"}
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
            onClick={handleDownloadZip}
          >
            Download (ZIP)
          </button>
        </div>
      )}
    </main>
  );
};

export default IndexPage;
