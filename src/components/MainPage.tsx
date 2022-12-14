import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";
import Router from "next/router";
import { formatString } from "../utils/utils";

export default function MainPage() {
  const [file, setFile] = useState<File>();
  const [s3GetPromiseUrl, setS3GetPromiseUrl] = useState<string>("");

  useEffect(() => {
    var s3FileKey = localStorage.getItem("s3FileKey");
    var s3FileFormat = localStorage.getItem("s3FileFormat");

    // Get image from Amazon s3 if file loaded
    if (s3FileKey !== "" && s3FileKey && s3FileFormat !== "" && s3FileFormat) {
      axios
        .post("/api/aws/s3/get_file", {
          file_key: s3FileKey,
          type: s3FileFormat,
        })
        .then((response) => setS3GetPromiseUrl(response.data.url))
        .catch((error) => console.log(error.message));
    } else {
      setS3GetPromiseUrl("");
    }
    localStorage.clear();
  }, []);

  async function handleUploadFile() {
    var date = new Date();
    var formattedDate = format(date, "yyyy-M-dd");

    // If file selected: load file to AWS
    if (file) {
      // Send file to AWS
      var fileKey = `mydata/date=${formattedDate}/${formatString(file.name)}`;
      var fileType = file.type;

      let { data } = await axios.post("/api/aws/s3/upload_file", {
        file_key: fileKey,
        type: fileType,
      });

      const uploadUrl = await data.url;

      console.log("URL upload: ", uploadUrl, "to upload file: ", file);

      await axios.put(uploadUrl, file, {
        headers: {
          "Content-type": fileType,
          "Access-Control-Allow-Origin": "*",
        },
      });

      Router.reload();

      localStorage.setItem("s3FileKey", fileKey);
      localStorage.setItem("s3FileFormat", fileType);

      setFile(undefined);
    }
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-6">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-4xl font-extrabold dark:text-white">
            How to interact with Amazon S3 using NextJS App
          </h2>
          <div className="mx-auto mb-8 max-w-screen-sm text-center lg:mb-16"></div>
          <form>
            <div className="mb-6">
              <label
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                htmlFor="file_input"
              >
                Upload file
              </label>
              <input
                className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400"
                aria-describedby="file_input_help"
                id="file_input"
                type="file"
                onChange={(e) => {
                  if (e.target.files !== null) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </div>
            <button
              type="button"
              className="mr-2 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              onClick={handleUploadFile}
            >
              Upload
            </button>
          </form>
          <hr className="my-8 h-px bg-gray-200 border-0 dark:bg-gray-700"></hr>
          <div>
            <figure className="max-w-lg">
              <img
                className="max-w-full h-auto rounded-lg"
                src={s3GetPromiseUrl}
                alt="image loaded in Amazon S3"
              />
              <figcaption className="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">
                Image loaded on Amazon S3
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </>
  );
}
