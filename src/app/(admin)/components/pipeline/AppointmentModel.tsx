/* eslint-disable  @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { X, Phone, Video, ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { createAppointment } from "@/redux/slices/appointmentsSlice";
import { createLeadTracking } from "@/redux/slices/leadTrackingSlice";
import { fetchUserCalendarSettings } from "@/redux/slices/calendarSettingsSlice";
import { fetchPipelineNotificationTemplates } from "@/redux/slices/notificationTemplateSlice";
import { updateCalendarSettings } from "@/redux/slices/calendarSettingsSlice";
import { toast } from "react-toastify";

interface AppointmentModelProps {
  isOpen: boolean;
  onClose: () => void;
  emailContact: string;
  nameContact: string;
  idContact: string;
  pipelineId: string;
  stageId: string;
  userId: string;
}

const AppointmentModel: React.FC<AppointmentModelProps> = ({
  isOpen,
  onClose,
  emailContact,
  nameContact,
  idContact,
  pipelineId,
  stageId,
  userId,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userCalendarSettings } = useSelector((state: RootState) => state.calendarSettings);
  const { pipelineTemplates } = useSelector((state: RootState) => state.notificationTemplateFilters);

  const [appointmentType, setAppointmentType] = useState<"Telefonisch" | "Video-Call">("Video-Call");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [email, setEmail] = useState(emailContact);
  const [subject, setSubject] = useState(`${nameContact} - Deal`);
  const [description, setDescription] = useState("");
  const [eventName, setEventName] = useState(nameContact);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [duration, setDuration] = useState(30);
  const [useCustomSchedule, setUseCustomSchedule] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  // Helper function to replace placeholders with actual data
  const replacePlaceholders = (text: string) => {
    if (!text) return text;

    const replacements: Record<string, string> = {
      '[customer_name]': nameContact,
      '[customer_email]': emailContact,
      '[appointment_date]': selectedDate ? selectedDate.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : '[Datum wird nach Auswahl angezeigt]',
      '[appointment_time]': startTime && endTime ? `${startTime} - ${endTime} Uhr` : '[Zeit wird nach Auswahl angezeigt]',
      '[appointment_start_time]': startTime || '[Startzeit wird nach Auswahl angezeigt]',
      '[appointment_end_time]': endTime || '[Endzeit wird nach Auswahl angezeigt]',
      '[appointment_type]': appointmentType === "Video-Call" ? "Video-Beratung" : "Telefontermin",
      '[appointment_duration]': `${duration} Minuten`,
    };

    let result = text;
    Object.keys(replacements).forEach(placeholder => {
      const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      result = result.replace(regex, replacements[placeholder]);
    });

    return result;
  };

  // Define helper functions first
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

  console.debug('Next available date:', findNextAvailableDate);

  useEffect(() => {
    if (isOpen && userId) {
      setIsSwitchLoading(true);
      // Always fetch fresh data when modal opens
      dispatch(fetchUserCalendarSettings(userId))
        .finally(() => {
          setIsSwitchLoading(false);
        });

      dispatch(fetchPipelineNotificationTemplates({
        pipelineId: pipelineId,
        limit: 100,
      }));
    }
  }, [isOpen, userId, pipelineId, dispatch]); // This should already be correct

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Optional: Reset local state when modal closes
      // This ensures fresh data is loaded next time
      setUseCustomSchedule(false);
    }
  }, [isOpen]);

  // Initialize useCustomSchedule from user settings - FIXED VERSION
  useEffect(() => {
    if (userCalendarSettings && isOpen) {
      // Always use the latest value from Redux store
      setUseCustomSchedule(userCalendarSettings.use_custom_schedule ?? false);
    }
  }, [userCalendarSettings, isOpen]); // Added isOpen dependency

  // Initialize useCustomSchedule from user settings - FINAL FIXED VERSION
  useEffect(() => {
    if (userCalendarSettings) {
      console.log('Setting switch to:', userCalendarSettings.use_custom_schedule); // Debug log
      setUseCustomSchedule(userCalendarSettings.use_custom_schedule ?? false);
    }
  }, [userCalendarSettings]);

  // Force refresh when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      // Always refetch current settings when modal opens
      dispatch(fetchUserCalendarSettings(userId));
    }
  }, [isOpen, userId, dispatch]);

  useEffect(() => {
    setEmail(emailContact);
  }, [emailContact]);

  // Handle switch toggle - FIXED VERSION
  const handleCustomScheduleToggle = async (enabled: boolean) => {
    if (isSwitchLoading) return; // Prevent multiple clicks

    setIsSwitchLoading(true);

    try {
      await dispatch(updateCalendarSettings({
        use_custom_schedule: enabled
      })).unwrap();

      // Directly update the local state - don't wait for refetch
      setUseCustomSchedule(enabled);
      toast.success(`Custom schedule ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update custom schedule setting:', error);
      toast.error('Failed to update settings');
      // Don't revert the UI state - keep it as the user intended
    } finally {
      setIsSwitchLoading(false);
    }
  };

  // Automatically load the first available template when appointment type changes
  useEffect(() => {
    if (!pipelineTemplates || pipelineTemplates.length === 0) return;

    const category = appointmentType === "Video-Call" ? "video_consultation" : "telephone_appointments";

    const availableTemplate = pipelineTemplates.find(template =>
      template.category === category &&
      template.type === "appointment_confirmation" &&
      template.is_enabled
    );

    if (availableTemplate) {
      const processedTitle = replacePlaceholders(availableTemplate.title || `${nameContact} - Deal`);
      const processedBody = replacePlaceholders(availableTemplate.body || "");

      setSubject(processedTitle);
      setDescription(processedBody);
    } else {
      setSubject(`${nameContact} - Deal`);
      setDescription("");
    }
  }, [appointmentType, pipelineTemplates, nameContact, emailContact, selectedDate, startTime, endTime, duration]);

  // Update placeholders when date or time changes
  useEffect(() => {
    if (selectedDate || startTime || endTime) {
      // Re-process the current description with updated date/time
      const processedDescription = replacePlaceholders(description);
      if (processedDescription !== description) {
        setDescription(processedDescription);
      }
    }
  }, [selectedDate, startTime, endTime]);

  // Update getScheduleForDate to use default schedule when custom schedule is off
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

      currentMin += duration;

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

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date) || isDayOff(date)) return;
    setSelectedDate(date);
    setSelectedTimeSlot("");
    setStartTime("");
    setEndTime("");
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    const [start, end] = timeSlot.split(" - ");
    setStartTime(start);
    setEndTime(end);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDateForDB = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !startTime || !endTime) {
      toast.error("Bitte wählen Sie Datum und Uhrzeit aus");
      return;
    }
    setIsLoading(true);

    const appointmentPayload = {
      type: appointmentType === "Video-Call" ? "videocall" : "phone call",
      customer_id: idContact,
      date: formatDateForDB(selectedDate),
      start_time: startTime,
      end_time: endTime,
      description,
      title: subject,
      pipeline_id: pipelineId,
      stage_id: stageId,
    };

    try {
      await dispatch(createAppointment(appointmentPayload)).unwrap();
      const htmlActivity = `<div class="relative mb-6">
        <div class="absolute left-4 -ml-2 h-4 w-4 rounded-full bg-blue-500 border-4 border-white"></div>
        <div class="ml-12 bg-gray-50 p-4 rounded">
          <div class="flex items-center mb-2">
            <p class="ml-auto"><span class="font-bold mr-1">Terminvereinbarung:</span>${appointmentType}</p>
          </div>
          <p>Datum: ${formatDateForDB(selectedDate)}</p>
          <p>Uhrzeit: ${startTime} - ${endTime} Uhr</p>
          <p>Message: ${description}</p>
        </div>
      </div>`;

      await dispatch(createLeadTracking({ userId: String(idContact), activity: htmlActivity })).unwrap();
      toast.success("Termin erfolgreich erstellt!");
      setTimeout(() => { onClose(); }, 1200);
    } catch (error: any) {
      toast.error(error || "Fehler beim Erstellen des Termins");
      console.error("Failed to create appointment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center overflow-y-auto justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#002d51] p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Calendar size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Termin erstellen</h2>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Terminart auswählen</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" className={`flex items-center justify-center p-4 rounded-xl font-medium transition-colors ${appointmentType === "Video-Call" ? "bg-[#002d51] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`} onClick={() => setAppointmentType("Video-Call")}>
                  <Video className="mr-2" size={20} />
                  <span>Videocall</span>
                </button>
                <button type="button" className={`flex items-center justify-center p-4 rounded-xl font-medium transition-colors ${appointmentType === "Telefonisch" ? "bg-[#002d51] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`} onClick={() => setAppointmentType("Telefonisch")}>
                  <Phone className="mr-2" size={20} />
                  <span>Telefon-Termin</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Kontaktname</label>
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Kontakt - E-Mail</label>
                <input type="email" value={email} readOnly className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock size={16} />
                  Dauer
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${duration === mins
                        ? "bg-[#002d51] text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {mins} Min
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Calendar Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Datum auswählen</label>

                <div className="p-3 bg-white shadow-sm">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Betreff</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Terminbeschreibung</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#002d51] focus:border-transparent" placeholder="Schreiben Sie eine benutzerdefinierte Einladung..." />
            </div>

            {selectedDate && startTime && endTime && (
              <div className="bg-blue-50 border-l-4 border-[#002d51] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-[#002d51] mt-0.5 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Ausgewählter Termin</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Datum:</span>
                        <p className="font-medium text-gray-900">{selectedDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Startzeit:</span>
                        <p className="font-medium text-gray-900">{startTime} Uhr</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Endzeit:</span>
                        <p className="font-medium text-gray-900">{endTime} Uhr</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={isLoading} className={`flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              Schließen
            </button>
            <button type="button" onClick={handleBookAppointment} disabled={!selectedDate || !startTime || !endTime || isLoading} className={`flex-1 py-3 px-4 bg-[#002d51] text-white rounded-xl font-medium hover:bg-[#003d61] transition-colors flex items-center justify-center space-x-2 ${!selectedDate || !startTime || !endTime || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Erstellen...</span>
                </>
              ) : (
                <span>Termin buchen</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModel;