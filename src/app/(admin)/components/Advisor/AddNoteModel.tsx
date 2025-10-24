"use client";

import { useState } from "react";
import Link from "next/link";
import { Editor } from "primereact/editor";

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string, grade: string) => void;
}

const AddNoteModal = ({ isOpen, onClose, onSave }: AddNoteModalProps) => {
  const [note, setNote] = useState("");
  const [grade, setGrade] = useState("A");

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(note, grade);
    setNote("");
    setGrade("A");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-700">Add Note</h2>
          <Link
            href=""
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Link>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Note</label>
            <Editor
              value={note}
              onTextChange={(e) => setNote(e.htmlValue || "")}
              style={{ height: "150px" }}
              className="rounded border border-gray-300"
            />
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleSave}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNoteModal;
