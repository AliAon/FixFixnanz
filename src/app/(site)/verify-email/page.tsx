"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Redux imports
import { AppDispatch, RootState } from '@/redux/store';
import { verifyEmail } from '@/redux/slices/authSlice'; // Ensure this path is correct

const VerifyEmailContent: React.FC = () => {
  // Hooks
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Local state
  const [isVerifying, setIsVerifying] = useState(true);
  
  // Select verification status from Redux store
  const { 
    emailVerificationStatus, 
    emailVerificationError 
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Extract token from URL
    const token = searchParams.get('token');

    // Validate token
    if (!token) {
      toast.error('Invalid verification link');
      router.push('/login');
      return;
    }

    // Verify email function
    const verifyUserEmail = async () => {
      try {
        // Dispatch email verification thunk
        await dispatch(verifyEmail(token)).unwrap();
        
        // Success handling
        toast.success('Email verified successfully! Redirecting to dashboard...');
        
        // Check user role and redirect accordingly
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            if (user.role === 'admin') {
              router.push('/admin');
            } else if (user.role === 'financial-advisor') {
              router.push('/customer-dashboard');
            } else {
              router.push('/customer-dashboard');
            }
          } catch (parseError) {
            console.error('Error parsing user data:', parseError);
            router.push('/customer-dashboard');
          }
        } else {
          router.push('/customer-dashboard');
        }
      } catch (error: unknown) {
        // Error handling
        if (error instanceof Error) {
          toast.error(
            error.message || 
            'Email verification failed. Please try again or request a new link.'
          );
        } else {
          toast.error('Email verification failed. Please try again or request a new link.');
        }
        router.push('/login');
      } finally {
        // Always set verifying to false
        setIsVerifying(false);
      }
    };

    // Call verification function
    verifyUserEmail();
  }, [dispatch, router, searchParams]);

  // Render verification status
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center w-96">
        {isVerifying ? (
          <VerifyingState />
        ) : emailVerificationStatus === 'failed' ? (
          <FailedState error={emailVerificationError} />
        ) : (
          <SuccessState />
        )}
      </div>
    </div>
  );
};

// Subcomponents for different states
const VerifyingState: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-blue-600">Verifying Email</h2>
    <p className="text-gray-600 mb-4">Please wait while we verify your email address.</p>
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
    </div>
  </div>
);

const FailedState: React.FC<{ error: string | null }> = ({ error }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-red-500">Verification Failed</h2>
    <p className="text-gray-600 mb-4">
      {error || 'There was an issue verifying your email. Please try again.'}
    </p>
    <button 
      onClick={() => window.location.href = '/login'}
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
    >
      Return to Login
    </button>
  </div>
);

const SuccessState: React.FC = () => (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-green-600">Verification Complete</h2>
    <p className="text-gray-600 mb-4">
      Your email has been successfully verified. 
      You will be redirected to the login page shortly.
    </p>
    <div className="flex justify-center">
      <div className="animate-pulse h-1 w-16 bg-green-500 rounded"></div>
    </div>
  </div>
);

const VerifyEmailPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmailPage;