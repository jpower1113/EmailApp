import { Upload, FileText } from 'lucide-react';
import { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void;
  isAnalyzing: boolean;
}

export function FileUpload({ onFileSelect, isAnalyzing }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileSelect(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".txt,.eml,.msg,.html"
        onChange={handleChange}
        disabled={isAnalyzing}
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center justify-center"
      >
        <div className="mb-4 p-4 bg-gray-100 rounded-full">
          {isAnalyzing ? (
            <FileText className="w-12 h-12 text-gray-400 animate-pulse" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isAnalyzing ? 'Analyzing...' : 'Drop your email or text file here'}
        </p>
        <p className="text-sm text-gray-500">
          or click to browse
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Supported formats: .txt, .eml, .msg, .html
        </p>
      </label>
    </div>
  );
}
