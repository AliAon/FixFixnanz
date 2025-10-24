"use client";
import ToolEditor from "@/components/editor/ToolEditor";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createEmailSignature,
  fetchEmailSignatures,
  deleteEmailSignature,
  updateEmailSignature,
  EmailSignature,
} from "@/redux/slices/emailSignatureSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { toast, ToastContainer } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";

const EmailSignatureEditor: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { signatures } = useSelector(
    (state: RootState) => state.emailSignature
  );
  const avatarUrl = useSelector((state: RootState) => state.auth.user?.avatar_url);
  const [signatureTitle, setSignatureTitle] = useState<string>("");
  const [editorContent, setEditorContent] = useState<string>("");
  // const editorRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchEmailSignatures());
  }, [dispatch]);

  const handleSave = async ({
    title,
    signature,
  }: {
    title: string;
    signature: string;
  }) => {
    try {
      if (editingId) {
        await dispatch(
          updateEmailSignature({ id: editingId, data: { title, signature } })
        ).unwrap();
        toast.success("Signature updated successfully!");
        setEditingId(null);
      } else {
        await dispatch(createEmailSignature({ title, signature })).unwrap();
        dispatch(fetchEmailSignatures());
        toast.success("Signature stored successfully!");
      }
      setSignatureTitle("");
      setEditorContent("");
    } catch (err) {
      console.log(err);
      toast.error("Failed to save signature");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteEmailSignature(id)).unwrap();
      toast.success("Signature deleted successfully!");
    } catch {
      toast.error("Failed to delete signature");
    }
  };

  const handleEdit = (sig: EmailSignature) => {
    setSignatureTitle(sig.title);
    setEditorContent(sig.signature);
    setEditingId(sig.id || null);
  };

  return (
    <div className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <h1 className="text-[27px] font-semibold text-primary mb-8">
        My email signatures
      </h1>

      <div className="flex w-full gap-8">
        <div className="space-y-6 w-full max-w-[500px]">
          <div>
            <label htmlFor="title" className="block text-md text-pretty  mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Signature Title"
              value={signatureTitle}
              onChange={(e) => setSignatureTitle(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center flex-wrap gap-2">
            <label className="block text-md text-primary  mb-2">
              Name signature
            </label>
            <button
              onClick={() => {
                setEditorContent(`
                  <table style="width:100%;font-family:Arial,sans-serif;font-size:15px;">
                    <tr>
                      <td style="vertical-align:top;padding-right:12px;">
                        <img src="${avatarUrl || 'https://via.placeholder.com/80x80.png?text=Profile+Image'}" alt="Profile Image" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:1px solid #ccc;" />
                      </td>
                      <td style="vertical-align:top;">
                        <div style="font-weight:bold;font-size:18px;color:#222;">Your Name</div>
                        <div style="margin:4px 0 0 0;">Mobile: <span style="color:#555;">+49 123 456789</span></div>
                        <div>Email: <span style="color:#555;">your@email.com</span></div>
                        <div>Website: <span style="color:#555;">yourwebsite.com</span></div>
                        <div>Address: <span style="color:#555;">Your Address Here</span></div>
                      </td>
                    </tr>
                  </table>
                `);
              }}
              className="w-full max-w-[320px] bg-[#212529] text-white py-2 px-2 rounded-md hover:bg-[#424649] transition"
            >
              E-Mail Signatur automatisch erstellen
            </button>
          </div>

          <div className="border border-gray-300 rounded-md">
            <ToolEditor onContentChange={setEditorContent} content={editorContent} />
          </div>
          <div className="flex justify-end ">
            <button
              className="py-2 px-3 hover:bg-green-700 duration-150 border-none bg-[#198754]"
              onClick={() =>
                handleSave({ title: signatureTitle, signature: editorContent })
              }
            >
              Speichern
            </button>
          </div>
        </div>

        <div className="border border-gray-300 rounded-md w-full overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-300 p-4 text-left">#</th>
                <th className="border-b border-gray-300 p-4 text-left">
                  Titel
                </th>
                <th className="border-b border-gray-300 p-4 text-left">
                  Signatur
                </th>
                <th className="border-b border-gray-300 p-4 text-left">
                  Option
                </th>
              </tr>
            </thead>
            <tbody>
              {signatures.map((sig) => (
                <tr key={sig.id} className="hover:bg-gray-50">
                  <td className="border-b border-gray-300 p-4">{sig.id}</td>
                  <td className="border-b border-gray-300 p-4">{sig.title}</td>
                  <td className="border-b border-gray-300 p-4">
                    <div
                      style={{
                        maxHeight: '3.5em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                        whiteSpace: 'nowrap'
                      }}
                      dangerouslySetInnerHTML={{ __html: sig.signature }}
                    />
                  </td>
                  <td className="border-b border-gray-300 p-4">
                    <div className="flex gap-2">
                      <button
                        className="bg-sky-400 hover:bg-sky-500 text-black p-2 rounded"
                        onClick={() => handleEdit(sig)}
                        title="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-black p-2 rounded"
                        onClick={() => handleDelete(sig.id || "")}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {signatures.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border-b border-gray-300 p-4 text-center text-gray-500"
                  >
                    No signatures created yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmailSignatureEditor;
