/* eslint-disable  @typescript-eslint/no-explicit-any */
// src/app/(admin)/admin/get-new-clients/[slug]/page.tsx - UPDATED VERSION
"use client";

import React, { useState, useEffect, JSX } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';

import { 
  FaCheck, FaStar, FaHeart, FaThumbsUp, FaFlag, FaBookmark,
  FaCalendar, FaClock, FaUser, FaUsers, FaBuilding, FaHome,
  FaCar, FaPlane, FaTrain, FaBus, FaBicycle, FaWalking,
  FaPhone, FaEnvelope, FaGlobe, FaMapMarker, FaGift, FaShoppingCart,
  FaCreditCard, FaMoneyBill, FaChartLine, FaBriefcase, FaGraduationCap 
} from 'react-icons/fa';

import {
  fetchFunnelBySlug,
  submitFunnelLead,
  clearCurrentFunnel,
  trackFunnelView
} from '@/redux/slices/funnelSlice';
import { createUser } from '@/redux/slices/usersSlice';

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
  hoverColor?: string;
  fontSize?: string;
  icon?: string;
  textAlign?: 'left' | 'center' | 'right';
  options?: string[];
  optionIcons?: string[];
}

interface FormData {
  [key: string]: string | string[];
}

// Toast notification component
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">×</button>
      </div>
    </div>
  );
};

