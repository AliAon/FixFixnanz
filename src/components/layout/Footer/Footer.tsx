"use client";
import ReCard from "@/components/sections/ReCard";
import React from "react";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa6";

interface SocialIconProps {
  Icon: React.ComponentType<{ size: number }>;
}

const SocialIcon: React.FC<SocialIconProps> = ({ Icon }) => (
  <div className="hover:text-[#14637D] duration-300 cursor-pointer">
    <Icon size={22} />
  </div>
);

const Footer: React.FC = () => {
  const socialIcons: Array<{
    Icon: React.ComponentType<{ size: number }>;
  }> = [{ Icon: FaInstagram }, { Icon: FaLinkedin }, { Icon: FaFacebook }];

  return (
    <>
      <div className="">
        <div className="relative translate-y-1/2 z-20 -mt-44 sm:hidden xsm:hidden">
          <ReCard />
        </div>
        <div
          className="relative w-full min-h-screen sm:min-h-fit xsm:min-h-fit bg-cover bg-center px-5"
          style={{ backgroundImage: "url('/images/footer-bg.svg')" }}
        >
          <div className="flex items-start max-w-[1330px] md:mt-16 lg:mt-16 xl:mt-16 mx-auto justify-between w-full pt-40 sm:pt-14 xsm:pt-8 sm:flex-wrap xsm:flex-wrap sm:gap-8">
            <div className="space-y-6 xsm:space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Company Logo" className="w-[120px]" />
              <h1 className="text-white font-roboto text-xl font-bold pt-6 xsm:pt-0">
                Germany&apos;s platform for <br className="xsm:hidden" />
                Financial experts
              </h1>
              <div className="flex flex-col xsm:flex-row gap-2">
                <span className="font-roboto text-lg text-white font-normal">
                  Contact:
                </span>
                <Link
                  href="mailto:contact@fixfinanz.de"
                  className="font-roboto text-lg text-white font-normal hover:text-[#14637D] duration-300 cursor-pointer"
                >
                  contact@Fixfinanz.de
                </Link>
              </div>
            </div>

            <div className="sm:w-full xsm:w-full">
              <h1 className="text-white font-roboto text-3xl font-bold pt-6">
                Quick Links
              </h1>
              <div className="flex items-start xsm:gap-3 justify-between sm:px-0 xsm:px-0 px-4 pt-8 xsm:pt-4">
                <div className="text-white flex flex-col font-roboto text-md space-y-3 w-[180px]">
                  <a
                    href=""
                    className="hover:text-[#14637D] hover:underline hover:pl-2 duration-300"
                  >
                    Imprint
                  </a>
                  <a
                    href=""
                    className="hover:text-[#14637D] hover:underline hover:pl-2 duration-300"
                  >
                    Our Facebook group
                  </a>
                  <a
                    href=""
                    className="hover:text-[#14637D] hover:underline hover:pl-2 duration-300"
                  >
                    News
                  </a>
                  <a
                    href=""
                    className="hover:text-[#14637D] hover:underline hover:pl-2 duration-300"
                  >
                    Our Partners
                  </a>
                </div>
                <div className="text-white flex flex-col font-roboto text-md space-y-3 w-[180px]">
                  <a
                    href=""
                    className="hover:text-[#14637D] hover:underline hover:pl-2 duration-300"
                  >
                    Data Protection
                  </a>
                  <a
                    href=""
                    className="hover:text-[#14637D] hover:underline hover:pl-2 duration-300"
                  >
                    Terms and Conditions
                  </a>
                  <a
                    href=""
                    className="hover:text-[#14637D] hover:underline hover:pl-2 duration-300"
                  >
                    Book now
                  </a>
                  <a
                    href=""
                    className="hover:text-[#14637D] hover:underline hover:pl-2 duration-300"
                  >
                    Our awards
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start justify-start xl:w-[400px] lg:w-[400px] sm:w-full xsm:w-full">
              <div>
                <h1 className="text-white font-roboto text-3xl font-bold pt-6">
                  Support Times
                </h1>
                <ul className="list-disc text-white pl-4 flex flex-col font-roboto text-lg space-y-3 pt-8">
                  <li>Support</li>
                  <li>Mon - Fri: 9:00 a.m. - 5:00 p.m.</li>
                  <li>Saturdays: 9 a.m. - 12 p.m.</li>
                </ul>
              </div>
              <div>
                <h1 className="text-white font-roboto text-3xl font-bold pt-6">
                  Our location
                </h1>
                <p className="text-white flex flex-col font-roboto text-lg space-y-3 pt-8">
                  Krönerstraße 44 , 04318 <br />
                  Leipzig Saxony
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-[1330px] mx-auto relative text-white w-full mt-16 sm:mt-8 xsm:mt-8 pb-4">
            <div className="border-t border-[#344552] mx-4 mb-4"></div>
            <div className="flex items-center justify-between px-4 py-4 w-full sm:flex-col sm:gap-4 xsm:flex-col xsm:gap-4">
              <h1 className="font-roboto font-normal text-lg xsm:text-md text-white text-center">
                Copyright @ 2025 All rights reserved Fixed finance
              </h1>
              <div className="flex gap-8 items-center">
                {socialIcons.map((social, index) => (
                  <SocialIcon key={index} Icon={social.Icon} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
