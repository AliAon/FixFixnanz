'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { autoLogout } from '@/redux/slices/authSlice';
import AuthTimeoutManager from '@/utils/authTimeout';
import { RootState } from '@/redux/store';

interface AuthTimeoutProviderProps {
  children: React.ReactNode;
}

const AuthTimeoutProvider: React.FC<AuthTimeoutProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const timeoutManagerRef = useRef<AuthTimeoutManager | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize the timeout manager only when authenticated
      timeoutManagerRef.current = new AuthTimeoutManager(
        {
          inactivityTimeout: 30 * 60 * 1000, // 30 minutes
          warningTimeout: 5 * 60 * 1000, // 5 minutes warning
          checkInterval: 60 * 1000, // check every minute
        },
        () => {
          // Auto logout callback
          dispatch(autoLogout());
          toast.error('Session expired due to inactivity. Please login again.');
          router.push('/login');
        },
        () => {
          // Warning callback
          const warningToastId = toast.warning(
            <div className="flex flex-col gap-2">
              <span>Your session will expire in 5 minutes due to inactivity.</span>
              <button
                className="text-blue-500 underline"
                onClick={() => {
                  toast.dismiss(warningToastId);
                  if (timeoutManagerRef.current) {
                    timeoutManagerRef.current.resetActivity();
                  }
                }}
              >
                Stay logged in
              </button>
            </div>,
            {
              autoClose: 60000, // Show for 1 minute
              position: 'top-center',
              closeOnClick: false,
              hideProgressBar: false,
            }
          );
        }
      );

      // Check token expiration on initialization
      if (timeoutManagerRef.current.checkTokenExpiration()) {
        dispatch(autoLogout());
        toast.error('Your session has expired. Please login again.');
        router.push('/login');
      }
    }

    // Cleanup on unmount or when authentication changes
    return () => {
      if (timeoutManagerRef.current) {
        timeoutManagerRef.current.cleanup();
        timeoutManagerRef.current = null;
      }
    };
  }, [isAuthenticated, token, dispatch, router]);

  // Additional check for token expiration on app focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated && timeoutManagerRef.current) {
        if (timeoutManagerRef.current.checkTokenExpiration()) {
          dispatch(autoLogout());
          toast.error('Your session has expired. Please login again.');
          router.push('/login');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, dispatch, router]);

  return <>{children}</>;
};

export default AuthTimeoutProvider; 