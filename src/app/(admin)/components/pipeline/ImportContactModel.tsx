import Link from "next/link";
import React, { useState, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { importUsersFromExcel } from '@/redux/slices/usersSlice';
import { toast } from 'react-toastify';

interface ImportContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineId?: string;
  stageId?: string;
  pipelines: { id: string; name: string }[];
  stages: { id: string; name: string }[];
  onImportComplete?: (stageId?: string, count?: number) => void;
}

const ImportContactModal: React.FC<ImportContactModalProps> = ({
  isOpen,
  pipelines,
  stages,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [pipeline, setPipeline] = useState("");
  const [stage, setStage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("No file chosen");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
      ];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xls|xlsx|csv)$/i)) {
        toast.error('Invalid file type. Only Excel files are allowed');
        setFile(null);
        setFileName('No file chosen');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      setFile(null);
      setFileName('No file chosen');
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadSample = () => {
    toast.info("Sample file download not implemented.");
  };

  const handleImport = async () => {
    if (!file || !pipeline || !stage) {
      toast.error("Please select a file, pipeline, and stage.");
      return;
    }
    try {
      await dispatch(importUsersFromExcel({ file, pipeline_id: pipeline, stage_id: stage })).unwrap();
      toast.success("Users imported successfully!");
      onClose();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to import users."
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Import Contact</h2>
          <Link
            href=""
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </Link>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Pipelines</label>
              <select
                value={pipeline}
                onChange={(e) => setPipeline(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select pipeline</option>
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Stages</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select stage</option>
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label>Import file</label>
              <a
                href="#"
                onClick={handleDownloadSample}
                className="text-blue-500 hover:text-blue-700"
              >
                Download sample file
              </a>
            </div>
            <div className="flex">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv,.xlsx,.xls"
              />
              <Link
                href=""
                onClick={handleChooseFile}
                className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-l"
              >
                Choose File
              </Link>
              <div className="flex-grow border border-gray-300 border-l-0 rounded-r py-2 px-4">
                {fileName}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportContactModal;
