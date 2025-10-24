/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import {
  FaUser,
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFileAlt,
  FaPhone,
} from "react-icons/fa";
import { HiOutlineViewGridAdd } from "react-icons/hi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchableDropdown from "@/components/dashboard-sections/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  AppointmentData,
  createAppointment,
  updateAppointment,
  fetchAllAppointments,
} from "@/redux/slices/appointmentsSlice";
import { fetchCustomers } from "@/redux/slices/usersSlice";
import { fetchMeetings, Meeting } from "@/redux/slices/meetingsSlice";
import { fetchPipelines } from "@/redux/slices/pipelineSlice";
import { fetchStagesByPipeline } from "@/redux/slices/stageSlice";
import { fetchUserCalendarSettings, updateCalendarSettings } from "@/redux/slices/calendarSettingsSlice";
import { toast, ToastContainer } from "react-toastify";

interface ConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAppointment: (appointment: AppointmentData) => void;
  initialData?: AppointmentData | null;
  editMode?: boolean;
  preselectedDate?: string;
}

const ConsultationDialog: React.FC<ConsultationDialogProps> = ({
  isOpen,
  onClose,
  onBookAppointment,
  initialData,
  editMode = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userCalendarSettings } = useSelector((state: RootState) => state.calendarSettings);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Custom schedule state
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  // Helper functions for calendar and schedule
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const isDayOff = (date: Date) => {
    if (!useCustomSchedule) return false; // Always available when custom schedule is off

    if (!userCalendarSettings?.weekly_schedule) return true;
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = weekdays[date.getDay()];
    const schedule = userCalendarSettings.weekly_schedule.find(schedule => schedule.weekday === dayName);
    return !schedule || !schedule.is_available;
  };

  // Default schedule (7 days, 00:00-24:00)
  const defaultSchedule = useMemo(() => [
    { weekday: 'Monday', start: '00:00', end: '24:00', is_available: true },
    { weekday: 'Tuesday', start: '00:00', end: '24:00', is_available: true },
    { weekday: 'Wednesday', start: '00:00', end: '24:00', is_available: true },
    { weekday: 'Thursday', start: '00:00', end: '24:00', is_available: true },
    { weekday: 'Friday', start: '00:00', end: '24:00', is_available: true },
    { weekday: 'Saturday', start: '00:00', end: '24:00', is_available: true },
    { weekday: 'Sunday', start: '00:00', end: '24:00', is_available: true },
  ], []);

  // Find the next available date from today
  const findNextAvailableDate = useMemo(() => {
    const today = new Date();
    const checkDate = new Date(today);

    // Check up to 30 days in the future
    for (let i = 0; i < 30; i++) {
      if (!isPastDate(checkDate) && !isDayOff(checkDate)) {
        return new Date(checkDate);
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }
    return null;
  }, [userCalendarSettings, useCustomSchedule]);

  // Fetch initial data
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCustomers({ role: 'financial-advisor' }));
      dispatch(fetchMeetings());
      dispatch(fetchPipelines());

      // Fetch user calendar settings
      if (currentUserId) {
        setIsSwitchLoading(true);
        dispatch(fetchUserCalendarSettings(currentUserId))
          .unwrap()
          .finally(() => {
            setIsSwitchLoading(false);
          });
    }
    }
  }, [dispatch, isOpen, currentUserId]);

  // Initialize useCustomSchedule from user settings
  useEffect(() => {
    if (userCalendarSettings && isOpen) {
      setUseCustomSchedule(userCalendarSettings.use_custom_schedule ?? false);
    }
  }, [userCalendarSettings, isOpen]);

  // Set initial selected date when settings are loaded
  useEffect(() => {
    if (userCalendarSettings && isOpen && !selectedDate) {
      const today = new Date();
      if (!isPastDate(today) && !isDayOff(today)) {
        setSelectedDate(today);
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      } else {
        const nextAvailable = findNextAvailableDate;
        if (nextAvailable) {
          setSelectedDate(nextAvailable);
          setCurrentMonth(new Date(nextAvailable.getFullYear(), nextAvailable.getMonth(), 1));
        }
      }
    }
  }, [userCalendarSettings, isOpen, selectedDate, findNextAvailableDate]);

  useEffect(() => {
    if (editMode && initialData) {
      setContactName(initialData.title);
      setEventName(initialData.title);
      setDescription(initialData.description || "");

      if (initialData.date) {
        const date = new Date(initialData.date);
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
      }

      if (initialData.start_time && initialData.end_time) {
        const startMinutes = convertTimeToMinutes(initialData.start_time);
        const endMinutes = convertTimeToMinutes(initialData.end_time);
        const duration = endMinutes - startMinutes;

        if (duration <= 30) setSelectedDuration(30);
        else if (duration <= 45) setSelectedDuration(45);
        else if (duration <= 60) setSelectedDuration(60);
        else if (duration <= 90) setSelectedDuration(90);
        else setSelectedDuration(120);
      }

      if (initialData.pipeline_id) {
        setSelectedPipeline(initialData.pipeline_id);
      }
      if (initialData.stage_id) {
        setSelectedStage(initialData.stage_id);
      }
    }
  }, [editMode, initialData]);

  const meetingsState = useSelector((state: RootState) => state.meetings);
  const customers = useSelector((state: RootState) => state.users.customers);
  const { pipelines } = useSelector((state: RootState) => state.pipeline);
  const { stages } = useSelector((state: RootState) => state.stage);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [selectedMeetingData, setSelectedMeetingData] = useState<Meeting | null>(null);

  // Pipeline and stage state
  const [pipelineOption, setPipelineOption] = useState<'existing' | 'new'>('existing');
  const [selectedPipeline, setSelectedPipeline] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [newPipelineName, setNewPipelineName] = useState<string>("");
  const [newStageName, setNewStageName] = useState<string>("Standard");

  // Duration state
  const [selectedDuration, setSelectedDuration] = useState<number>(30);

  const [contact, setContact] = useState<string>("");
  const [isNewContact, setIsNewContact] = useState(false);

  const [contactName, setContactName] = useState<string>("");
  console.debug("Contact Name:", contactName);
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [eventName, setEventName] = useState<string>("Termin");
  const [description, setDescription] = useState<string>("");

  const [meeting, setMeeting] = useState<string>("");

  const colors = useMemo(
    () => [
      "#002d51",
      "#E76F51",
      "#F4A261",
      "#E9C46A",
      "#2A9D8F",
      "#264653",
      "#9B5DE5",
    ],
    []
  );
  const [appointmentColor, setAppointmentColor] = useState<string>(colors[0]);

  const getScheduleForDate = (date: Date) => {
    if (!useCustomSchedule) {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = weekdays[date.getDay()];
      return defaultSchedule.find(schedule => schedule.weekday === dayName);
    }

    if (!userCalendarSettings?.weekly_schedule) return null;
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = weekdays[date.getDay()];
    return userCalendarSettings.weekly_schedule.find(schedule => schedule.weekday === dayName);
  };

  const generateTimeSlotsForDate = (date: Date) => {
    const schedule = getScheduleForDate(date);

    if (!schedule || !schedule.is_available || !schedule.start || !schedule.end) {
      return [];
    }

    const slots = [];
    const [startHour, startMin] = schedule.start.split(':').map(Number);
    const [endHour, endMin] = schedule.end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const slotStartHour = currentHour;
      const slotStartMin = currentMin;

      currentMin += selectedDuration;

      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }

      if (currentHour > endHour || (currentHour === endHour && currentMin > endMin)) {
        break;
      }

      const startStr = `${slotStartHour.toString().padStart(2, '0')}:${slotStartMin.toString().padStart(2, '0')}`;
      const endStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

      slots.push(`${startStr} - ${endStr}`);
    }

    return slots;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const timeSlots = selectedDate ? generateTimeSlotsForDate(selectedDate) : [];

  // Handle custom schedule toggle
  const handleCustomScheduleToggle = async (enabled: boolean) => {
    if (isSwitchLoading) return;

    setIsSwitchLoading(true);

    try {
      if (currentUserId) {
        await dispatch(updateCalendarSettings({
          use_custom_schedule: enabled
        })).unwrap();

        // Directly update the local state - don't wait for refetch
        setUseCustomSchedule(enabled);
        toast.success(`Custom schedule ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      toast.error('Failed to update settings: ' + error);
    } finally {
      setIsSwitchLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date) || isDayOff(date)) return;
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Pipeline options
  const pipelineOptions = useMemo(() => {
    if (!pipelines || !Array.isArray(pipelines)) {
      return [];
    }

    return pipelines.map((pipeline) => ({
      value: pipeline.id.toString(),
      label: pipeline.name,
    }));
  }, [pipelines]);

  // Stage options (filtered by selected pipeline)
  const stageOptions = useMemo(() => {
    if (!stages || !Array.isArray(stages)) {
      return [];
    }

    return stages
      .sort((a, b) => a.position - b.position)
      .map((stage) => ({
        value: stage.id,
        label: stage.name,
        color: stage.color,
      }));
  }, [stages]);

  // Fetch stages when pipeline changes
  useEffect(() => {
    if (selectedPipeline) {
      dispatch(fetchStagesByPipeline(selectedPipeline));
      setSelectedStage(""); // Reset stage when pipeline changes
    }
  }, [selectedPipeline, dispatch]);

  // Check if no pipelines exist and auto-switch to 'new' mode
  useEffect(() => {
    if (pipelines && pipelines.length === 0 && !editMode) {
      setPipelineOption('new');
    }
  }, [pipelines, editMode]);

  const customerOptions = useMemo(() => {
    if (!customers || !Array.isArray(customers)) {
      return [];
    }

    return customers.map((customer) => ({
      value: customer.id,
      label: `${customer.first_name} ${customer.last_name}`,
    }));
  }, [customers]);

  const meetingOptions = useMemo(() => {
    if (!meetingsState.meetings || meetingsState.meetings.length === 0) {
      return [];
    }

    return meetingsState.meetings.map((meeting) => {
      let label = "";

      if (meeting.source === "Office Location") {
        label = `${meeting.title} - ${meeting.address1}, ${meeting.city}, ${meeting.country}`;
      } else {
        label = meeting.link
          ? `${meeting.title} - ${meeting.link}`
          : meeting.title;
      }

      return {
        value: meeting.id,
        label: label,
        data: meeting,
      };
    });
  }, [meetingsState.meetings]);

  useEffect(() => {
    if (meeting) {
      const selectedMeeting = meetingsState.meetings.find(
        (m) => m.id === meeting
      );
      if (selectedMeeting) {
        setSelectedMeetingData(selectedMeeting);
      }
    } else {
      setSelectedMeetingData(null);
    }
  }, [meeting, meetingsState.meetings]);

  const convertTimeToMinutes = (timeString: string) => {
    const [time, period] = timeString.split(" ");
    let [hours] = time.split(":").map(Number);
    const [minutes] = time.split(":").map(Number);

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const scrollY = window.scrollY;

      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = originalStyle;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const convertTo24HourFormat = (timeString: string) => {
    if (!timeString) return "";

    const [start] = timeString.split(" - ");
    return start;
  };

  const toggleContactMode = (newContactMode: boolean) => {
    setIsNewContact(newContactMode);
    if (newContactMode) {
      setContact("");
    } else {
      setContactName("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
    }
  };

  const handleMeetingChange = (meetingId: string) => {
    setMeeting(meetingId);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Bitte wählen Sie Datum und Uhrzeit aus');
      return;
    }

    // Validation
    if (pipelineOption === 'existing') {
      if (!selectedPipeline || !selectedStage) {
        toast.error('Bitte wählen Sie eine Pipeline und Stage aus');
        return;
      }
    } else {
      if (!newPipelineName.trim()) {
        toast.error('Bitte geben Sie einen Pipeline-Namen ein');
        return;
      }
    }

    if (!isNewContact && !contact) {
      toast.error('Bitte wählen Sie einen Kontakt aus');
      return;
    }

    if (isNewContact && !email) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    const [startTime, endTime] = selectedTimeSlot.split(" - ");
    const formattedStartTime = convertTo24HourFormat(startTime);
    const formattedEndTime = convertTo24HourFormat(endTime);

    setIsLoading(true);

    const appointmentData = {
      title: eventName || "Termin",
      description: description || "",
      date: selectedDate.toISOString().split('T')[0],
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      meeting_id: meeting || undefined,
      customer_id: isNewContact ? undefined : contact,
      email: isNewContact ? email : undefined,
      first_name: isNewContact ? firstName : undefined,
      last_name: isNewContact ? lastName : undefined,
      phone: isNewContact ? phone : undefined,
      // Pipeline and stage handling
      ...(pipelineOption === 'existing'
        ? {
          pipeline_id: selectedPipeline,
          stage_id: selectedStage
        }
        : {
          new_pipeline_name: newPipelineName,
          new_stage_name: newStageName || 'Standard',
          pipeline_source: 'Manuell hinzugefügt'
        }
      ),
      ...(editMode && initialData && { id: initialData.id }),
    };

    try {
      if (editMode && initialData && initialData.id) {
        const result = await dispatch(
          updateAppointment({
            id: initialData.id,
            appointmentData: appointmentData as any,
          })
        ).unwrap();

        toast.success("Termin erfolgreich aktualisiert!");

        // Refresh appointments list
        await dispatch(fetchAllAppointments());

        setTimeout(() => {
          onBookAppointment(result);
          resetFormFields();
          onClose();
        }, 100);
      } else {
        const result = await dispatch(createAppointment(appointmentData as any)).unwrap();

        toast.success("Neuer Termin erfolgreich erstellt!");

        // Refresh appointments list
        await dispatch(fetchAllAppointments());

        setTimeout(() => {
          onBookAppointment(result);
          resetFormFields();
          onClose();
        }, 1200);
      }
    } catch (error: any) {
      const errorMessage =
        error ||
        "Fehler beim Erstellen des Termins. Bitte versuchen Sie es erneut.";
      toast.error(errorMessage);
      console.error("Failed to create/update appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFormFields = () => {
    setContactName("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setSelectedTimeSlot(null);
    setSelectedDate(null);
    setMeeting("");
    setSelectedMeetingData(null);
    setEventName("Termin");
    setDescription("");
    setIsNewContact(false);
    setContact("");
    setIsLoading(false);
    setSelectedPipeline("");
    setSelectedStage("");
    setPipelineOption('existing');
    setNewPipelineName("");
    setNewStageName("Standard");
    setSelectedDuration(30);
  };

  const renderMeetingLocationDetails = () => {
    if (!selectedMeetingData) return null;

    if (
      selectedMeetingData.source === "Office Location" &&
      selectedMeetingData
    ) {
      const { address1, address2, city, state, zip, country } =
        selectedMeetingData;
      return (
        <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm border-l-4 border-[#002d51]">
          <div className="flex items-center space-x-2 mb-2">
            <FaMapMarkerAlt className="text-[#002d51]" />
            <p className="font-semibold text-[#002d51]">
              {selectedMeetingData.title}
            </p>
          </div>
          <div className="ml-6 text-gray-600 space-y-1">
            <p>{address1}</p>
            {address2 && <p>{address2}</p>}
            <p>
              {city}, {state} {zip}
            </p>
            <p>{country}</p>
          </div>
        </div>
      );
    } else if (selectedMeetingData.link) {
      return (
        <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm border-l-4 border-[#002d51]">
          <div className="flex items-center space-x-2 mb-2">
            <FaEnvelope className="text-[#002d51]" />
            <p className="font-semibold text-[#002d51]">
              {selectedMeetingData.title}
            </p>
          </div>
          <p className="ml-6 text-blue-600 truncate">
            {selectedMeetingData.link}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <>
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
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        {/* Reduced modal width from max-w-5xl to max-w-4xl */}
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#002d51] p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <FaCalendarAlt size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                {editMode ? "Beratung bearbeiten" : "Beratung erstellen"}
              </h2>
            </div>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleBookAppointment}
            className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
          >
            {/* Contact Mode Toggle */}
            {!editMode && (
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 font-medium transition-colors rounded-xl ${
                    !isNewContact
                      ? "bg-[#002d51] text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => toggleContactMode(false)}
                >
                  Bestehende Kontakte
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 px-4 font-medium transition-colors flex items-center justify-center space-x-2 rounded-xl ${
                    isNewContact
                      ? "bg-[#002d51] text-white"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => toggleContactMode(true)}
                >
                  <FaUser size={14} />
                  <span>Neuer Kontakt</span>
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* Pipeline & Stage Selection - SINGLE LINE */}
              <div className="space-y-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <HiOutlineViewGridAdd className="text-[#002d51]" />
                  <span>Pipeline & Stage</span>
                </label>

                {/* Pipeline Option Selection */}
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="existing"
                      checked={pipelineOption === 'existing'}
                      onChange={(e) => setPipelineOption(e.target.value as 'existing' | 'new')}
                      disabled={pipelineOptions.length === 0}
                      className="mr-2"
                    />
                    <span className={pipelineOptions.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                      Bestehende Pipeline verwenden
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="new"
                      checked={pipelineOption === 'new'}
                      onChange={(e) => setPipelineOption(e.target.value as 'existing' | 'new')}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Neue Pipeline erstellen</span>
                  </label>
                </div>

                {pipelineOptions.length === 0 && pipelineOption === 'existing' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-800 text-sm">
                        Keine Pipelines vorhanden. Bitte erstellen Sie eine neue Pipeline.
                      </span>
                    </div>
                  </div>
                )}

                {pipelineOption === 'existing' ? (
                  <div className="flex gap-3 items-end">
                    {/* Pipeline Selection */}
                    <div className="flex-1 space-y-1">
                      <SearchableDropdown
                        showSearchbar={true}
                        label=""
                        options={pipelineOptions}
                        value={selectedPipeline}
                        onChange={setSelectedPipeline}
                        placeholder="Pipeline wählen..."
                      />
                    </div>

                    {/* Stage Selection */}
                    <div className="flex-1 space-y-1">
                      <SearchableDropdown
                        showSearchbar={true}
                        label=""
                        options={stageOptions}
                        value={selectedStage}
                        onChange={setSelectedStage}
                        placeholder={
                          selectedPipeline
                            ? "Stage wählen..."
                            : "Erst Pipeline wählen"
                        }
                        disabled={!selectedPipeline || stageOptions.length === 0}
                      />
                    </div>
                  </div>
                ) : (
                    <div className="flex gap-3 items-end">
                    {/* New Pipeline Name */}
                      <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pipeline Name *
                      </label>
                      <input
                        type="text"
                        value={newPipelineName}
                        onChange={(e) => setNewPipelineName(e.target.value)}
                        placeholder="Pipeline-Name eingeben"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent"
                      />
                    </div>

                    {/* New Stage Name */}
                      <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stage Name *
                      </label>
                      <input
                        type="text"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        placeholder="Stage-Name eingeben"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {selectedPipeline && stageOptions.length === 0 && pipelineOption === 'existing' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Keine Stages für diese Pipeline verfügbar
                  </p>
                )}
              </div>

              {/* Contact Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <FaUser className="text-[#002d51]" />
                  <span>
                    {editMode
                      ? "Kontaktname"
                      : isNewContact
                        ? "Neue Kontaktinformationen"
                        : "Kontakt auswählen"}
                  </span>
                </label>
                {isNewContact ? (
                  <div className="space-y-3">
                    {/* Email and Phone in SINGLE LINE */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <FaEnvelope className="text-gray-400" size={14} />
                          <label className="text-sm text-gray-600">E-Mail *</label>
                        </div>
                        <input
                          type="email"
                          placeholder="E-Mail-Adresse eingeben"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <FaPhone className="text-gray-400" size={14} />
                          <label className="text-sm text-gray-600">Telefon</label>
                        </div>
                        <input
                          type="tel"
                          placeholder="Telefonnummer"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* First Name and Last Name in SINGLE LINE */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Vorname"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Nachname"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <SearchableDropdown
                    showSearchbar={false}
                    label=""
                    options={customerOptions}
                    value={contact}
                    onChange={setContact}
                    placeholder="Kontakt auswählen"
                  />
                )}
              </div>

              {/* Duration Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaClock size={16} />
                    Dauer
                  </label>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedDuration(mins)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDuration === mins
                        ? "bg-[#002d51] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {mins} Min
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar and Time Slots Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Calendar Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Datum auswählen</label>

                  <div className="p-3 bg-white shadow-sm border border-gray-200 rounded-xl">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <h3 className="text-sm font-semibold text-[#002d51]">
                        {currentMonth.toLocaleDateString("de-DE", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h3>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-[11px] font-medium text-gray-600 py-1"
                        >
                          {day}
                        </div>
                      ))}

                      {calendarDays.map((day, index) => {
                        if (!day)
                          return <div key={`empty-${index}`} className="aspect-square" />;

                        const isSelected =
                          selectedDate?.toDateString() === day.toDateString();
                        const isPast = isPastDate(day);
                        const isOff = isDayOff(day);
                        const isDisabled = isPast || isOff;

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDateSelect(day)}
                            disabled={isDisabled}
                            className={`aspect-square rounded-full text-[11px] font-medium transition-colors focus:outline-none focus:ring-0 border-0
                                  ${isSelected
                                ? "bg-[#002d51] text-white"
                                : isDisabled
                                  ? "bg-white text-gray-300 cursor-not-allowed"
                                  : "bg-white text-[#002d51] hover:bg-gray-100"
                              }`}
                          >
                            {day.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Time Slot Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Verfügbare Zeitslots
                    </label>
                    <button
                      type="button"
                      onClick={() => !isSwitchLoading && handleCustomScheduleToggle(!useCustomSchedule)}
                      disabled={isSwitchLoading}
                      className={`relative h-8 w-16 rounded-lg transition-colors duration-200 focus:outline-none ${useCustomSchedule ? 'bg-[#002d51]' : 'bg-gray-300'
                        } ${isSwitchLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`absolute top-1 h-6 w-7 bg-white rounded-md shadow-lg transition-all duration-200 flex items-center justify-center text-xs font-medium ${useCustomSchedule ? 'left-9 text-[#002d51]' : 'left-1 text-gray-600'
                        }`}>
                        {isSwitchLoading ? '...' : useCustomSchedule ? 'ON' : 'OFF'}
                      </div>
                    </button>
                  </div>

                  {selectedDate ? (
                    timeSlots.length > 0 ? (
                      <div className="border border-gray-200 rounded-xl p-6 max-h-[380px] overflow-y-auto bg-white">
                        <div className="text-xs text-gray-600 mb-2 font-medium">
                          {selectedDate.toLocaleDateString("de-DE", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                          {!useCustomSchedule && (
                            <span className="ml-2 text-green-600">(24/7 verfügbar)</span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {timeSlots.map((timeSlot) => (
                            <button
                              key={timeSlot}
                              type="button"
                              onClick={() => handleTimeSlotSelect(timeSlot)}
                              className={`w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left ${selectedTimeSlot === timeSlot
                                ? "bg-[#002d51] text-white"
                                : "bg-gray-50 text-gray-700 hover:bg-blue-50"
                                }`}
                            >
                              {timeSlot.split(" - ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-yellow-800 text-sm">
                          Dieser Tag ist nicht verfügbar. Bitte wählen Sie einen anderen Tag.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center justify-center min-h-[380px]">
                      <p className="text-gray-500 text-sm text-center">
                        Lade verfügbare Termine...
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Name and Meeting Location - SINGLE LINE */}
              <div className="flex gap-6">
                {/* Event Name */}
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Terminname
                  </label>
                  <input
                    type="text"
                    placeholder="Terminbestätigung"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent"
                  />
                </div>

                {/* Meeting Location */}
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                    <FaMapMarkerAlt className="text-[#002d51]" />
                    <span>Meeting-Link</span>
                  </label>
                  <SearchableDropdown
                    showSearchbar={true}
                    label=""
                    options={meetingOptions}
                    value={meeting}
                    onChange={handleMeetingChange}
                    placeholder="Meeting-Ort auswählen"
                  />
                  {renderMeetingLocationDetails()}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <FaFileAlt className="text-[#002d51]" />
                  <span>Terminbeschreibung</span>
                </label>
                <textarea
                  placeholder="Schreiben Sie eine benutzerdefinierte Einladung..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent"
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Terminfarbe
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setAppointmentColor(color)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        appointmentColor === color
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Selected Appointment Summary */}
              {selectedDate && selectedTimeSlot && (
                <div className="bg-blue-50 border-l-4 border-[#002d51] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-[#002d51] mt-0.5 flex-shrink-0" size={20} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Ausgewählter Termin</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Datum:</span>
                          <p className="font-medium text-gray-900">{selectedDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Startzeit:</span>
                          <p className="font-medium text-gray-900">{selectedTimeSlot.split(" - ")[0]} Uhr</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Endzeit:</span>
                          <p className="font-medium text-gray-900">{selectedTimeSlot.split(" - ")[1]} Uhr</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className={`flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Schließen
              </button>
              <button
                type="submit"
                disabled={!selectedDate || !selectedTimeSlot || isLoading}
                className={`flex-1 py-3 px-4 bg-[#002d51] text-white rounded-xl font-medium hover:bg-[#003d61] transition-colors flex items-center justify-center space-x-2 ${
                  !selectedDate || !selectedTimeSlot || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>{editMode ? "Speichern..." : "Erstellen..."}</span>
                  </>
                ) : (
                  <span>
                    {editMode ? "Änderungen speichern" : "Termin buchen"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ConsultationDialog;