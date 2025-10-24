// components/notification/TestEmailDialog.tsx
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import Link from "next/link";
import { Editor as PrimeEditor } from "primereact/editor";
import { toast } from "react-toastify";
import api from "@/redux/api/axiosConfig";
import { EmailTemplate } from "./TemplateCard";

interface TestEmailDialogProps {
  setEffectChange: (value: string) => void;
  editorRef: React.RefObject<PrimeEditor>;
  template: EmailTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  setbodyContent: (value: string) => void;
  emailContent: string;
  emails: string[];
}

const header = () => {
  return `<div class="lop" style="background-color: #101d48; pointer-events: none; color: white; padding: 8px; margin-bottom: 16px; text-align: center;"><h3 class="lop" style="font-weight: bold; padding: 8px; width: 100%;">FixFinanz</h3></div>`;
}

const footer = () => {
  return `<div style="background-color: #101d48; pointer-events: none; color: white; padding: 16px 8px 8px 8px; text-align: center; margin-top: 24px;">
  <div style="margin-bottom: 4px;">Best regards,</div>
  <div>The FixFinanz Team</div>
  <div style="font-size: 13px;">Copyright © 2024 FixFinanz. All rights reserved.</div>
</div>`;
}

const TestEmailDialog: React.FC<TestEmailDialogProps> = ({
  editorRef,
  setbodyContent,
  isOpen,
  onClose,
  subject,
  emailContent,
  emails
}) => {
  const [recipient, setRecipient] = useState("");

  if (!isOpen) return null;

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const sendTestEmail = () => {
    if (!recipient) {
      toast.error("Please enter a recipient email address.");
      return;
    }

    api.post("/notifications/test-notification", {
      email: recipient,
      subject: subject,
      body: emailContent,
      ccEmails: emails,
    })
      .then((response) => {
        console.log(response.data);
        toast.success("Test email sent successfully!");
        onClose();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to send test email");
      });
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto py-10"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-md shadow-lg w-full max-w-xl my-auto">
        <div className="flex justify-between items-center border-b p-4 bg-white z-10">
          <h2 className="text-2xl font-medium text-[#32325D]">
            Send test Email
          </h2>
          <Link
            href=""
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </Link>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm mb-2 text-primary">
              Recipient:
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="empfang@email.de"
              className="w-full p-[6px] border border-gray-300 outline-none rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2 text-primary">Reference:</label>
            <input
              type="text"
              value={subject}
              className="w-full p-[6px] border border-gray-300 outline-none rounded"
              readOnly
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-2">News:</label>
            <div className="border rounded">
              <PrimeEditor
                ref={editorRef}
                value={(() => {
                  // If content already has the header/footer structure, return as is
                  if (emailContent.startsWith(`<h3 class="ql-align`) || emailContent.includes('class="lop"')) {
                    return emailContent;
                  }
                  
                  // If emailContent is empty, just return header and footer
                  if (!emailContent.trim()) {
                    return `${header()} ${footer()}`;
                  }
                  
                  // Format the content with proper paragraph styling
                  const formattedContent = emailContent
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map(line => `<p style="font-size: medium; color: rgb(0, 0, 0); font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Oxygen, Ubuntu, Cantarell, &quot;Open Sans&quot;, &quot;Helvetica Neue&quot;, sans-serif;">${line}</p>`)
                    .join('\n');
                  
                  return `${header()} ${formattedContent} ${footer()}`;
                })()}
                onTextChange={(e) => {
                  setbodyContent(e.htmlValue || "");
                }}
                style={{ height: "200px" }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
            <button onClick={sendTestEmail} className="px-3 py-2 bg-[#212529] text-white rounded hover:bg-[#424649]">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEmailDialog;