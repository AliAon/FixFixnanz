import React, { useState } from "react";
import { X, Calendar, Clock, FileText, Edit3, Trash2, User, Building, Link as LinkIcon, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import ConfirmationDialog from "@/components/shared/ConfirmationDialouge";
import { AppointmentData } from "@/redux/slices/appointmentsSlice";

interface AppointmentActionDialogProps {
  isOpen: boolean;
  appointment: AppointmentData | null;
  onClose: () => void;
  onEdit: (appointment: AppointmentData) => void;
  onDelete: (appointmentId: string) => void;
}

const AppointmentActionDialog: React.FC<AppointmentActionDialogProps> = ({
  isOpen,
  appointment,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirmDelete = () => {
    if (appointment.id) {
      onDelete(appointment.id);
      setIsConfirmationOpen(false);
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmationOpen(false);
  };

  // Format date for display in German
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('de-DE', options);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'Nicht angegeben';

    // If it's in HH:MM:SS format, convert to readable format
    if (timeString.includes(':') && timeString.split(':').length === 3) {
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${period}`;
    }

    return timeString;
  };

  // Calculate appointment duration
  const calculateDuration = () => {
    if (!appointment.start_time || !appointment.end_time) return 'Nicht angegeben';

    const [startHours, startMinutes] = appointment.start_time.split(':').map(Number);
    const [endHours, endMinutes] = appointment.end_time.split(':').map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    if (durationMinutes < 60) {
      return `${durationMinutes} Minuten`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours} Stunde${hours > 1 ? 'n' : ''}`;
    }
  };

  // Get appointment status with icon and color
  type StatusKey = 'pending' | 'confirmed' | 'cancelled' | 'completed';
  const getAppointmentStatus = () => {
    const status = (appointment.status as StatusKey) || 'pending';
    const statusMap: Record<StatusKey, { text: string; color: string; icon: React.ReactNode }> = {
      'pending': {
        text: 'Ausstehend',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertCircle size={14} />
      },
      'confirmed': {
        text: 'Bestätigt',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle size={14} />
      },
      'cancelled': {
        text: 'Abgesagt',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle size={14} />
      },
      'completed': {
        text: 'Abgeschlossen',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle size={14} />
      }
    };

    return statusMap[status] || statusMap['pending'];
  };

  const status = getAppointmentStatus();

  console.debug("Appointment status:", status);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 relative overflow-hidden max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002d51] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 bg-white bg-opacity-20 rounded-full p-2"
          >
            <X size={18} />
          </button>

          <div className="text-center">
            <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Calendar size={24} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Termindetails
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#002d51] mb-1">
              {appointment.title}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(appointment.date)}
            </p>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Time Details */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-[#002d51] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Zeitdetails</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start:</span>
                    <span className="font-medium text-gray-800">{formatTime(appointment.start_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ende:</span>
                    <span className="font-medium text-gray-800">{formatTime(appointment.end_time || "")}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600">Dauer:</span>
                    <span className="font-medium text-[#002d51]">{calculateDuration()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            {appointment.customer_id && typeof appointment.customer_id === 'object' && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-[#002d51] mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Kundeninformationen</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-800">
                        {appointment.customer_id?.first_name ?? ''} {appointment.customer_id?.last_name ?? ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">E-Mail</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.customer_id?.lead_email ?? 'Nicht angegeben'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Telefon</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.customer_id?.lead_phone || 'Nicht angegeben'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${appointment.customer_id?.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {appointment.customer_id?.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Meeting Information */}
            {appointment.meetings && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <LinkIcon className="w-5 h-5 text-[#002d51] mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Meeting-Informationen</p>
                    {appointment.meetings.link && (
                      <a
                        href={appointment.meetings.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#002d51] text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-[#003d61] transition-colors"
                      >
                        Jetzt beitreten
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Meeting-Titel</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.meetings?.title ?? 'Nicht angegeben'}</p>
                    </div>
                    {appointment.meetings?.source && (
                      <div>
                        <p className="text-xs text-gray-500">Quelle</p>
                        <p className="text-sm text-gray-800">{appointment.meetings?.source}</p>
                      </div>
                    )}
                    {appointment.meetings?.link && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Meeting-Link</p>
                        <p className="text-sm text-blue-600 truncate">{appointment.meetings?.link}</p>
                      </div>
                    )}
                    {(appointment.meetings.address1 || appointment.meetings.city) && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Adresse</p>
                        <div className="text-sm text-gray-800">
                          {appointment.meetings.address1 && <p>{appointment.meetings.address1}</p>}
                          {appointment.meetings.address2 && <p>{appointment.meetings.address2}</p>}
                          {appointment.meetings.city && (
                            <p>
                              {appointment.meetings.city}
                              {appointment.meetings.state && `, ${appointment.meetings.state}`}
                              {appointment.meetings.zip && ` ${appointment.meetings.zip}`}
                            </p>
                          )}
                          {appointment.meetings.country && <p>{appointment.meetings.country}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Information */}
            {/* Pipeline Information */}
            {appointment.pipelines && (
              <div className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Building className="w-5 h-5 text-[#002d51] mt-0.5 flex-shrink-0" />
                <div className="flex-1 ml-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Pipeline-Informationen</p>
                    </div>
                    {appointment.pipelines.type && (
                      <span className="text-xs font-medium px-2 py-1 rounded border border-[#002d51] bg-[#002d51] text-white">
                        {appointment.pipelines.type}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-gray-500">Pipeline-Name</p>
                      <p className="text-sm font-medium text-gray-800">{appointment.pipelines.name}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Quelle</p>
                      <p className="text-sm text-gray-800">{appointment.pipelines.source}</p>
                    </div>

                    {appointment.pipelines.stages?.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Aktueller Stage</p>
                        <p className="text-sm text-gray-800">{appointment.pipelines.stages[0].name}</p>
          </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {appointment.description && (
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <FileText className="w-5 h-5 text-[#002d51] mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Beschreibung</p>
                  <p className="text-sm font-medium text-gray-800 mt-1 leading-relaxed">{appointment.description}</p>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-[#002d51] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Zusätzliche Informationen</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Erstellt</p>
                    <p className="font-medium text-gray-800">{formatDateTime(appointment.created_at || "")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Aktualisiert</p>
                    <p className="font-medium text-gray-800">{formatDateTime(appointment.updated_at || "")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Erinnerung gesendet</p>
                    <p className="font-medium text-gray-800">
                      {appointment.sent_remainder_email ? 'Ja' : 'Nein'}
                    </p>
                  </div>
                  {appointment.google_event_id && (
                    <div>
                      <p className="text-xs text-gray-500">Google Event ID</p>
                      <p className="font-mono text-gray-600 text-xs">{appointment.google_event_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => onEdit(appointment)}
              className="flex-1 bg-[#002d51] text-white py-3 px-4 rounded-xl hover:bg-[#003d61] transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <Edit3 size={16} />
              <span>Bearbeiten</span>
            </button>

            <button
              onClick={handleDeleteClick}
              className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              <Trash2 size={16} />
              <span>Löschen</span>
            </button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isConfirmationOpen}
          title="Termin löschen"
          message={`Sind Sie sicher, dass Sie den Termin "${appointment.title}" löschen möchten?`}
          confirmText="Ja, löschen"
          cancelText="Abbrechen"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </div>
  );
};

export default AppointmentActionDialog;