import React, { useState, useRef } from "react";
import { Editor } from "primereact/editor";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface Placeholder {
  key: string;
  label: string;
}

const AVVertagView = () => {
  const placeholders: Placeholder[] = [
    { key: "[first_name]", label: "first name" },
    { key: "[last_name]", label: "last name" },
    { key: "[email]", label: "email" },
    { key: "[number]", label: "number" },
    { key: "[address]", label: "address" },
    { key: "[company]", label: "company" },
  ];

  const initialContent = `
    <h1 style="text-decoration: underline; font-weight: bold;">Vertrag über die Verarbeitung von Daten im Auftrag</h1>
    <p>Customer name : <span style="color: red; text-decoration: underline;">[first_name]</span> <span style="color: red; text-decoration: underline;">[last_name]</span></p>
    <ol>
      <li>Address : <span style="color: red;">[address]</span></li>
      <li>Email : <span style="color: red;">[email]</span></li>
      <li>Phone: <span style="color: red;">[number]</span></li>
    </ol>
    <p></p>
    <p></p>
    <h2 style="font-weight: bold; text-decoration: underline;">1. Allgemeines</h2>
    <p>(1) Der Auftragnehmer verarbeitet personenbezogene Daten im Auftrag des Auftraggebers i.S.d. Art. 4 Nr. 8 und Art. 28 der Verordnung (EU) 2016/679 – Datenschutz...</p>
  `;

  const [text, setText] = useState(initialContent);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

  const insertPlaceholder = (placeholder: string) => {
    if (editorRef.current) {
      const editor = editorRef.current.getQuill();
      const range = editor.getSelection();
      if (range) {
        editor.insertText(range.index, placeholder, {
          color: "#ff0000",
          underline: true,
        });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-6">AV Vertrag Text</h1>

      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">Placeholder Variables</h2>
        <div className="flex flex-wrap gap-2">
          {placeholders.map((placeholder) => (
            <div
              key={placeholder.key}
              onClick={() => insertPlaceholder(placeholder.key)}
              className="bg-[#002D51] text-white p-1 text-xs font-bold rounded "
            >
              [{placeholder.label}]
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-300 rounded-md">
        <Editor
          ref={editorRef}
          value={text}
          onTextChange={(e) => setText(e.htmlValue || "")}
          style={{ height: "400px" }}
        />
      </div>

      <div className="flex justify-end mt-4">
        <button className="bg-[#002D51] text-white py-2 px-8 rounded ">
          Update
        </button>
      </div>
    </div>
  );
};

export default AVVertagView;
