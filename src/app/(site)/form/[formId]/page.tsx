'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchDynamicFormById, submitForm, resetSubmitFormStatus, clearCurrentForm } from '@/redux/slices/dynamicFormsSlice';
import { toast } from 'react-toastify';
import { FormField, FormStep } from '@/redux/slices/dynamicFormsSlice';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormData = Record<string, any>;

interface ValidationError {
  [key: string]: string;
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.formId as string;
  
  const dispatch = useDispatch<AppDispatch>();
  const { currentForm, isLoading, error, submitFormStatus, submitFormError } = useSelector(
    (state: RootState) => state.dynamicForms
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch form data when component mounts
  useEffect(() => {
    if (formId) {
      dispatch(fetchDynamicFormById(formId));
    }
    
    return () => {
      dispatch(clearCurrentForm());
      dispatch(resetSubmitFormStatus());
    };
  }, [dispatch, formId]);

  // Handle form submission status
  useEffect(() => {
    if (submitFormStatus === 'succeeded') {
      toast.success('Form submitted successfully!');
      setFormData({});
      setCurrentStep(0);
      setIsSubmitting(false);
      dispatch(resetSubmitFormStatus());
    } else if (submitFormStatus === 'failed') {
      toast.error(submitFormError || 'Failed to submit form');
      setIsSubmitting(false);
      dispatch(resetSubmitFormStatus());
    }
  }, [submitFormStatus, submitFormError, dispatch]);

  // Handle form field change
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // add-dummy-comment
    // Clear validation error if it exists
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  // Validate form fields
  const validateStep = (step: FormStep): boolean => {
    const errors: ValidationError = {};
    let isValid = true;

    const sortedFields = [...step.form_fields].sort((a, b) => a.position - b.position);
    
    sortedFields.forEach(field => {
      const value = formData[field.id || ''];
      
      // Check required fields
      if (field.is_required && (!value || value === '')) {
        errors[field.id || ''] = `${field.label} is required`;
        isValid = false;
      }
      
      // Check field-specific validation
      if (value && field.field_type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field.id || ''] = 'Please enter a valid email address';
          isValid = false;
        }
      }
      
      // Check validation rules
      if (value && field.validation_rules) {
        const rules = field.validation_rules;
        
        if (rules.minLength && value.length < rules.minLength) {
          errors[field.id || ''] = `${field.label} must be at least ${rules.minLength} characters`;
          isValid = false;
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors[field.id || ''] = `${field.label} must be no more than ${rules.maxLength} characters`;
          isValid = false;
        }
        
        if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
          errors[field.id || ''] = `${field.label} format is invalid`;
          isValid = false;
        }
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Handle next step
  const handleNextStep = () => {
    if (!currentForm?.steps) return;
    
    const currentStepData = currentForm.steps[currentStep];
    if (validateStep(currentStepData)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!currentForm?.steps || !formId) return;
    
    const currentStepData = currentForm.steps[currentStep];
    if (!validateStep(currentStepData)) return;
    
    setIsSubmitting(true);
    
    const submissionData = {
      form_id: formId,
      submission_data: formData,
      ip_address: '',
      user_agent: navigator.userAgent,
    };
    
    dispatch(submitForm(submissionData));
  };

  // Render form field based on type
  const renderField = (field: FormField) => {
    const fieldId = field.id || '';
    const value = formData[fieldId] || '';
    const error = validationErrors[fieldId];
    
    const commonClasses = `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
      error ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
    }`;
    
    const renderInput = () => {
      switch (field.field_type) {
        case 'text':
        case 'email':
        case 'number':
          return (
            <input
              type={field.field_type}
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={commonClasses}
              placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            />
          );
        
        case 'textarea':
          return (
            <textarea
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={`${commonClasses} h-32 resize-vertical`}
              placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            />
          );
        
        case 'select':
          return (
            <select
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={commonClasses}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        
        case 'checkbox':
          return (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                id={fieldId}
                checked={value || false}
                onChange={(e) => handleFieldChange(fieldId, e.target.checked)}
                className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={fieldId} className="text-gray-700 font-medium cursor-pointer">
                {field.description || field.label}
              </label>
            </div>
          );
        
        case 'radio':
          return (
            <div className="space-y-3">
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <input
                    type="radio"
                    id={`${fieldId}-${index}`}
                    name={fieldId}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(fieldId, e.target.value)}
                    className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`${fieldId}-${index}`} className="text-gray-700 font-medium cursor-pointer">
                    {option}
                  </label>
                </div>
              ))}
            </div>
          );
        
        case 'date':
          return (
            <input
              type="date"
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={commonClasses}
            />
          );
        
        default:
          return (
            <input
              type="text"
              id={fieldId}
              value={value}
              onChange={(e) => handleFieldChange(fieldId, e.target.value)}
              className={commonClasses}
              placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
            />
          );
      }
    };
    
    return (
      <div key={fieldId} className="mb-6">
        <label htmlFor={fieldId} className="block text-base font-semibold text-gray-800 mb-2">
          {field.label}
          {field.is_required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {renderInput()}
        {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Loading form...</p>
          <p className="mt-2 text-gray-500">Please wait while we prepare your form</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50  flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Form Not Found</h1>
          <p className="text-gray-600 text-lg mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No form data
  if (!currentForm || !currentForm.steps?.length) {
    return (
      <div className="min-h-screen bg-gray-50  flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Form Available</h1>
          <p className="text-gray-600 text-lg">This form is not available or has no steps configured.</p>
        </div>
      </div>
    );
  }

  const sortedSteps = [...currentForm.steps].sort((a, b) => a.position - b.position);
  const totalSteps = sortedSteps.length;
  const currentStepData = sortedSteps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="min-h-screen mt-[150px] bg-gray-50  flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          {/* Form Header */}
          <div className="mb-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentForm.form_name}
              </h1>
              <p className="text-gray-600 text-lg">
                Please fill out the form below to continue
              </p>
            </div>
            
            {/* Progress indicator for multi-step forms */}
            {totalSteps > 1 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentStepData.step_name}
            </h2>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {[...currentStepData.form_fields]
              .sort((a, b) => a.position - b.position)
              .map(field => renderField(field))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-10 pt-8 border-t border-gray-200">
            <div>
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 text-base font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 shadow-sm"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </span>
                </button>
              )}
            </div>
            
            <div>
              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 text-base font-medium text-white bg-base border border-transparent rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-105 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit
                    </span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3 text-base font-medium text-white bg-base border border-transparent rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-lg transform hover:scale-105"
                >
                  <span className="flex items-center">
                    Next
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 