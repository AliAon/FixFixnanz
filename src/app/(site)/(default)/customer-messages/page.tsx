"use client";
import React, { useState, useRef, useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { FaCamera } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { SlOptionsVertical } from "react-icons/sl";

interface Message {
  id: number;
  text: string;
  sender: "user" | "support";
  time: string;
}

const MessagesPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Willkommen bei Fixfinanz",
      sender: "support",
      time: "vor 1 Woche",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Modified scroll function that uses the container ref instead of a specific element
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  // First useEffect for initial scroll - runs once on component mount
  useEffect(() => {
    // Short delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Second useEffect for scrolling when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    const newMsg: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      time: "gerade eben",
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    if (selectedFile) {
      console.log("Sending message with file:", selectedFile.name);
      setSelectedFile(null);
    }
  };

  return (
    <div>
      <div className="px-4 py-2 bg-[#212529] text-white rounded-t-xl">
        <h2 className="text-md font-roboto ">Meine Nachrichten</h2>
      </div>
      {/* Changed h-screen to h-[calc(100vh-3rem)] to fix scroll issues */}
      <div className="flex h-[calc(100vh-3rem)] sm:flex-col xsm:flex-col xsm:gap-6 gap-2 bg-[#DFDFDF] px-2 py-5">
        <div className="w-72 sm:h-full sm:w-full xsm:h-full xsm:w-full bg-white rounded-xl border-gray-200 relative ">
          <div className="">
            <div className="p-6 bg-base rounded-t-xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Suchen..."
                  className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
                <button className="absolute right-2 bg-transparent border-none -top-1 text-gray-400">
                  <BiSearch size={24} fill="#000" />
                </button>
              </div>
            </div>
            <div className="p-4 shadow-md border-gray-20 cursor-pointer">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/agent-2.jpg"
                    alt=""
                    className="border-[3px] border-[#386EA3] rounded-full"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-[20px] font-roboto text-black">
                    Support Team
                  </h3>
                  <p className="text-[13px] font-roboto pt-1">is it working</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 w-full p-4">
              <button className="bg-base w-full text-[16px] font-roboto text-center py-2">
                Support
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 flex xsm:w-full flex-col rounded-xl">
          <div className="px-4 pt-4 pb-[18px] bg-base text-white rounded-t-xl border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/agent-2.jpg"
                  alt=""
                  className="border-[3px] border-[#386EA3] rounded-full"
                />
              </div>
              <div className="ml-3">
                <h3 className="font-roboto text-[20px]">Support Team</h3>
                <p className="text-[13px] font-roboto">8 Messages</p>
              </div>
            </div>
            <button className="bg-transparent border-none text-white">
              <SlOptionsVertical size={24} />
            </button>
          </div>

          {/* Added fixed height and ref to this container */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-white h-[calc(100%-12rem)]"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "support" && (
                  <div className="w-10 h-10 mr-3 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/agent-2.jpg"
                      alt=""
                      className="border-[3px] border-[#386EA3] rounded-full"
                    />
                  </div>
                )}
                <div className="max-w-xs">
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-base text-white rounded-[24px]"
                        : "bg-[#1477BC] text-white rounded-[24px]"
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                </div>
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 ml-2">
                    <span>U</span>
                  </div>
                )}
              </div>
            ))}
            {/* Removed the separate messagesEndRef div */}
          </div>

          <div className="p-2 bg-white border-t border-gray-200 flex justify-start space-x-2">
            <button className="px-3 py-2 text-[15px] bg-[#5549D2] text-white rounded-[20px]">
              Mein Kalender
            </button>
            <button className="px-3 py-2 text-[15px] bg-[#5549D2] text-white rounded-[20px]">
              Profil vervollständen
            </button>
          </div>

          <div className="px-4 py-2 bg-[#F7F7F7]">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <button
                type="button"
                className="py-2 px-2 bg-base rounded-l-xl rounded-r-none border-none"
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                      const file: File = e.target.files[0];
                      console.log("File selected:", file);

                      setSelectedFile(file);

                      setNewMessage(
                        (prev) =>
                          prev + (prev ? " " : "") + `[File: ${file.name}]`
                      );

                      e.target.value = "";
                    }
                  }}
                  multiple={false}
                />
                <label
                  htmlFor="file-upload"
                  className="text-[#CCCCCC] py-2 cursor-pointer"
                >
                  <FaCamera size={28} />
                </label>
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Gebe eine Nachricht ein..."
                className="flex-1 px-4 py-[18px] outline-none bg-[#DDDCDC]"
              />
              <button
                type="submit"
                className="px-2 py-[15px] bg-base rounded-l-none text-[#CCCCCC] rounded-r-xl"
              >
                <IoIosSend size={30} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
