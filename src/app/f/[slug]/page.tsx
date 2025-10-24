/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/app/f/[slug]/page.tsx
"use client";

import React, { useState, useEffect, JSX } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import {
  fetchFunnelBySlug,
  trackFunnelView,
  submitFunnelLead,
  clearCurrentFunnel,
} from '@/redux/slices/funnelSlice';

// Types
interface Component {
  id: string;
  type: string;
  text: string;
  level?: string;
  inputType?: string;
  src?: string;
  alt?: string;
  link?: string;
  author?: string;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
}

interface FormData {
  [key: string]: string;
}

// Generate visitor ID for tracking
const generateVisitorId = () => {
  if (typeof window === 'undefined') return '';
  
  try {
    const stored = localStorage.getItem('funnel_visitor_id');
    if (stored) return stored;
    
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('funnel_visitor_id', id);
    return id;
  } catch (error) {
    console.error('Error generating visitor ID:', error);
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
};

// Client-only wrapper to prevent hydration issues
const ClientOnlyWrapper = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Funnel...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Toast notification component
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Lade Funnel...</p>
    </div>
  </div>
);

// Error component
const ErrorPage: React.FC<{ error: string; onRetry: () => void }> = ({ onRetry }) => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center max-w-md px-4">
      <div className="text-red-500 text-6xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Seite nicht gefunden</h1>
      <p className="text-gray-600 mb-6">
        Der angeforderte Funnel konnte nicht gefunden werden oder ist nicht mehr verfügbar.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onRetry}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  </div>
);