// Main Preview Component
const FunnelPreviewPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const slug = params.slug as string;

  const {
    currentFunnel,
    loading,
    error
  } = useSelector((state: RootState) => state.funnel);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  //const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [isOnConfirmationStep, setIsOnConfirmationStep] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchFunnelBySlug(slug));
      // Track funnel view
      dispatch(trackFunnelView({ slug, visitorId: sessionStorage.getItem('visitorId') || undefined }));
    }
    return () => {
      dispatch(clearCurrentFunnel());
    };
  }, [dispatch, slug]);

  const handleInputChange = (inputType: string, value: string | string[], componentId: string) => {
    setFormData(prev => ({
      ...prev,
      [`${inputType}_${componentId}`]: value
    }));
  };

  const handleMultipleChoiceClick = (componentId: string, option: string) => {
    const currentSelection = (formData[`multiplechoice_${componentId}`] as string[]) || [];
    const newSelection = currentSelection.includes(option)
      ? currentSelection.filter(o => o !== option)
      : [...currentSelection, option];
    
    handleInputChange('multiplechoice', newSelection, componentId);
  };

  // Convert text to snake_case for additional_data format
  const toSnakeCase = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[äöü]/g, (match) => {
        const replacements: { [key: string]: string } = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue' };
        return replacements[match] || match;
      })
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  // Format multiple choice data for additional_data
  const formatAdditionalData = (): Record<string, any> => {
    const additionalData: Record<string, any> = {};
    
    if (!currentFunnel?.design?.steps) return additionalData;

    // Collect all multiple choice answers from all steps
    currentFunnel.design.steps.forEach(step => {
      step.components.forEach((component: Component) => {
        if (component.type === 'multiplechoice') {
          const answers = formData[`multiplechoice_${component.id}`] as string[];
          if (answers && answers.length > 0) {
            // Use the question text as key (converted to snake_case)
            const questionKey = toSnakeCase(component.text);
            // Convert answers to snake_case and join if multiple
            const answerValue = answers.map(answer => toSnakeCase(answer)).join(',');
            additionalData[questionKey] = answerValue;
          }
        }
      });
    });

    // Add timestamp
    additionalData.created_time = new Date().toISOString();

    return additionalData;
  };

  const handleSubmit = async () => {
    if (!currentFunnel || !slug) return;

    // Validate that user has agreed to terms
    if (!agreedToTerms) {
      setToast({ message: 'Bitte stimmen Sie den Bedingungen zu', type: 'error' });
      return;
    }

    setSubmitting(true);

    try {
      const userData = extractUserDataFromForm();
      const additionalData = formatAdditionalData();
      
      if (userData.email && userData.first_name) {
        // Create user with additional_data
        await dispatch(createUser({
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone,
          company_id: currentFunnel.companyId,
          pipeline_id: currentFunnel.pipelineId,
          stage_id: currentFunnel.stageId,
          additional_data: additionalData // Add the formatted multiple choice data
        })).unwrap();

        // Submit lead data
        await dispatch(submitFunnelLead({
          slug,
          leadData: { ...formData, additional_data: additionalData },
          stepId: 'confirmation' // Special step ID for confirmation
        })).unwrap();

        setToast({ 
          message: 'Vielen Dank! Ihre Registrierung war erfolgreich. Wir werden uns bald bei Ihnen melden.', 
          type: 'success' 
        });

        // Reset form after successful submission
        setTimeout(() => {
          setFormData({});
          setCurrentStepIndex(0);
          setIsOnConfirmationStep(false);
          setAgreedToTerms(false);
        }, 2000);
        
      } else {
        setToast({ message: 'Bitte geben Sie mindestens Name und E-Mail an', type: 'error' });
      }
    } catch (error: any) {
      setToast({ 
        message: error.message || 'Fehler beim Übermitteln der Daten', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const extractUserDataFromForm = () => {
    const userData = {
      first_name: '',
      last_name: '',
      email: '',
      phone: ''
    };

    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (!value || Array.isArray(value)) return;

      if (key.startsWith('email_')) {
        userData.email = value;
      } else if (key.startsWith('tel_')) {
        userData.phone = value;
      } else if (key.startsWith('text_')) {
        if (!userData.first_name) {
          userData.first_name = value;
        } else if (!userData.last_name) {
          userData.last_name = value;
        }
      }
    });

    // Parse full name if needed
    if (userData.first_name && !userData.last_name) {
      const nameParts = userData.first_name.trim().split(' ');
      if (nameParts.length > 1) {
        userData.first_name = nameParts[0];
        userData.last_name = nameParts.slice(1).join(' ');
      }
    }

    if (!userData.last_name) {
      userData.last_name = ' ';
    }

    return userData;
  };

  const goToNextStep = () => {
    const currentStep = currentFunnel?.design?.steps?.[currentStepIndex];
    if (!currentStep) return;

    // Validate current step before proceeding
    const hasInputs = currentStep.components.some((comp: { type: string; }) => 
      comp.type === 'input' || comp.type === 'multiplechoice'
    );
    
    if (hasInputs) {
      const requiredFields = currentStep.components
        .filter((comp: { type: string; }) => comp.type === 'input')
        .map((comp: Component) => `${comp.inputType || 'text'}_${comp.id}`);

      const missingFields = requiredFields.filter((field: string | number) => {
        const value = formData[field];
        if (Array.isArray(value)) return value.length === 0;
        return !value || !value.trim();
      });
      
      if (missingFields.length > 0) {
        setToast({ message: 'Bitte füllen Sie alle Felder aus', type: 'error' });
        return;
      }
    }

    const totalSteps = currentFunnel?.design?.steps?.length || 0;
    
    // Check if we're on the last regular step
    if (currentStepIndex === totalSteps - 1) {
      // Move to confirmation step
      setIsOnConfirmationStep(true);
    } else {
      // Move to next regular step
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (isOnConfirmationStep) {
      setIsOnConfirmationStep(false);
    } else if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleBackToAdmin = () => {
    router.push('/admin/get-new-clients');
  };

  const renderComponent = (component: Component) => {
    const baseStyle: React.CSSProperties = {
      color: component.color || '#002d51',
      fontSize: component.fontSize || '16px',
      backgroundColor: component.backgroundColor || 'transparent',
      margin: '12px 0',
      padding: component.type === 'button' ? '12px 24px' : '8px',
      border: component.type === 'button' ? 'none' : '1px solid transparent',
      borderRadius: component.type === 'button' ? '8px' : '4px',
      cursor: component.type === 'button' ? 'pointer' : 'default',
      lineHeight: '1.6',
      width: component.type === 'input' ? '100%' : 'auto',
      maxWidth: component.type === 'input' ? '400px' : 'none',
      textAlign: component.textAlign || 'left',
    } as const;

    switch(component.type) {
      case 'heading':
        const HeadingTag = component.level as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            key={component.id}
            style={baseStyle}
          >
            {component.text}
          </HeadingTag>
        );

      case 'paragraph':
        return (
          <p 
            key={component.id}
            style={{ ...baseStyle, whiteSpace: 'pre-line' }}
          >
            {component.text}
          </p>
        );

      case 'button':
        return (
          <button 
            key={component.id}
            style={{
              ...baseStyle,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => {
              if (component.link) {
                window.open(component.link, '_blank');
              } else {
                goToNextStep();
              }
            }}
            disabled={submitting}
            onMouseOver={(e) => {
              if (!submitting && component.hoverColor) {
                e.currentTarget.style.backgroundColor = component.hoverColor;
              }
              if (!submitting) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = component.backgroundColor || '#002d51';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            {component.icon && <span>{component.icon}</span>}
            <span>{component.text}</span>
          </button>
        );

      case 'input':
        const placeholder = component.inputType === 'email' ? 'Ihre E-Mail-Adresse' :
                          component.inputType === 'tel' ? 'Ihre Telefonnummer' :
                          component.inputType === 'text' ? 'Ihr Name' : 'Text eingeben';
        
        return (
          <input 
            key={component.id}
            type={component.inputType || 'text'} 
            placeholder={placeholder}
            value={(formData[`${component.inputType}_${component.id}`] as string) || ''}
            onChange={(e) => handleInputChange(component.inputType || 'text', e.target.value, component.id)}
            style={{ 
              ...baseStyle, 
              border: '2px solid #e5e7eb',
              padding: '14px 16px',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#002d51';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 45, 81, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        );

      case 'image':
        return (
          <div 
            key={component.id}
            style={{
              textAlign: component.textAlign || 'left',
              margin: '12px 0'
            }}
          >
            <img 
              src={component.src || 'https://via.placeholder.com/400x200?text=Bild'}
              alt={component.alt || 'Bild'}
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: component.textAlign === 'center' ? 'inline-block' : 'block',
              }}
            />
          </div>
        );

      case 'divider':
        return (
          <div 
            key={component.id}
            style={{ 
              width: '100%', 
              height: '1px', 
              background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)', 
              margin: '32px 0' 
            }} 
          />
        );

case 'multiplechoice':
  const selectedOptions = (formData[`multiplechoice_${component.id}`] as string[]) || [];
  
  // Add getIconComponent function for React Icons
// Add getIconComponent function for React Icons
const getIconComponent = (iconName: string, isSelected: boolean) => {
  const iconColor = isSelected ? '#10b981' : '#9ca3af';
  
  const iconMap: { [key: string]: JSX.Element } = {
    'fa-check': <FaCheck style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-star': <FaStar style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-heart': <FaHeart style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-thumbs-up': <FaThumbsUp style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-flag': <FaFlag style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-bookmark': <FaBookmark style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-calendar': <FaCalendar style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-clock': <FaClock style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-user': <FaUser style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-users': <FaUsers style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-building': <FaBuilding style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-home': <FaHome style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-car': <FaCar style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-plane': <FaPlane style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-train': <FaTrain style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-bus': <FaBus style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-bicycle': <FaBicycle style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-walking': <FaWalking style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-phone': <FaPhone style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-envelope': <FaEnvelope style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-globe': <FaGlobe style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-map-marker': <FaMapMarker style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-gift': <FaGift style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-shopping-cart': <FaShoppingCart style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-credit-card': <FaCreditCard style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-money-bill': <FaMoneyBill style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-chart-line': <FaChartLine style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-briefcase': <FaBriefcase style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
    'fa-graduation-cap': <FaGraduationCap style={{ fontSize: '18px', width: '20px', color: iconColor }} />,
  };
  
  return iconMap[iconName] || <FaCheck style={{ fontSize: '18px', width: '20px', color: iconColor }} />;
};

  return (
    <div 
      key={component.id}
      style={{ 
        ...baseStyle,
        padding: '20px 0',
        border: 'none',
        backgroundColor: 'transparent'
      }}
    >
      <div style={{ 
        fontWeight: '600', 
        marginBottom: '20px', 
        fontSize: '20px',
        textAlign: component.textAlign || 'left',
        color: component.color || '#002d51'
      }}>
        {component.text}
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: component.textAlign === 'center' ? 'center' : 
                     component.textAlign === 'right' ? 'flex-end' : 'flex-start'
      }}>
        {component.options?.map((option, idx) => {
          const isSelected = selectedOptions.includes(option);
          const optionIcon = component.optionIcons?.[idx] || 'fa-check';
          
          return (
            <button
              key={idx}
              onClick={() => handleMultipleChoiceClick(component.id, option)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 24px',
                background: isSelected ? '#ecfdf5' : 'white',
                border: `2px solid ${isSelected ? '#10b981' : '#d1d5db'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                color: isSelected ? '#059669' : '#002d51',
                minWidth: '140px',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
                flex: '0 1 auto'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Use React Icons instead of Font Awesome classes */}
              {getIconComponent(optionIcon, isSelected)}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

      default:
        return <div key={component.id}>Unbekannte Komponente</div>;
    }
  };

  // Render confirmation step
// Replace the renderConfirmationStep function in your preview page

const renderConfirmationStep = () => {
  const settings = currentFunnel?.design?.settings || {};
  const submitButtonText = settings.submitButtonText || 'Jetzt Absenden';
  const submitButtonColor = settings.submitButtonColor || '#10b981';
  const submitButtonTextColor = settings.submitButtonTextColor || '#ffffff';
  const submitButtonHoverColor = settings.submitButtonHoverColor || '#059669';
  const privacyPolicy = settings.privacyPolicy || '';
  const privacyPolicyLink = settings.privacyPolicyLink || '';
  const privacyPolicyLinkText = settings.privacyPolicyLinkText || '';

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#002d51', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        Bestätigung Ihrer Angaben
      </h2>

      <p style={{
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '32px',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        Bitte überprüfen Sie Ihre Angaben und stimmen Sie unseren Bedingungen zu.
      </p>

      {/* Summary of entered data */}
      <div style={{
        background: '#f9fafb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          fontSize: '18px', 
          fontWeight: '600', 
          color: '#002d51', 
          marginBottom: '16px' 
        }}>
          Ihre Angaben:
        </h3>
        
        {Object.entries(formData).map(([key, value]) => {
          if (key.startsWith('multiplechoice_')) return null;
          
          let label = 'Angabe';
          if (key.startsWith('text_')) label = 'Name';
          if (key.startsWith('email_')) label = 'E-Mail';
          if (key.startsWith('tel_')) label = 'Telefon';
          
          if (!value || (Array.isArray(value) && value.length === 0)) return null;
          
          return (
            <div key={key} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>{label}:</span>
              <span style={{ color: '#002d51', fontSize: '14px', fontWeight: '500' }}>
                {Array.isArray(value) ? value.join(', ') : value}
              </span>
            </div>
          );
        })}

        {/* Show multiple choice selections */}
        {currentFunnel?.design?.steps?.map(step => 
          step.components
            .filter((comp: Component) => comp.type === 'multiplechoice')
            .map((comp: Component) => {
              const answers = formData[`multiplechoice_${comp.id}`] as string[];
              if (!answers || answers.length === 0) return null;
              
              return (
                <div key={comp.id} style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>
                    {comp.text}:
                  </div>
                  <div style={{ color: '#002d51', fontSize: '14px', fontWeight: '500' }}>
                    {answers.join(', ')}
                  </div>
                </div>
              );
            })
        )}
      </div>


        {/* Privacy Policy Section */}
        {privacyPolicy && (
          <div style={{
            marginBottom: '32px',
            padding: '20px',
            background: '#f9fafb',
            borderRadius: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <i className="fas fa-shield-alt" style={{ marginRight: '8px', color: '#10b981', fontSize: '16px' }}></i>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#002d51',
                margin: 0
              }}>
                Datenschutzerklärung & Bedingungen
              </h3>
            </div>
            
            {/* Privacy Policy Text - Always visible */}
            <div style={{
              fontSize: '14px',
              lineHeight: '1.8',
              color: '#6b7280',
              whiteSpace: 'pre-line',
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: privacyPolicyLink ? '16px' : '0'
            }}>
              {privacyPolicy}
            </div>

            {/* Privacy Policy Link - Shown as hyperlink */}
            {privacyPolicyLink && (
              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb'
              }}>
                {privacyPolicyLinkText ? (
                  // Custom link text provided - show as hyperlink with icon
                  <a
                    href={privacyPolicyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#10b981',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#059669';
                      e.currentTarget.style.borderBottomColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#10b981';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }}
                  >
                    <i className="fas fa-external-link-alt" style={{ fontSize: '12px' }}></i>
                    <span>{privacyPolicyLinkText}</span>
                  </a>
                ) : (
                  // No custom text, show direct URL as hyperlink
                  <a
                    href={privacyPolicyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#10b981',
                      textDecoration: 'none',
                      fontSize: '13px',
                      wordBreak: 'break-all',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#059669';
                      e.currentTarget.style.borderBottomColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#10b981';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }}
                  >
                    <i className="fas fa-link" style={{ fontSize: '11px' }}></i>
                    <span>{privacyPolicyLink}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}
              {/* Agreement Checkbox */}
              <div style={{
                marginBottom: '32px',
                padding: '20px',
                background: agreedToTerms ? '#ecfdf5' : '#fff',
                borderRadius: '12px',
                border: `2px solid ${agreedToTerms ? '#10b981' : '#e5e7eb'}`,
                transition: 'all 0.2s ease'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  fontSize: '15px',
                  color: '#002d51'
                }}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{
                      marginRight: '12px',
                      marginTop: '2px',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ lineHeight: '1.6' }}>
                    Ich bestätige, dass meine Angaben korrekt sind und stimme den Datenschutzbestimmungen 
                    und Nutzungsbedingungen zu. Ich bin damit einverstanden, kontaktiert zu werden.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !agreedToTerms}
                style={{
                  width: '100%',
                  padding: '18px 32px',
                  background: submitting || !agreedToTerms ? '#9ca3af' : submitButtonColor,
                  color: submitButtonTextColor,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: submitting || !agreedToTerms ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: agreedToTerms ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  transform: 'translateY(0)',
                  opacity: !agreedToTerms ? '0.6' : '1'
                }}
                onMouseEnter={(e) => {
                  if (!submitting && agreedToTerms) {
                    e.currentTarget.style.background = submitButtonHoverColor;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting && agreedToTerms) {
                    e.currentTarget.style.background = submitButtonColor;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }
                }}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                    Wird übermittelt...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                    {submitButtonText}
                  </>
                )}
              </button>

              {!agreedToTerms && (
                <p style={{
                  marginTop: '12px',
                  fontSize: '13px',
                  color: '#ef4444',
                  textAlign: 'center'
                }}>
                  * Bitte stimmen Sie den Bedingungen zu, um fortzufahren
                </p>
              )}
            </div>
          );
        };

  if (loading.currentFunnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-500 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Lade Funnel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Funnel nicht gefunden</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBackToAdmin}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  if (!currentFunnel || !currentFunnel.design || !currentFunnel.design.steps || currentFunnel.design.steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-gray-500 text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Funnel nicht verfügbar</h2>
          <p className="text-gray-600 mb-6">Der angeforderte Funnel wurde nicht gefunden oder ist nicht öffentlich verfügbar.</p>
          <button
            onClick={handleBackToAdmin}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  const steps = currentFunnel.design.steps;
  const currentStep = isOnConfirmationStep ? null : steps[currentStepIndex];
  const settings = currentFunnel.design.settings || {};

  // Extract all settings with fallback values
  const showProgressBar = settings.showProgressBar !== false;
  const nextButtonText = settings.nextButtonText || 'Weiter';
  const nextButtonColor = settings.nextButtonColor || '#10b981';
  const nextButtonHoverColor = settings.nextButtonHoverColor || '#059669';
  const previousButtonText = settings.previousButtonText || 'Zurück';
  const previousButtonColor = settings.previousButtonColor || '#6b7280';
  const previousButtonHoverColor = settings.previousButtonHoverColor || '#4b5563';

  // Calculate progress including confirmation step
  const totalStepsWithConfirmation = steps.length + 1;
  const currentStepNumber = isOnConfirmationStep ? totalStepsWithConfirmation : currentStepIndex + 1;
  const progressPercentage = Math.round((currentStepNumber / totalStepsWithConfirmation) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Progress bar */}
      {showProgressBar && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">
                Schritt {currentStepNumber} von {totalStepsWithConfirmation}
              </span>
              <span className="text-sm font-medium text-emerald-600">
                {progressPercentage}% abgeschlossen
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 py-12">
            {isOnConfirmationStep ? (
              renderConfirmationStep()
            ) : (
              <div className="max-w-2xl mx-auto space-y-6 text-center">
                {currentStep && currentStep.components.map((component: Component) => renderComponent(component))}
              </div>
            )}
            
            {/* Step Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200 max-w-2xl mx-auto">
              <button
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0 && !isOnConfirmationStep}
                style={{
                  backgroundColor: (currentStepIndex === 0 && !isOnConfirmationStep) ? '#d1d5db' : previousButtonColor,
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-white"
                onMouseOver={(e) => {
                  if (!(currentStepIndex === 0 && !isOnConfirmationStep)) {
                    e.currentTarget.style.backgroundColor = previousButtonHoverColor;
                  }
                }}
                onMouseOut={(e) => {
                  if (!(currentStepIndex === 0 && !isOnConfirmationStep)) {
                    e.currentTarget.style.backgroundColor = previousButtonColor;
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {previousButtonText}
              </button>
              
              <div className="text-center">
                <span className="text-sm text-gray-500 font-medium">
                  {isOnConfirmationStep 
                    ? 'Bestätigung' 
                    : (currentStep?.title.split(': ')[1] || currentStep?.title || '')}
                </span>
              </div>
              
              {!isOnConfirmationStep && (
                <button
                  onClick={goToNextStep}
                  style={{ backgroundColor: nextButtonColor }}
                  className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all font-medium"
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = nextButtonHoverColor;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = nextButtonColor;
                  }}
                >
                  {currentStepIndex === steps.length - 1 ? 'Zur Bestätigung' : nextButtonText}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {isOnConfirmationStep && (
                <div style={{ width: '100px' }}></div> // Spacer for alignment
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} {currentFunnel.name}. Alle Rechte vorbehalten.</p>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx global>{`
        * { 
          box-sizing: border-box; 
        }
        html, body { 
          margin: 0; 
          padding: 0; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
        }
        button:hover:not(:disabled) { 
          transform: translateY(-1px); 
        }
        button:disabled { 
          opacity: 0.6; 
          cursor: not-allowed; 
          transform: none !important; 
        }
        input:focus { 
          outline: none; 
        }
        .transition-all { 
          transition: all 0.3s ease; 
        }
        ::-webkit-scrollbar { 
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track { 
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb { 
          background: #cbd5e1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover { 
          background: #94a3b8;
        }
        @media (max-width: 768px) {
          .max-w-4xl { 
            padding-left: 1rem; 
            padding-right: 1rem; 
          }
          .px-8 { 
            padding-left: 1.5rem; 
            padding-right: 1.5rem; 
          }
          button {
            font-size: 14px;
            padding: 10px 16px;
          }
          input {
            font-size: 14px;
            padding: 12px 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default FunnelPreviewPage;