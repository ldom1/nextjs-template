import React, { useState } from "react";
import Link from "next/link";
import Router from "next/router";
import { format } from "date-fns";
import axios from "axios";
import { formatString } from "../utils/utils";

export default function MainPage() {
  const [file, setFile] = useState<File>();

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
          "Content-type": file.type,
          "Access-Control-Allow-Origin": "*",
        },
      });

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
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
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
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={handleUploadFile}
            >
              Upload
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