// Main Public Funnel Viewer Component
const PublicFunnelViewerContent: React.FC = () => {
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { currentFunnel, loading, error } = useSelector((state: RootState) => state.funnel);
  
  // Local state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [visitorId, setVisitorId] = useState('');

  const slug = params.slug as string;

  // Initialize visitor ID after mounting
  useEffect(() => {
    setVisitorId(generateVisitorId());
  }, []);

  // Load funnel data and track view
  useEffect(() => {
    if (slug) {
      dispatch(fetchFunnelBySlug(slug));
      
      // Track the initial view
      if (visitorId) {
        dispatch(trackFunnelView({ slug, visitorId }));
      }
    }

    return () => {
      dispatch(clearCurrentFunnel());
    };
  }, [dispatch, slug, visitorId]);

  // Track step views
  useEffect(() => {
    if (currentFunnel && currentStepIndex >= 0 && visitorId) {
      const currentStep = currentFunnel.design.steps[currentStepIndex];
      if (currentStep) {
        dispatch(trackFunnelView({ 
          slug, 
          stepId: currentStep.id, 
          visitorId 
        }));
      }
    }
  }, [dispatch, currentFunnel, currentStepIndex, slug, visitorId]);

  // Handle form input changes
  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // Handle form submission
  const handleFormSubmit = async (stepId: string) => {
    if (!currentFunnel || isSubmitting) return;

    // Validate required fields
    const currentStep = currentFunnel.design.steps[currentStepIndex];
    const requiredFields = currentStep.components
      .filter(comp => comp.type === 'input')
      .map(comp => `${comp.inputType || 'text'}_${comp.id}`);

    const missingFields = requiredFields.filter(field => !formData[field] || !formData[field].trim());
    
    if (missingFields.length > 0) {
      setToast({ message: 'Bitte füllen Sie alle Felder aus.', type: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(submitFunnelLead({
        slug,
        leadData: formData,
        stepId
      })).unwrap();

      setToast({ message: 'Ihre Daten wurden erfolgreich übermittelt!', type: 'success' });
      
      // Move to next step if available
      if (currentStepIndex < currentFunnel.design.steps.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 1500);
      }

    } catch (error: any) {
      setToast({ 
        message: error.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate between steps
  const goToNextStep = () => {
    if (currentFunnel && currentStepIndex < currentFunnel.design.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Render component content
  const renderComponent = (component: Component, stepIndex: number) => {
    const baseStyle = {
      color: component.color || '#002d51',
      fontSize: component.fontSize || '16px',
      backgroundColor: component.backgroundColor || 'transparent',
      margin: '16px 0',
      padding: component.type === 'button' ? '14px 28px' : '0',
      border: component.type === 'button' ? 'none' : 'none',
      borderRadius: component.type === 'button' ? '8px' : '0',
      cursor: component.type === 'button' ? 'pointer' : 'default',
      lineHeight: '1.6',
      textAlign: 'center' as const
    };

    const fieldName = `${component.inputType || component.type}_${component.id}`;

    switch(component.type) {
      case 'heading':
        const HeadingTag = component.level as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag key={component.id} style={baseStyle}>
            {component.text}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p key={component.id} style={{ ...baseStyle, whiteSpace: 'pre-line' }}>
            {component.text}
          </p>
        );

      case 'button':
        const hasFormInputs = currentFunnel?.design.steps[stepIndex]?.components.some(comp => comp.type === 'input');
        
        return (
          <button 
            key={component.id}
            style={{
              ...baseStyle,
              display: 'inline-block',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              transform: 'scale(1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onClick={() => {
              if (component.link) {
                window.open(component.link, '_blank');
              } else if (hasFormInputs) {
                handleFormSubmit(currentFunnel!.design.steps[stepIndex].id);
              } else {
                goToNextStep();
              }
            }}
            disabled={isSubmitting}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            {isSubmitting ? 'Wird übermittelt...' : component.text}
          </button>
        );

      case 'input':
        const placeholder = component.inputType === 'email' ? 'Ihre E-Mail-Adresse' :
                          component.inputType === 'tel' ? 'Ihre Telefonnummer' :
                          component.inputType === 'text' ? 'Ihr Name' : 'Eingabe';
        
        return (
          <input 
            key={component.id}
            type={component.inputType || 'text'} 
            placeholder={placeholder}
            value={formData[fieldName] || ''}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            required
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '14px 16px',
              fontSize: '16px',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              margin: '8px 0',
              transition: 'border-color 0.2s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = component.color || '#002d51';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e2e8f0';
            }}
          />
        );

      case 'image':
        return (
          <img 
            key={component.id}
            src={component.src || 'https://via.placeholder.com/400x200?text=Bild'} 
            alt={component.alt || 'Bild'}
            style={{ 
              ...baseStyle, 
              maxWidth: '100%', 
              height: 'auto',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
        );

      case 'divider':
        return (
          <div 
            key={component.id}
            style={{ 
              width: '60%', 
              height: '2px', 
              background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)', 
              margin: '32px auto' 
            }} 
          />
        );

      case 'testimonial':
        return (
          <div 
            key={component.id}
            style={{ 
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', 
              padding: '24px', 
              borderLeft: `4px solid ${component.color || '#002d51'}`, 
              borderRadius: '12px',
              margin: '24px auto',
              maxWidth: '500px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <p style={{ 
              marginBottom: '12px', 
              fontSize: '18px', 
              fontStyle: 'italic',
              color: '#374151'
            }}>
              &quot;{component.text}&quot;
            </p>
            <p style={{ 
              fontWeight: 'bold', 
              color: component.color || '#002d51',
              margin: 0
            }}>
              - {component.author}
            </p>
          </div>
        );

      case 'countdown':
        return (
          <div 
            key={component.id}
            style={{
              textAlign: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#dc2626',
              margin: '24px 0',
              padding: '16px',
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              borderRadius: '12px',
              border: '2px solid #fecaca'
            }}
          >
            ⏰ 23:59:47
          </div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (loading.currentFunnel) {
    return <LoadingSpinner />;
  }

  // Error state
  if (error || !currentFunnel) {
    return (
      <ErrorPage 
        error={error || 'Funnel nicht gefunden'} 
        onRetry={() => {
          if (slug) {
            dispatch(fetchFunnelBySlug(slug));
          }
        }}
      />
    );
  }

  // Check if funnel is active
  if (currentFunnel.status !== 'active') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-gray-400 text-6xl mb-6">🚧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Funnel nicht verfügbar</h1>
          <p className="text-gray-600">
            Dieser Funnel ist derzeit nicht aktiv oder befindet sich noch in der Entwicklung.
          </p>
        </div>
      </div>
    );
  }

  const currentStep = currentFunnel.design.steps[currentStepIndex];
  const totalSteps = currentFunnel.design.steps.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Progress Bar */}
      {totalSteps > 1 && (
        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      )}

      {/* Step Navigation */}
      {totalSteps > 1 && (
        <div className="fixed top-4 left-4 z-40">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg border">
            <span className="text-sm font-medium text-gray-600">
              Schritt {currentStepIndex + 1} von {totalSteps}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8" style={{ paddingTop: totalSteps > 1 ? '80px' : '40px' }}>
        <div className="max-w-2xl mx-auto">
          <div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[70vh] flex flex-col justify-center"
            style={{
              animation: 'fadeInUp 0.6s ease-out',
              padding: '60px 40px'
            }}
          >
            {/* Step Content */}
            <div className="text-center">
              {currentStep.components.map((component) => 
                renderComponent(component, currentStepIndex)
              )}
            </div>

            {/* Navigation Buttons */}
            {totalSteps > 1 && (
              <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-100">
                <button
                  onClick={goToPrevStep}
                  disabled={currentStepIndex === 0}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Zurück
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: totalSteps }, (_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStepIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentStepIndex
                          ? 'bg-blue-500 scale-125'
                          : index < currentStepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNextStep}
                  disabled={currentStepIndex === totalSteps - 1}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Weiter →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        input:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        
        button:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

// Main export component with client-only wrapper
const PublicFunnelViewer: React.FC = () => {
  return (
    <ClientOnlyWrapper>
      <PublicFunnelViewerContent />
    </ClientOnlyWrapper>
  );
};

export default PublicFunnelViewer;