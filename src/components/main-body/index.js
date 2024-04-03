User
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
    if (!url.trim()) {
       setError("Please paste a Google Docs URL");
       setError(""); 
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
      setError("Please select images to download.");
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
  

  return (
    <main className="bg-white flex flex-col min-h-screen pt-16">
      <div className="px-4 pt-8 md:px-8 lg:px-16 xl:px-32 ">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-center text-black mb-4">
          Download image Google Docs
          </h1>
          <p className="text-center text-gray-700 mb-8">
            Downloading images from Google Docs is tedious. Use this free tool
            to download images in a click!
          </p>
          <form
            className="flex flex-col sm:flex-row items-center justify-between mb-2"
            onSubmit={handleSubmit}
          >
            <input
              type="url"
              placeholder="https://docs.google.com/document/d/xxxxxxxxx_xxxxxxxx/edit"
              className="text-black max-w-lg w-full px-4 py-2 hover:border-black border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 sm:mb-0 sm:mr-4 placeholder-gray-500 placeholder-opacity-100"
              value={url}
              onChange={handleInputChange}
            />
            {isSubmitted ? ( // If submitted, show reset button
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-purple-500 focus:outline-none focus:bg-blue-700 mt-2 sm:mt-0"
              >
                Reset
              </button>
            ) : (
              // If not submitted, show submit button
              <button
  type="submit"
  className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-purple-500 focus:outline-none focus:bg-blue-700 mt-2 sm:mt-0 ${loading ? 'disabled:opacity-50 cursor-not-allowed' : ''}`}
  disabled={loading}
  style={{ whiteSpace: 'nowrap' }} // Add this inline style to prevent wrapping
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
    <>
      Download Images <FaArrowRightLong className="ml-2" />
    </>
  )}
</button>

            
            )}
          </form>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex justify-center text-gray-500 text-sm">
          Paste a Google Docs link with access level: Anyone on the internet
          with the link can view.
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
        {" "}
        {/* Add margin bottom here */}
        {images.length > 0 && (
          <div className="px-4 md:px-8 lg:px-16 xl:px-32">
            <Gallery images={images} onSelect={handleSelect} />
          </div>
        )}
      </div>
    </main>
  );
};

export default IndexPage;
