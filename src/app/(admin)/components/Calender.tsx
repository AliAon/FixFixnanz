"use client";
import { useEffect, useState, useRef } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg, DateSelectArg, EventInput } from '@fullcalendar/core';
import { EventResizeDoneArg as EventResizeArg } from '@fullcalendar/interaction';
import { IoAdd, IoSettings } from "react-icons/io5";
import ConsultationDialog from "./ConsultationDialog";
import AppointmentActionDialog from "./AppointmentActionDialog";
// Redux imports
import { AppDispatch } from "@/redux/store";
import { 
  fetchAllAppointments, 
  selectAllAppointments,
  Appointment,
  deleteAppointment,
  updateAppointment
} from "@/redux/slices/appointmentsSlice";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";

// FullCalendar CSS imports


type ViewType = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

interface CalendarProps {
  initialView?: ViewType;
}

const FullCalendarComponent: React.FC<CalendarProps> = ({
  initialView = "dayGridMonth",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const calendarRef = useRef<FullCalendar>(null);
  
  // Redux state for appointments
  const appointments = useSelector(selectAllAppointments);

  // Component state
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  const [isAppointmentActionDialogOpen, setIsAppointmentActionDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Fetch appointments when component mounts
  useEffect(() => {
    dispatch(fetchAllAppointments());
  }, [dispatch]);

  // Convert appointments to FullCalendar events
  const convertToFullCalendarEvents = (appointments: Appointment[]): EventInput[] => {
    return appointments.map((appointment) => ({
      id: appointment.id,
      title: appointment.title,
      start: `${appointment.date}T${convertTo24HourFormat(appointment.start_time)}`,
      end: `${appointment.date}T${convertTo24HourFormat(appointment.end_time || appointment.start_time)}`,
      backgroundColor: getEventColor(appointment.type),
      borderColor: getEventColor(appointment.type),
      textColor: '#ffffff',
      extendedProps: {
        ...appointment,
        originalAppointment: appointment
      }
    }));
  };

  // Utility functions
  const getEventColor = (type?: string): string => {
    switch (type?.toLowerCase()) {
      case 'telephone':
        return '#3b82f6'; // blue-500
      case 'video_consultation':
        return '#10b981'; // green-500
      case 'video':
        return '#ef4444'; // red-500
      case 'followup':
        return '#8b5cf6'; // purple-500
      default:
        return '#002d51'; // project color
    }
  };

  const convertTo24HourFormat = (timeStr: string): string => {
    if (!timeStr) return '09:00:00';

    // If already in 24-hour format
    if (timeStr.includes(':') && timeStr.split(':').length >= 2 && !timeStr.includes('AM') && !timeStr.includes('PM')) {
      return timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    }

    const [time, period] = timeStr.split(' ');
    if (!time || !period) return '09:00:00';

    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  };

  const convertFrom24HourFormat = (timeStr: string): string => {
    if (!timeStr) return '9:00 AM';

    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${hours}:${minutes} ${period}`;
  };

  console.debug("Test convertTo24HourFormat:", convertFrom24HourFormat);

  // FullCalendar event handlers
  const handleEventClick = (clickInfo: EventClickArg) => {
    const appointment = clickInfo.event.extendedProps.originalAppointment as Appointment;
    setSelectedAppointment(appointment);
    setIsAppointmentActionDialogOpen(true);
  };

  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const appointment = dropInfo.event.extendedProps.originalAppointment as Appointment;
    const newStart = dropInfo.event.start;
    const newEnd = dropInfo.event.end;

    if (!newStart || !appointment.id) {
      dropInfo.revert();
      return;
    }

    try {
      // Calculate new times
      const newDate = newStart.toISOString().split('T')[0];
      const newStartTime = newStart.toTimeString().substring(0, 8);
      const newEndTime = newEnd ? newEnd.toTimeString().substring(0, 8) : newStartTime;

      await dispatch(updateAppointment({
        id: appointment.id,
        appointmentData: {
          ...appointment,
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime
        }
      })).unwrap();

      toast.success('Termin erfolgreich verschoben!');
    } catch (error) {
      dropInfo.revert();
      toast.error('Fehler beim Verschieben des Termins');
      console.error('Error updating appointment:', error);
    }
  };

  const handleEventResize = async (resizeInfo: EventResizeArg) => {
    const appointment = resizeInfo.event.extendedProps.originalAppointment as Appointment;
    const newStart = resizeInfo.event.start;
    const newEnd = resizeInfo.event.end;

    if (!newStart || !newEnd || !appointment.id) {
      resizeInfo.revert();
      return;
    }

    try {
      const newStartTime = newStart.toTimeString().substring(0, 8);
      const newEndTime = newEnd.toTimeString().substring(0, 8);

      await dispatch(updateAppointment({
        id: appointment.id,
        appointmentData: {
          ...appointment,
          start_time: newStartTime,
          end_time: newEndTime
        }
      })).unwrap();

      toast.success('Termin erfolgreich angepasst!');
    } catch (error) {
      resizeInfo.revert();
      toast.error('Fehler beim Anpassen des Termins');
      console.error('Error resizing appointment:', error);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const selectedDate = selectInfo.start.toISOString().split('T')[0];
    setSelectedDate(selectedDate);
    setEditMode(false);
    setSelectedAppointment(null);
    setIsConsultationDialogOpen(true);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
    }
  };

  // Dialog handlers
  const handleAddAppointment = () => {
    setIsConsultationDialogOpen(false);
    setSelectedDate('');
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditMode(true);
    setIsAppointmentActionDialogOpen(false);
    setIsConsultationDialogOpen(true);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    dispatch(deleteAppointment(appointmentId))
      .unwrap()
      .then(() => {
        setIsAppointmentActionDialogOpen(false);
        setSelectedAppointment(null);
        toast.success("Termin erfolgreich gelöscht");
      })
      .catch((error) => {
        console.error("Failed to delete appointment:", error);
        toast.error(error || "Fehler beim Löschen des Termins");
      });
  };

  const handleSaveEditedAppointment = () => {
    if (selectedAppointment) {
      setSelectedAppointment(null);
      setEditMode(false);
      setIsConsultationDialogOpen(false);
    }
  };

  const handleConsultationDialogClose = () => {
    setIsConsultationDialogOpen(false);
    setSelectedAppointment(null);
    setEditMode(false);
    setSelectedDate('');
  };

  // Custom toolbar
  const CustomToolbar = () => (
    <div className="flex justify-between items-center mb-4 p-4">
      <button
        onClick={() => {
          setEditMode(false);
          setSelectedAppointment(null);
          setSelectedDate('');
          setIsConsultationDialogOpen(true);
        }}
        className="bg-[#002d51] text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-[#003d61] transition-colors"
      >
        <span className="mr-2">
          <IoAdd size={18} />
        </span>
        Neue Beratung
      </button>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            calendarApi?.prev();
          }}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          ‹
        </button>

        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            calendarApi?.today();
          }}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          Heute
        </button>

        <button
          onClick={() => {
            const calendarApi = calendarRef.current?.getApi();
            calendarApi?.next();
          }}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
        >
          ›
        </button>
      </div>

      <div className="flex space-x-1">
        <button
          onClick={() => handleViewChange("dayGridMonth")}
          className={`px-3 py-1 rounded text-sm transition-colors ${currentView === "dayGridMonth"
            ? "bg-[#002d51] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          Monat
        </button>
        <button
          onClick={() => handleViewChange("timeGridWeek")}
          className={`px-3 py-1 rounded text-sm transition-colors ${currentView === "timeGridWeek"
            ? "bg-[#002d51] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          Woche
        </button>
        <button
          onClick={() => handleViewChange("timeGridDay")}
          className={`px-3 py-1 rounded text-sm transition-colors ${currentView === "timeGridDay"
            ? "bg-[#002d51] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          Tag
        </button>
        <button
          onClick={() => handleViewChange("listWeek")}
          className={`px-3 py-1 rounded text-sm transition-colors ${currentView === "listWeek"
            ? "bg-[#002d51] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          Liste
        </button>
      </div>

      <Link
        href="/admin/calender/setting"
        className="bg-[#198754] text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-[#157347] transition-colors"
      >
        <span className="mr-2">
          <IoSettings size={18} />
        </span>
        Kalender-Einstellungen
      </Link>
    </div>
  );

  return (
    <div className="h-full">
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

      <div className="bg-white">
        <h1 className="text-2xl font-semibold text-[#002d51] mb-4 p-4">
          Terminkalender
        </h1>

        <CustomToolbar />

        <div className="bg-white shadow-lg rounded-lg p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={currentView}
            headerToolbar={false} // We use custom toolbar
            events={convertToFullCalendarEvents(appointments)}

            // Interaction settings
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}

            // Event handlers
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            select={handleDateSelect}

            // Localization
            locale="de"
            firstDay={1} // Monday

            // Time settings
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"

            // Appearance
            height="auto"
            dayMaxEventRows={3}
            moreLinkClick="popover"

            // Event rendering
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}

            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}

            // Custom CSS classes
            dayHeaderClassNames="bg-gray-50 font-medium text-gray-700"
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"

            // Business hours (optional)
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '09:00',
              endTime: '17:00',
            }}

            // View-specific settings
            views={{
              dayGridMonth: {
                dayMaxEventRows: 3,
              },
              timeGridWeek: {
                slotLabelFormat: {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }
              },
              timeGridDay: {
                slotLabelFormat: {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }
              },
              listWeek: {
                listDayFormat: {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                }
              }
            }}

            // Custom button text
            buttonText={{
              today: 'Heute',
              month: 'Monat',
              week: 'Woche',
              day: 'Tag',
              list: 'Liste'
            }}

            // No events message
            noEventsContent="Keine Termine vorhanden"
          />
        </div>
      </div>

      {/* Consultation Dialog */}
      <ConsultationDialog
        isOpen={isConsultationDialogOpen}
        onClose={handleConsultationDialogClose}
        onBookAppointment={editMode ? handleSaveEditedAppointment : handleAddAppointment}
        initialData={selectedAppointment}
        editMode={editMode}
        preselectedDate={selectedDate}
      />

      {/* Appointment Action Dialog */}
      <AppointmentActionDialog
        isOpen={isAppointmentActionDialogOpen}
        appointment={selectedAppointment}
        onClose={() => setIsAppointmentActionDialogOpen(false)}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
      />

      <style jsx global>{`
        /* FullCalendar custom styles */
        .fc {
          font-family: inherit;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border-color: #e5e7eb;
        }
        
        .fc-theme-standard td, 
        .fc-theme-standard th {
          border-color: #e5e7eb;
        }
        
        .fc-col-header-cell {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
        }
        
        .fc-daygrid-day:hover {
          background-color: #f3f4f6;
        }
        
        .fc-timegrid-slot:hover {
          background-color: #f3f4f6;
        }
        
        .fc-event {
          border-radius: 6px;
          border: none !important;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .fc-event:hover {
          opacity: 0.8;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .fc-event-dragging {
          opacity: 0.6;
          transform: scale(1.05);
        }
        
        .fc-event-resizing {
          opacity: 0.8;
        }
        
        .fc-today {
          background-color: #fffbeb !important;
        }
        
        .fc-day-selected {
          background-color: #dbeafe !important;
        }
        
        .fc-highlight {
          background-color: #bfdbfe !important;
        }
        
        .fc-list-event:hover {
          background-color: #f3f4f6;
        }
        
        .fc-list-day-cushion {
          background-color: #f9fafb;
          color: #002d51;
          font-weight: 600;
        }
        
        .fc-scrollgrid-sync-table {
          border-radius: 8px;
          overflow: hidden;
        }
        
        /* German text styling */
        .fc-toolbar-title {
          color: #002d51;
          font-weight: 600;
        }
        
        .fc-button {
          background-color: #002d51 !important;
          border-color: #002d51 !important;
          color: white !important;
        }
        
        .fc-button:hover {
          background-color: #003d61 !important;
          border-color: #003d61 !important;
        }
        
        .fc-button:disabled {
          background-color: #6b7280 !important;
          border-color: #6b7280 !important;
        }
      `}</style>
    </div>
  );
};

export default FullCalendarComponent;