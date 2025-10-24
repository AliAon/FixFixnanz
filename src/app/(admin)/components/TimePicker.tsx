"use client";
import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = "--:-- --",
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  // const [activeTab, setActiveTab] = useState<"hour" | "minute" | "ampm">("hour");
  const [selectedHour, setSelectedHour] = useState<string>("10");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">("AM");
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const timeRegex = /^(\d{1,2}):(\d{2})\s(AM|PM)$/;
      const match = value.match(timeRegex);
      if (match) {
        setSelectedHour(match[1]);
        setSelectedMinute(match[2]);
        setSelectedPeriod(match[3] as "AM" | "PM");
      }
    }
  }, [value]);

  // Handle outside click to close picker
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const updateTime = (hour: string, minute: string, period: "AM" | "PM") => {
    const formattedTime = `${hour}:${minute} ${period}`;
    onChange(formattedTime);
  };

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    updateTime(hour, selectedMinute, selectedPeriod);
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    updateTime(selectedHour, minute, selectedPeriod);
  };

  const handlePeriodSelect = (period: "AM" | "PM") => {
    setSelectedPeriod(period);
    updateTime(selectedHour, selectedMinute, period);
  };

  // const handleTimeSlotSelect = (timeSlot: string) => {
  //   // Parse the time slot (format: "HH:MM - HH:MM")
  //   const startTime = timeSlot.split(" - ")[0];
  //   const [hour, minute] = startTime.split(":");
    
  //   // Convert hour to 12-hour format
  //   let hourNum = parseInt(hour, 10);
  //   const period = hourNum >= 12 ? "PM" : "AM";
  //   hourNum = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    
  //   const hourStr = hourNum.toString();
    
  //   setSelectedHour(hourStr);
  //   setSelectedMinute(minute);
  //   setSelectedPeriod(period);
    
  //   // Update the time
  //   updateTime(hourStr, minute, period);
  //   setShowPicker(false);
  // };

  // Available hours and minutes
  const hours = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const minutes = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"];
  
  // Time slots
  // const timeSlots = [
  //   "00:00 - 00:30",
  //   "00:30 - 01:00",
  //   "01:00 - 01:30",
  //   "01:30 - 02:00",
  //   "02:00 - 02:30",
  //   "02:30 - 03:00",
  //   "03:00 - 03:30",
  //   "03:30 - 04:00",
  //   "04:00 - 04:30",
  //   "04:30 - 05:00",
  //   "05:00 - 05:30",
  //   "05:30 - 06:00",
  //   "06:00 - 06:30",
  //   "06:30 - 07:00",
  //   "07:00 - 07:30",
  //   "07:30 - 08:00",
  //   "08:00 - 08:30",
  //   "08:30 - 09:00",
  //   "09:00 - 09:30",
  //   "09:30 - 10:00",
  //   "10:00 - 10:30",
  //   "10:30 - 11:00",
  //   "11:00 - 11:30",
  //   "11:30 - 12:00",
  //   "12:00 - 12:30",
  //   "12:30 - 13:00",
  //   "13:00 - 13:30",
  //   "13:30 - 14:00",
  //   "14:00 - 14:30",
  //   "14:30 - 15:00",
  //   "15:00 - 15:30",
  //   "15:30 - 16:00",
  //   "16:00 - 16:30",
  //   "16:30 - 17:00",
  //   "17:00 - 17:30",
  //   "17:30 - 18:00",
  //   "18:00 - 18:30",
  //   "18:30 - 19:00",
  //   "19:00 - 19:30",
  //   "19:30 - 20:00",
  //   "20:00 - 20:30",
  //   "20:30 - 21:00",
  //   "21:00 - 21:30",
  //   "21:30 - 22:00",
  //   "22:00 - 22:30",
  //   "22:30 - 23:00",
  //   "23:00 - 23:30",
  //   "23:30 - 00:00",
  // ];

  return (
    <div className="relative">
      {label && (
        <label className="text-[16px] text-primary block">{label}</label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value || ""}
          placeholder={placeholder}
          readOnly
          onClick={() => !disabled && setShowPicker(!showPicker)}
          className="w-full border rounded px-3 py-2 mt-1 pr-10 focus:outline-none focus:ring-2 focus:ring-[#C2DBFE]"
          disabled={disabled}
        />
        <Clock
          className="absolute right-3 top-1/2 transform -translate-y-1/4 text-gray-400 cursor-pointer"
          size={16}
          onClick={() => !disabled && setShowPicker(!showPicker)}
        />
      </div>

      {showPicker && (
        <div 
          ref={pickerRef} 
          className="absolute z-50 mt-1 bg-white border border-gray-300 rounded shadow-lg"
          style={{ width: "300px" }}
        >
          <div className="p-2 bg-blue-100">
            <div className="flex">
              <div className="w-1/2 flex">
                <div className="w-1/3">
                  <div className="bg-blue-500 mb-2 text-white text-center p-2 rounded">
                    {selectedHour}
                  </div>
                  <div className="h-32 overflow-y-auto">
                    {hours.map((hour) => (
                      <div 
                        key={hour}
                        className={`p-2 text-center cursor-pointer ${
                          hour === selectedHour ? "bg-blue-500 text-white" : ""
                        }`}
                        onClick={() => handleHourSelect(hour)}
                      >
                        {hour}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/3 flex items-start justify-center pt-2">
                  <div className="text-2xl">:</div>
                </div>
                <div className="w-1/3">
                  <div className="bg-blue-500 mb-2 text-white text-center p-2 rounded">
                    {selectedMinute}
                  </div>
                  <div className="h-32 overflow-y-auto">
                    {minutes.map((minute) => (
                      <div 
                        key={minute}
                        className={`p-2 text-center cursor-pointer ${
                          minute === selectedMinute ? "bg-blue-500 text-white" : ""
                        }`}
                        onClick={() => handleMinuteSelect(minute)}
                      >
                        {minute}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-1/2">
                <div 
                  className={`p-2 text-center w-[50px] mx-auto rounded cursor-pointer mb-1 ${selectedPeriod === "AM" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  onClick={() => handlePeriodSelect("AM")}
                >
                  AM
                </div>
                <div 
                  className={`p-2 text-center mt-2 rounded w-[50px] mx-auto cursor-pointer ${selectedPeriod === "PM" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                  onClick={() => handlePeriodSelect("PM")}
                >
                  PM
                </div>
              </div>
            </div>
          </div>

          {/* <div className="p-3 border-t border-gray-200">
            <div className="font-medium mb-2">Select time slot:</div>
            <div className="grid grid-cols-2 gap-1 max-h-56 overflow-y-auto">
              {timeSlots.map((timeSlot) => (
                <div
                  key={timeSlot}
                  onClick={() => handleTimeSlotSelect(timeSlot)}
                  className="bg-[#1a1a1a] text-white hover:text-[#309de9] text-sm py-1 px-2 rounded cursor-pointer"
                >
                  {timeSlot}
                </div>
              ))}
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default TimePicker;