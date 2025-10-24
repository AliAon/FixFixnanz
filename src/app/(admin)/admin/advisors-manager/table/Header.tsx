import Image from "next/image";
import Link from "next/link";
import { LiaTimesSolid } from "react-icons/lia";

const Header: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-4xl font-semibold text-[#32325D] mb-6">
        Free Advisors
      </h1>

      <div className="flex items-center xsm:items-end sm:items-end sm:flex-col xsm:flex-col justify-between">
        <div className="flex items-center mx-4 space-x-2">
          <Link href="">
            <Image
              src="/images/icons/file.png"
              alt="file"
              width={80}
              height={80}
            />
          </Link>
          <Link href="">
            <Image
              src="/images/icons/email.png"
              alt="email"
              width={80}
              height={80}
            />
          </Link>
        </div>

        <button
          className="border border-primary bg-white text-primary hover:bg-primary hover:text-white duration-150 rounded-md px-4 py-2 flex items-center"
          type="button"
        >
          <LiaTimesSolid size={24} className="mr-2 font-bold" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default Header;
