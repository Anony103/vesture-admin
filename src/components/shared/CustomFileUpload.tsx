import React, { ChangeEvent, useState } from "react";

import { BarLoader } from "react-spinners";
import fileicon from "../../assets/fileicon.svg";
interface UploadProps {
  label: string;
  description: string;
  handleFileRemove?: () => void;
  handleFileChange: (
    event: ChangeEvent<HTMLInputElement>,
    field: string
  ) => void;
  isLoading?: boolean;
  handleUpload?: () => void;
  file?: File | null;
  handleDrop?: (event: React.DragEvent<HTMLElement>) => void;
  sampleDownload?: string;
  uploading ?: boolean;
  field: string;
}

const CustomFileUpload = ({
  label,
  description,
  handleFileRemove,
  handleFileChange,
  //   isLoading,
  //   handleUpload,
  file,
  handleDrop,
  sampleDownload,
  uploading,
  field,
}: UploadProps) => {
  const [dragging, setDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent<HTMLElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (handleDrop) handleDrop(e);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Heading */}
      <div>
        <h1 className="text-sm font-semibold text-[#595959]">{label}</h1>
        <p className="text-xs text-[#8C8C8C]">{description}</p>
      </div>

      {/* Upload area */}
      <label
        htmlFor={`file-upload-${field}`}
        className={`flex flex-col justify-center items-center h-[180px] border border-dotted rounded w-full mt-2 cursor-pointer transition 
          ${dragging ? "opacity-60 border-[#7C2EBF]" : "border-[#A8A8A8]"}`}
        onDrop={onDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="mx-auto w-[60%] text-center flex flex-col gap-2 items-center">
          <img src={fileicon} alt="fileIcon" className="item-center text-sm " />
          <p className="text-[#E4E4E4] font-medium text-sm">
            Click to upload or drag and drop file here
          </p>
        </div>

        <input
          id={`file-upload-${field}`}
          type="file"
          accept=".xls,.xlsx , .csv"
          onChange={(e) => handleFileChange(e, field)}
          className="hidden"
        />
      </label>

      {/* Loader */}
      {uploading && (
        <div className="mt-2 w-full">
          <BarLoader color="#7C2EBF" width="100%" />
        </div>
      )}

      {/* Selected file */}
      {file && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <button
            onClick={handleFileRemove}
            className="rounded-md text-red-500 hover:text-red-700"
          >
            ✕
          </button>
          <span className="text-[#434343]">Selected:</span>
          <span className="text-[#7C2EBF] font-semibold">{file.name}</span>
        </div>
      )}

      {/* Download sample */}
      {sampleDownload && (
        <div className="mt-2">
          <span className="flex flex-col md:flex-row text-[#434343] text-sm flex gap-1">
            Click{" "}
            <a
              href={sampleDownload}
              download
              className="text-[#7C2EBF] cursor-pointer hover:underline"
            >
              here to download
            </a>{" "}
            <p>a sample of the acceptable spreadsheet</p>
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomFileUpload;
