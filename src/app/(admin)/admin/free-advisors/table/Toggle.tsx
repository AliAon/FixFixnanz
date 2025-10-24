import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`w-10 h-5 rounded-full p-0 duration-150 ${
        checked ? "bg-blue-600" : "bg-gray-400"
      } relative focus:outline-none`}
      type="button"
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute w-3 h-3 bg-white rounded-full top-1 transition-transform ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
};

export default Toggle;
