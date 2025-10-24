import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchLeadTrackingsByUserId } from '@/redux/slices/leadTrackingSlice';

interface LeadTrackingActivitiesProps {
  userId: string;
  contactCreatedAt?: string;
}

const LeadTrackingActivities: React.FC<LeadTrackingActivitiesProps> = ({
  userId,
  contactCreatedAt
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leadTrackings, isLoading } = useSelector((state: RootState) => state.leadTracking);

  useEffect(() => {
    if (userId) {
      dispatch(fetchLeadTrackingsByUserId(userId));
    }
  }, [dispatch, userId]);

  // Function to format date consistently to German format
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '';

      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid
      }

      // Format: DD.MM.YYYY - HH:MM Uhr
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}.${month}.${year} - ${hours}:${minutes} Uhr`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="text-gray-500">Loading activities...</div>
      </div>
    );
  }

  // Filter activities for the specific user
  const userActivities = leadTrackings.filter(activity =>
    activity.user_id === userId || activity.userId === userId
  );

  // Create registration activity
  const createRegistrationActivity = () => {
    if (!contactCreatedAt) return null;

    return (
      <div className="relative mb-6" key="registration-activity">
        <div className="absolute left-4 -ml-2 h-4 w-4 rounded-full bg-green-500 border-4 border-white"></div>
        <div className="ml-12 bg-gray-50 p-4 rounded shadow-sm">
          <div className="flex items-center mb-2">
            <p className="font-bold mr-2">Lead Registration</p>
            <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">System</span>
          </div>
          <p className="text-sm text-gray-600">
            Anfrage wurde erstellt: {formatDate(contactCreatedAt)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Lead wurde erfolgreich im System registriert
          </p>
        </div>
      </div>
    );
  };

  // Combine all activities
  const allActivities = [];

  // Add registration activity if we have creation date
  if (contactCreatedAt) {
    allActivities.push({
      id: 'registration',
      type: 'registration',
      created_at: contactCreatedAt,
      component: createRegistrationActivity()
    });
  }

  // Add actual lead tracking activities
  userActivities.forEach((tracking, index) => {
    allActivities.push({
      id: tracking.id || `activity-${index}`,
      type: 'tracking',
      created_at: tracking.created_at,
      component: (
        <div className="relative mb-6" key={tracking.id || `activity-${index}`}>
          <div
            dangerouslySetInnerHTML={{ __html: tracking.activity }}
          />
        </div>
      )
    });
  });

  // Sort activities by date (newest first)
  allActivities.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-4">
      {allActivities.length > 0 ? (
        allActivities.map(activity => activity.component)
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Keine Aktivitäten verfügbar</p>
        </div>
      )}
    </div>
  );
};

export default LeadTrackingActivities;