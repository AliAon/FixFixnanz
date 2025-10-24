"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaCheckSquare } from "react-icons/fa";
import Counter from "../shared/counter";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/redux/slices/categoriesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import Button from "../shared/Button";

interface Category {
  id: number | string;
  name: string;
}

interface HeroProps {
  categories?: Category[];
}

const SearchForm: React.FC = () => {
  const [searchKey, setSearchKey] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!searchKey.trim()) return;

    const query = encodeURIComponent(searchKey.trim());
    router.push(`/experts?query=${query}`);
  };

  return (
    <div className="mg-top-10" data-aos="fade-up" data-aos-delay="400">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 mb-8"
      >
        <div className="flex w-full max-w-[550px] rounded-xl items-center justify-between bg-white p-1">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/search-icon.svg"
                alt="Search"
                width={20}
                height={20}
              />
            </div>
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Financial experts find:"
              className="max-w-[300px] w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#002B4E]"
            />
          </div>

          {/* Buttons for mobile/desktop */}
          <div className="block sm:hidden xsm:hidden">
            <Button text="Financial experts search" className="text-sm px-4" />
          </div>
          <div className="hidden sm:block xsm:block">
            <Button text="Search" className="px-4" />
          </div>
        </div>
      </form>
    </div>
  );
};

const Hero: React.FC<HeroProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { categories: reduxCategories } = useSelector(
    (state: RootState) => state.categories
  );

  useEffect(() => {
    dispatch(fetchCategories());
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, [dispatch]);

  const displayedCategories = reduxCategories?.filter((cat) =>
    [
      "Versicherungen",
      "Baufinanzierung",
      "Gewerbeversicherung",
      "Geldanlage",
    ].includes(cat.name)
  );

  return (
    <div className="max-w-[1330px] mx-auto px-[22px] sm:px-[20px] xsm:px-[20px] mt-[150px] mb-16">
      <div className="flex flex-col lg:flex-row items-center">
        <div className="w-full lg:w-6/12">
          <div className="inflanar-hero__inside relative">
            <div className="inflanar-hero__inner xsm:mt-8">
              {/* Hero Content */}
              <div data-aos="fade-up" data-aos-delay="300">
                <span className="text-[18px] text-[#353535] font-normal mb-4 block font-ppagrandir">
                  GERMANY FINANCIAL PLATFORM{" "}
                </span>
                <h2 className="text-[45px] sm:text-[40px] xsm:text-[25px] font-roboto font-bold text-[#002B4E] leading-none mb-5">
                  THE SMART SOLUTION
                </h2>
                <h2 className="text-[45px] sm:text-[40px] xsm:text-[25px] font-roboto font-bold text-[#002B4E] leading-none mb-5">
                  FOR BEST PRICES AT
                </h2>
                <h3 className="text-[45px] sm:text-[40px] xsm:text-[25px] font-roboto font-bold text-[#002B4E] leading-none mb-3">
                  INSURANCE & FINANCE
                </h3>
              </div>

              <p
                className="text-[18px] text-[#6E7482] font-ppagrandir mb-0"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                It&apos;s that easy:
              </p>
              <ul
                className="list-none space-y-1 mb-6"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <li className="flex items-center space-x-2 text-[18px] font-medium w-full max-w-[290px] justify-between">
                  <span>Find the right financial partner</span>
                  <FaCheckSquare className="text-[#2CB52C]" size={22} />
                </li>
                <li className="flex items-center space-x-2 text-[18px] font-medium w-full max-w-[290px] justify-between">
                  <span>Simply upload contracts</span>
                  <FaCheckSquare className="text-[#2CB52C]" size={22} />
                </li>
                <li className="flex items-center space-x-2 text-[18px] font-medium w-full max-w-[290px] justify-between">
                  <span>Compare insurance & save</span>
                  <FaCheckSquare className="text-[#2CB52C]" size={22} />
                </li>
              </ul>

              <SearchForm />
              <div className="mb-12" data-aos="fade-up" data-aos-delay="500">
                <span className="block mb-4 font-medium text-secondary font-roboto">
                  Popular search
                </span>
                <ul className="flex flex-wrap gap-2">
                  {displayedCategories?.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/finanzexperten?category_id=${category.id}&name=${category.name}`}
                        className="inline-block px-4 py-1 hover:bg-[#1879BD] text-[333333] hover:text-white text-[15px] bg-white border border-gray-200 rounded-md transition-all"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="flex items-center space-x-4 mb-0 mt-6"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <ul className="flex -space-x-4">
                  {[
                    "agent.png",
                    "agent-2.jpg",
                    "agent-3.jpg",
                    "agent1.png",
                    "agent1.png",
                  ].map((img, index) => (
                    <li
                      key={index}
                      className="relative transform transition-all duration-300 hover:scale-90 hover:-translate-x-1"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/${img}`}
                        alt={`User ${index + 1}`}
                        width={85}
                        height={85}
                        className="cursor-pointer rounded-full border-2 border-white"
                      />
                    </li>
                  ))}
                </ul>
                <div className="font-medium">
                  <Counter
                    end={2465}
                    duration={3000}
                    className="font-bold text-[25px] text-secondary"
                  />
                  <p className="text-[#6B7788]">Verified Financial experts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="w-full lg:w-5/12 mt-8 lg:mt-0"
          data-aos="fade-left"
          data-aos-delay="700"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero.png"
            alt="Hero"
            width={800}
            height={600}
            className="w-full lg:min-w-[600px] xl:min-w-[650px] md:min-w-[650px] object-cover h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
