/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, JSX } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';

import { 
  FaCheck, FaStar, FaHeart, FaThumbsUp, FaFlag, FaBookmark,
  FaCalendar, FaClock, FaUser, FaUsers, FaBuilding, FaHome,
  FaCar, FaPlane, FaTrain, FaBus, FaBicycle, FaWalking,
  FaPhone, FaEnvelope, FaGlobe, FaMapMarker, FaGift, FaShoppingCart,
  FaCreditCard, FaMoneyBill, FaChartLine, FaBriefcase, FaGraduationCap, FaCircle,
  // Add all these new icons:
  FaIdCard,
  FaChartBar,
  FaChartPie,
  FaLocationArrow,
  FaComment,
  FaComments,
  FaCommentDots,
  FaCommentAlt,
  FaMoneyBillWave,
  FaReceipt,
  FaTag,
  FaTags,
  FaPercent,
  FaBook,
  FaBookOpen,
  FaUniversity,
  FaHeartbeat,
  FaRunning,
  FaDumbbell,
  FaBasketballBall,
  FaLaptop,
  FaMobile,
  FaTablet,
  FaDesktop,
  FaWifi,
  FaUtensils,
  FaCoffee,
  FaPizzaSlice,
  FaHamburger,
  FaKey,
  FaDoorOpen,
  FaMotorcycle,
  FaGasPump,
  FaWrench,
  FaUmbrellaBeach,
  FaPassport,
  FaPiggyBank,
  FaHandHoldingUsd,
  FaCoins,
  FaStethoscope,
  FaHospital,
  FaPills,
  FaTshirt,
  FaGem,
  FaRing,
  FaPalette,
  FaBaby,
  FaChild,
  FaUserFriends,
  FaPaw,
  FaDog,
  FaCat,
  FaTools,
  FaScrewdriver,
  FaHammer,
  FaShieldAlt,
  FaLock,
  FaUnlock
} from 'react-icons/fa';

import {
  fetchFunnelById,
  createFunnel,
  updateFunnel,
  clearCurrentFunnel,
  uploadFunnelImage,
  clearError,
  type CreateFunnelRequest,
  type UpdateFunnelRequest
} from '@/redux/slices/funnelSlice';
import { fetchPipelines, createPipeline } from '@/redux/slices/pipelineSlice';
import { createStage } from '@/redux/slices/stageSlice';

// Client-only wrapper
const ClientOnlyWrapper = ({ children }: { children: React.ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

 

  useEffect(() => { setHasMounted(true); }, []);
  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisiere...</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

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
  options?: string[]; // For multiple choice
  optionIcons?: string[];
  _iconPickerOpen?: number | null; // Add this line
}

interface Step {
  id: string;
  title: string;
  components: Component[];
}

interface FunnelSettings {
  customUrl?: string;
  privacyPolicy?: string;
  privacyPolicyLink?: string;  
  privacyPolicyLinkText?: string; 
  showProgressBar?: boolean;
  nextButtonText?: string;
  nextButtonColor?: string;
  nextButtonHoverColor?: string;
  previousButtonText?: string;
  previousButtonColor?: string;
  previousButtonHoverColor?: string;
  submitButtonText?: string;
  submitButtonColor?: string; 
  submitButtonTextColor?: string; 
  submitButtonHoverColor?: string; 
}

// Component Library Data
const COMPONENTS = [
  { type: 'heading', level: 'h1', icon: '📝', label: 'Große Überschrift', category: 'Text' },
  { type: 'heading', level: 'h2', icon: '📝', label: 'Mittlere Überschrift', category: 'Text' },
  { type: 'heading', level: 'h3', icon: '📝', label: 'Kleine Überschrift', category: 'Text' },
  { type: 'paragraph', icon: '📄', label: 'Absatz', category: 'Text' },
  { type: 'image', icon: '🖼️', label: 'Bild', category: 'Medien' },
  { type: 'input', inputType: 'text', icon: '📝', label: 'Text Eingabe', category: 'Formulare', required: true },
  { type: 'input', inputType: 'email', icon: '📧', label: 'E-Mail Eingabe', category: 'Formulare', required: true },
  { type: 'input', inputType: 'tel', icon: '📞', label: 'Telefon Eingabe', category: 'Formulare' },
  { type: 'button', icon: '🔘', label: 'Button', category: 'Formulare' },
  { type: 'divider', icon: '➖', label: 'Trennlinie', category: 'Layout' },
  { type: 'multiplechoice', icon: '☑️', label: 'Multiple Choice', category: 'Formulare' },
];

const TEMPLATES = {
  'lead-magnet': {
    name: 'Lead Magnet',
    description: 'E-Mails sammeln mit kostenlosem Angebot',
    category: 'E-Mail Sammlung',
    steps: [
      {
        title: 'Landing Page',
        components: [
          { type: 'heading', level: 'h1', text: 'Holen Sie sich Ihren KOSTENLOSEN ultimativen Leitfaden!' },
          { type: 'paragraph', text: 'Laden Sie unseren umfassenden Leitfaden herunter.' },
          { type: 'input', inputType: 'text', text: '' },
          { type: 'input', inputType: 'email', text: '' },
          { type: 'button', text: 'Meinen KOSTENLOSEN Leitfaden erhalten!' },
        ]
      },
      {
        title: 'Danke Seite',
        components: [
          { type: 'heading', level: 'h1', text: 'Vielen Dank! Prüfen Sie Ihre E-Mails' },
          { type: 'paragraph', text: 'Ihr kostenloser Leitfaden ist unterwegs!' },
        ]
      }
    ]
  }
};

// Toast component
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">×</button>
      </div>
    </div>
  );
};

// Main Component
const FunnelBuilderContent: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const { currentFunnel, loading, error } = useSelector((state: RootState) => state.funnel);
  const { pipelines } = useSelector((state: RootState) => state.pipeline);

  const funnelId = params.id as string;
  const isEditing = funnelId !== 'new';

const FONT_AWESOME_ICONS = [
  // Original icons
  'fa-check', 'fa-star', 'fa-heart', 'fa-thumbs-up', 'fa-flag', 'fa-bookmark',
  'fa-calendar', 'fa-clock', 'fa-user', 'fa-users', 'fa-building', 'fa-home',
  'fa-car', 'fa-plane', 'fa-train', 'fa-bus', 'fa-bicycle', 'fa-walking',
  'fa-phone', 'fa-envelope', 'fa-globe', 'fa-map-marker', 'fa-gift', 'fa-shopping-cart',
  'fa-credit-card', 'fa-money-bill', 'fa-chart-line', 'fa-briefcase', 'fa-graduation-cap',
  
  // New icons
  'fa-id-card', 'fa-chart-bar', 'fa-chart-pie', 'fa-location-arrow', 
  'fa-comment', 'fa-comments', 'fa-comment-dots', 'fa-comment-alt',
  'fa-money-bill-wave', 'fa-receipt', 'fa-tag', 'fa-tags', 'fa-percent',
  'fa-book', 'fa-book-open', 'fa-university', 'fa-heartbeat', 'fa-running',
  'fa-dumbbell', 'fa-basketball-ball', 'fa-laptop', 'fa-mobile', 'fa-tablet',
  'fa-desktop', 'fa-wifi', 'fa-utensils', 'fa-coffee', 'fa-pizza-slice',
  'fa-hamburger', 'fa-key', 'fa-door-open', 'fa-motorcycle', 'fa-gas-pump',
  'fa-wrench', 'fa-umbrella-beach', 'fa-passport', 'fa-suitcase-rolling',
  'fa-piggy-bank', 'fa-hand-holding-usd', 'fa-coins', 'fa-stethoscope',
  'fa-hospital', 'fa-pills', 'fa-tshirt', 'fa-gem', 'fa-ring', 'fa-palette',
  'fa-baby', 'fa-child', 'fa-user-friends', 'fa-paw', 'fa-dog', 'fa-cat',
  'fa-tools', 'fa-screwdriver', 'fa-hammer', 'fa-shield-alt', 'fa-lock', 'fa-unlock'
];
  
  // State Management
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', title: 'Schritt 1: Landing Page', components: [] }
  ]);
  
  const [funnelSettings, setFunnelSettings] = useState<FunnelSettings>({
    showProgressBar: true,
    nextButtonText: 'Weiter',
    nextButtonColor: '#10b981',
    nextButtonHoverColor: '#059669',
    previousButtonText: 'Zurück',
    previousButtonColor: '#6b7280',
    previousButtonHoverColor: '#4b5563',
  });

  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showFormSettings, setShowFormSettings] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState<any>(null);

  const [draggedComponentIndex, setDraggedComponentIndex] = useState<number | null>(null);
  const [draggedFromStep, setDraggedFromStep] = useState<number | null>(null);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [funnelName, setFunnelName] = useState('');
  const [funnelDescription, setFunnelDescription] = useState('');
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [newPipelineName, setNewPipelineName] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [pipelineOption, setPipelineOption] = useState<'existing' | 'new'>('existing');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Edit step title modal
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editingStepTitle, setEditingStepTitle] = useState('');

   const [iconPickerState, setIconPickerState] = useState<{
      isOpen: boolean;
      optionIndex: number | null;
      componentId: string | null;
    }>({
      isOpen: false,
      optionIndex: null,
      componentId: null
    });

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchFunnelById(funnelId));
    } else {
      dispatch(clearCurrentFunnel());
    }
    dispatch(fetchPipelines());
    return () => { dispatch(clearCurrentFunnel()); };
  }, [dispatch, funnelId, isEditing]);

useEffect(() => {
  if (currentFunnel && isEditing) {
    setFunnelName(currentFunnel.name);
    setFunnelDescription(currentFunnel.description || '');
    setSelectedPipeline(currentFunnel.pipelineId);
    setSelectedStage(currentFunnel.stageId || '');
    
    if (currentFunnel.design && currentFunnel.design.steps) {
      setSteps(currentFunnel.design.steps);
    }
    
    // IMPORTANT: Properly load all settings including submit button settings
    if (currentFunnel.design && currentFunnel.design.settings) {
      
      setFunnelSettings({
        customUrl: currentFunnel.design.settings.customUrl || '',
        privacyPolicy: currentFunnel.design.settings.privacyPolicy || '',
        privacyPolicyLink: currentFunnel.design.settings.privacyPolicyLink || '',      
        privacyPolicyLinkText: currentFunnel.design.settings.privacyPolicyLinkText || '',
        showProgressBar: currentFunnel.design.settings.showProgressBar ?? true,
        nextButtonText: currentFunnel.design.settings.nextButtonText || 'Weiter',
        nextButtonColor: currentFunnel.design.settings.nextButtonColor || '#10b981',
        nextButtonHoverColor: currentFunnel.design.settings.nextButtonHoverColor || '#059669',
        previousButtonText: currentFunnel.design.settings.previousButtonText || 'Zurück',
        previousButtonColor: currentFunnel.design.settings.previousButtonColor || '#6b7280',
        previousButtonHoverColor: currentFunnel.design.settings.previousButtonHoverColor || '#4b5563',
        submitButtonText: currentFunnel.design.settings.submitButtonText || 'Jetzt Absenden',
        submitButtonColor: currentFunnel.design.settings.submitButtonColor || '#10b981',
        submitButtonTextColor: currentFunnel.design.settings.submitButtonTextColor || '#ffffff',
        submitButtonHoverColor: currentFunnel.design.settings.submitButtonHoverColor || '#059669',
      });
    }
  }
}, [currentFunnel, isEditing]);


// Add this useEffect to handle closing icon picker when clicking outside
// useEffect(() => {
//   const handleClickOutside = (event: MouseEvent) => {
//     if (selectedComponent && selectedComponent._iconPickerOpen !== null && selectedComponent._iconPickerOpen !== undefined) {
//       updateComponent({ _iconPickerOpen: null });
//     }
//   };

//   document.addEventListener('mousedown', handleClickOutside);
//   return () => {
//     document.removeEventListener('mousedown', handleClickOutside);
//   };
// }, [selectedComponent]);


  useEffect(() => {
    return () => { if (error) dispatch(clearError()); };
  }, [dispatch, error]);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const leadpoolPipelines = pipelines.filter(pipeline => pipeline.type === 'leadpool');

  const handleImageUpload = async (file: File, componentId: string): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size should be less than 5MB');
    }
    try {
      setUploadProgress(prev => ({ ...prev, [componentId]: 0 }));
      const result = await dispatch(uploadFunnelImage(file)).unwrap();
      setUploadProgress(prev => {
        const newState = { ...prev };
        delete newState[componentId];
        return newState;
      });
      return result.imageUrl;
    } catch (error: any) {
      setUploadProgress(prev => {
        const newState = { ...prev };
        delete newState[componentId];
        return newState;
      });
      throw new Error(error.message || 'Failed to upload image');
    }
  };

const addComponent = (stepIndex: number, componentType: any) => {
  const newComponent: Component = {
    id: generateId(),
    type: componentType.type,
    level: componentType.level,
    inputType: componentType.inputType,
    text: componentType.type === 'heading' ? 'Ihre Überschrift hier' :
      componentType.type === 'paragraph' ? 'Ihr Text steht hier.' :
      componentType.type === 'button' ? 'Hier klicken' :
      componentType.type === 'multiplechoice' ? 'Ihre Frage hier?' : '',
    color: componentType.type === 'button' ? '#ffffff' : '#002d51',
    backgroundColor: componentType.type === 'button' ? '#002d51' : 'transparent',
    hoverColor: componentType.type === 'button' ? '#001f3d' : undefined,
    fontSize: componentType.level === 'h1' ? '2.5rem' : 
             componentType.level === 'h2' ? '2rem' :
             componentType.level === 'h3' ? '1.5rem' : '16px',
    textAlign: 'left',
    options: componentType.type === 'multiplechoice' ? ['Option 1', 'Option 2'] : undefined,
    optionIcons: componentType.type === 'multiplechoice' ? ['fa-check', 'fa-star'] : undefined,
    _iconPickerOpen: null
  };

  console.log('Adding new component:', newComponent);

  setSteps(prev => prev.map((step, index) => 
    index === stepIndex 
      ? { ...step, components: [...step.components, newComponent] }
      : step
  ));
};

  // Add this function inside FunnelBuilderContent component
const getIconComponent = (iconName: string, isSelected: boolean) => {
  if (isSelected) return <FaCircle style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />;
  
  const iconMap: { [key: string]: JSX.Element } = {
    // Basic & Common
    'fa-check': <FaCheck style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-star': <FaStar style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-heart': <FaHeart style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-thumbs-up': <FaThumbsUp style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-flag': <FaFlag style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-bookmark': <FaBookmark style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Time & Date
    'fa-calendar': <FaCalendar style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-clock': <FaClock style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-calendar-check': <FaCalendar style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // People & Users
    'fa-user': <FaUser style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-users': <FaUsers style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-user-plus': <FaUser style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-user-check': <FaUser style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-id-card': <FaIdCard style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Business & Office
    'fa-building': <FaBuilding style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-briefcase': <FaBriefcase style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-suitcase': <FaBriefcase style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-chart-line': <FaChartLine style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-chart-bar': <FaChartBar style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-chart-pie': <FaChartPie style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Locations
    'fa-home': <FaHome style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-map-marker': <FaMapMarker style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-globe': <FaGlobe style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-location-arrow': <FaLocationArrow style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Transportation
    'fa-car': <FaCar style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-plane': <FaPlane style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-train': <FaTrain style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-bus': <FaBus style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-bicycle': <FaBicycle style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-walking': <FaWalking style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-car-side': <FaCar style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Communication
    'fa-phone': <FaPhone style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-envelope': <FaEnvelope style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-comment': <FaComment style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-comments': <FaComments style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-comment-dots': <FaCommentDots style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-comment-alt': <FaCommentAlt style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // E-commerce & Shopping
    'fa-shopping-cart': <FaShoppingCart style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-credit-card': <FaCreditCard style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-money-bill': <FaMoneyBill style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-money-bill-wave': <FaMoneyBillWave style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-receipt': <FaReceipt style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-tag': <FaTag style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-tags': <FaTags style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-gift': <FaGift style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-percentage': <FaPercent style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Education & Learning
    'fa-graduation-cap': <FaGraduationCap style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-book': <FaBook style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-book-open': <FaBookOpen style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-university': <FaUniversity style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Health & Fitness
    'fa-heartbeat': <FaHeartbeat style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-running': <FaRunning style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-dumbbell': <FaDumbbell style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-basketball-ball': <FaBasketballBall style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Technology & Devices
    'fa-laptop': <FaLaptop style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-mobile': <FaMobile style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-tablet': <FaTablet style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-desktop': <FaDesktop style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-wifi': <FaWifi style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Food & Restaurant
    'fa-utensils': <FaUtensils style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-coffee': <FaCoffee style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-pizza-slice': <FaPizzaSlice style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-hamburger': <FaHamburger style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Real Estate & Property
    'fa-key': <FaKey style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-door-open': <FaDoorOpen style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Automotive
    'fa-motorcycle': <FaMotorcycle style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-gas-pump': <FaGasPump style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-wrench': <FaWrench style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Travel & Vacation
    'fa-umbrella-beach': <FaUmbrellaBeach style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-passport': <FaPassport style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Finance & Banking
    'fa-piggy-bank': <FaPiggyBank style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-hand-holding-usd': <FaHandHoldingUsd style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-coins': <FaCoins style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Medical & Healthcare
    'fa-stethoscope': <FaStethoscope style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-hospital': <FaHospital style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-pills': <FaPills style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Beauty & Fashion
    'fa-tshirt': <FaTshirt style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-gem': <FaGem style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-ring': <FaRing style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-palette': <FaPalette style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Family & Kids
    'fa-baby': <FaBaby style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-child': <FaChild style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-user-friends': <FaUserFriends style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Pets & Animals
    'fa-paw': <FaPaw style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-dog': <FaDog style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-cat': <FaCat style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Tools & Utilities
    'fa-tools': <FaTools style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-screwdriver': <FaScrewdriver style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-hammer': <FaHammer style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    
    // Security & Safety
    'fa-shield-alt': <FaShieldAlt style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-lock': <FaLock style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
    'fa-unlock': <FaUnlock style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />,
  };
  
  return iconMap[iconName] || <FaCheck style={{ fontSize: '18px', width: '20px', display: 'inline-block' }} />;
};
  const deleteComponent = (stepIndex: number, componentIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex 
        ? { ...step, components: step.components.filter((_, i) => i !== componentIndex) }
        : step
    ));
    setSelectedComponent(null);
  };

  const validateTemplateHasRequiredFields = (steps: Step[]): boolean => {
    let hasNameField = false;
    let hasEmailField = false;
    steps.forEach(step => {
      step.components.forEach(component => {
        if (component.type === 'input') {
          if (component.inputType === 'text') hasNameField = true;
          if (component.inputType === 'email') hasEmailField = true;
        }
      });
    });
    return hasNameField && hasEmailField;
  };
  

  /*const validatePrivacyPolicy = (): boolean => {
    // Privacy policy textarea is now required
    const isValid = !!(funnelSettings.privacyPolicy?.trim());
    console.log('Privacy Policy Validation:', {
      privacyPolicy: funnelSettings.privacyPolicy,
      trimmed: funnelSettings.privacyPolicy?.trim(),
      isValid: isValid
    });
    return isValid;
  };*/

  /*const validateMultipleChoiceOptions = (steps: Step[]): boolean => {
    for (const step of steps) {
      for (const component of step.components) {
        if (component.type === 'multiplechoice') {
          if (!component.options || component.options.length < 2) {
            return false;
          }
        }
      }
    }
    return true;
  };*/


 const updateComponent = (updates: Partial<Component>) => {
  if (!selectedComponent || selectedStepIndex === null) return;
  
  console.log('updateComponent called with:', updates);
  
  // Update the steps first
  setSteps(prev => {
    const updated = prev.map((step, stepIndex) => 
      stepIndex === selectedStepIndex 
        ? {
            ...step, 
            components: step.components.map(comp => 
              comp.id === selectedComponent.id ? { ...comp, ...updates } : comp
            )
          }
        : step
    );
    console.log('Steps updated in updateComponent');
    return updated;
  });
  
  // Then update selectedComponent
  setSelectedComponent(prev => {
    if (!prev) return null;
    console.log('SelectedComponent updated in updateComponent');
    return { ...prev, ...updates };
  });
};

  const moveComponent = (stepIndex: number, componentIndex: number, direction: number) => {
    const newIndex = componentIndex + direction;
    setSteps(prev => prev.map((step, sIndex) => {
      if (sIndex !== stepIndex) return step;
      if (newIndex < 0 || newIndex >= step.components.length) return step;
      const newComponents = [...step.components];
      const temp = newComponents[componentIndex];
      newComponents[componentIndex] = newComponents[newIndex];
      newComponents[newIndex] = temp;
      return { ...step, components: newComponents };
    }));
  };

  const handleComponentDragStart = (e: React.DragEvent, stepIndex: number, componentIndex: number) => {
    setDraggedComponentIndex(componentIndex);
    setDraggedFromStep(stepIndex);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleComponentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleComponentDrop = (e: React.DragEvent, targetStepIndex: number, targetComponentIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedComponentIndex === null || draggedFromStep === null) return;
    if (draggedFromStep === targetStepIndex && draggedComponentIndex === targetComponentIndex) {
      setDraggedComponentIndex(null);
      setDraggedFromStep(null);
      return;
    }
    setSteps(prev => {
      const newSteps = [...prev];
      const draggedComponent = newSteps[draggedFromStep].components[draggedComponentIndex];
      newSteps[draggedFromStep] = {
        ...newSteps[draggedFromStep],
        components: newSteps[draggedFromStep].components.filter((_, index) => index !== draggedComponentIndex)
      };
      const targetComponents = [...newSteps[targetStepIndex].components];
      targetComponents.splice(targetComponentIndex, 0, draggedComponent);
      newSteps[targetStepIndex] = {
        ...newSteps[targetStepIndex],
        components: targetComponents
      };
      return newSteps;
    });
    setDraggedComponentIndex(null);
    setDraggedFromStep(null);
  };

  const addStep = () => {
    const newStep: Step = {
      id: generateId(),
      title: `Schritt ${steps.length + 1}: Neuer Schritt`,
      components: []
    };
    setSteps(prev => [...prev, newStep]);
  };

  const deleteStep = (index: number) => {
    if (steps.length <= 1) {
      setToast({ message: 'Sie müssen mindestens einen Schritt haben!', type: 'error' });
      return;
    }
    setSteps(prev => prev.filter((_, i) => i !== index));
    setTimeout(() => updateStepTitles(), 0);
  };

  const moveStep = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= steps.length) return;
    setSteps(prev => {
      const newSteps = [...prev];
      const temp = newSteps[index];
      newSteps[index] = newSteps[newIndex];
      newSteps[newIndex] = temp;
      return newSteps;
    });
    setTimeout(() => updateStepTitles(), 0);
  };

  const updateStepTitles = () => {
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      title: `Schritt ${index + 1}: ${step.title.split(': ')[1] || 'Neuer Schritt'}`
    })));
  };

  const updateStepTitle = (index: number, newTitle: string) => {
    setSteps(prev => prev.map((step, i) =>
      i === index ? { ...step, title: `Schritt ${index + 1}: ${newTitle}` } : step
    ));
  };

  const loadTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey as keyof typeof TEMPLATES];
    if (template) {
      const newSteps = template.steps.map((step: any, index: number) => ({
        id: generateId(),
        title: `Schritt ${index + 1}: ${step.title}`,
        components: step.components.map((comp: any) => ({
          ...comp,
          id: generateId(),
          color: comp.type === 'button' ? '#fff' : comp.color,
          backgroundColor: comp.type === 'button' ? '#002d51' : 'transparent'
        }))
      }));
      setSteps(newSteps);
      setShowTemplates(false);
      setToast({ message: 'Vorlage erfolgreich geladen!', type: 'success' });
    }
  };

  const handleSave = async () => {
    if (!funnelName.trim()) {
      setToast({ message: 'Bitte geben Sie einen Funnel-Namen ein', type: 'error' });
      return;
    }
    if (!validateTemplateHasRequiredFields(steps)) {
      setToast({ message: 'Template muss mindestens ein Namensfeld und ein E-Mail-Feld enthalten', type: 'error' });
      return;
    }
    if (pipelineOption === 'existing' && (!selectedPipeline || !selectedStage)) {
      setToast({ message: 'Bitte wählen Sie eine Pipeline und eine Stage aus', type: 'error' });
      return;
    }
    if (pipelineOption === 'new' && (!newPipelineName.trim() || !newStageName.trim())) {
      setToast({ message: 'Bitte geben Sie Pipeline- und Stage-Namen ein', type: 'error' });
      return;
    }

    const funnelDesign = {
      steps: steps,
      settings: funnelSettings,
      lastModified: new Date().toISOString()
    };

    try {
      let finalPipelineId = selectedPipeline;
      let finalStageId = selectedStage;

      if (pipelineOption === 'new') {
        const newPipeline = await dispatch(createPipeline({
          name: newPipelineName,
          source: 'funnel',
          type: 'leadpool'
        })).unwrap();
        finalPipelineId = newPipeline.id.toString();
        const newStage = await dispatch(createStage({
          pipeline_id: finalPipelineId,
          name: newStageName,
          color: '#10b981',
          position: 1
        })).unwrap();
        finalStageId = newStage.id;
      }

      if (isEditing) {
        const updateData: UpdateFunnelRequest = {
          name: funnelName,
          description: funnelDescription,
          design: funnelDesign
        };
        if (finalPipelineId && finalStageId) {
          updateData.pipelineId = finalPipelineId;
          updateData.stageId = finalStageId;
        }
        await dispatch(updateFunnel({ id: funnelId, data: updateData })).unwrap();
        setToast({ message: 'Funnel erfolgreich aktualisiert!', type: 'success' });
      } else {
        const createData: CreateFunnelRequest = {
          name: funnelName,
          description: funnelDescription,
          pipelineId: finalPipelineId,
          stageId: finalStageId,
          design: funnelDesign,
          status: 'draft'
        };
        const result = await dispatch(createFunnel(createData)).unwrap();
        setToast({ message: 'Funnel erfolgreich erstellt!', type: 'success' });
        router.push(`/admin/get-new-clients/canvas/${result.id}`);
      }

      setShowSaveModal(false);
      setTimeout(() => router.push('/admin/get-new-clients'), 1500);
    } catch (error: any) {
      setToast({ message: error.message || 'Fehler beim Speichern des Funnels', type: 'error' });
    }
  };

  const getSelectedPipelineStages = () => {
    const pipeline = leadpoolPipelines.find(p => p.id.toString() === selectedPipeline);
    return pipeline ? pipeline.stages : [];
  };

  const handleDragStart = (e: React.DragEvent, component: any) => {
    setDraggedComponent(component);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, stepIndex: number) => {
    e.preventDefault();
    if (draggedComponent) {
      addComponent(stepIndex, draggedComponent);
      setDraggedComponent(null);
    }
  };

  const renderComponent = (component: Component, stepIndex: number, componentIndex: number) => {
    const isSelected = selectedComponent?.id === component.id;
    
    const baseStyle = {
      color: component.color || '#002d51',
      fontSize: component.fontSize || '16px',
      backgroundColor: component.backgroundColor || 'transparent',
      margin: '12px 0',
      padding: component.type === 'button' ? '12px 24px' : '8px',
      border: component.type === 'button' ? 'none' : '1px solid transparent',
      borderRadius: component.type === 'button' ? '8px' : '4px',
      cursor: component.type === 'button' ? 'pointer' : 'default',
      lineHeight: '1.6',
      textAlign: component.textAlign || 'left',
    };

    const handleClick = () => {
      setSelectedComponent(component);
      setSelectedStepIndex(stepIndex);
    };

    const handleTextChange = (newText: string) => {
      updateComponent({ text: newText });
    };

    let content;
    switch(component.type) {
      case 'heading':
        const HeadingTag = component.level as keyof JSX.IntrinsicElements;
        content = (
          <HeadingTag 
            style={baseStyle}
            contentEditable={!isPreview}
            onBlur={(e) => handleTextChange(e.currentTarget.textContent || '')}
            suppressContentEditableWarning={true}
          >
            {component.text}
          </HeadingTag>
        );
        break;
      case 'paragraph':
        content = (
          <p 
            style={{ ...baseStyle, whiteSpace: 'pre-line' }}
            contentEditable={!isPreview}
            onBlur={(e) => handleTextChange(e.currentTarget.textContent || '')}
            suppressContentEditableWarning={true}
          >
            {component.text}
          </p>
        );
        break;
      case 'button':
        content = (
          <button
            style={baseStyle}
            onClick={() => component.link && window.open(component.link, '_blank')}
            onMouseEnter={(e) => {
              if (component.hoverColor) {
                e.currentTarget.style.backgroundColor = component.hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = component.backgroundColor || '#002d51';
            }}
          >
            {component.icon && <span style={{ marginRight: '8px' }}>{component.icon}</span>}
            {component.text}
          </button>
        );
        break;
      case 'input':
        const placeholder = component.inputType === 'email' ? 'E-Mail eingeben' :
                          component.inputType === 'tel' ? 'Telefon eingeben' :
                          component.inputType === 'text' ? 'Namen eingeben' : 'Text eingeben';
        content = (
          <input 
            type={component.inputType || 'text'} 
            placeholder={placeholder}
            style={{ ...baseStyle, width: '100%', maxWidth: '400px' }}
          />
        );
        break;
      case 'image':
        const currentUploadProgress = uploadProgress[component.id];
        content = (
          <div style={{ position: 'relative', textAlign: component.textAlign || 'left' }}>
            <img
              src={component.src || 'https://via.placeholder.com/400x200?text=Bild+hochladen'}
              alt={component.alt || 'Bild'}
              style={{
                ...baseStyle,
                maxWidth: '100%',
                height: 'auto',
                opacity: currentUploadProgress !== undefined ? 0.5 : 1,
                display: component.textAlign === 'center' ? 'inline-block' : 'block',
              }}
            />
            {currentUploadProgress !== undefined && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
              }}>
                Uploading... {currentUploadProgress}%
              </div>
            )}
            {!isPreview && isSelected && (
              <div style={{ position: 'absolute', bottom: '8px', right: '8px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const imageUrl = await handleImageUpload(file, component.id);
                        updateComponent({ src: imageUrl });
                        setToast({ message: 'Bild erfolgreich hochgeladen!', type: 'success' });
                      } catch (error: any) {
                        setToast({ message: error.message, type: 'error' });
                      }
                    }
                  }}
                  style={{ display: 'none' }}
                  id={`image-upload-${component.id}`}
                  disabled={currentUploadProgress !== undefined}
                />
                <label
                  htmlFor={`image-upload-${component.id}`}
                  style={{
                    background: currentUploadProgress !== undefined ? '#6b7280' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    cursor: currentUploadProgress !== undefined ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {currentUploadProgress !== undefined ? 'Uploading...' : 'Upload'}
                </label>
              </div>
            )}
          </div>
        );
        break;
      case 'divider':
        content = <div style={{ width: '100%', height: '1px', background: '#e2e8f0', margin: '24px 0' }} />;
        break;
case 'multiplechoice':
  console.log('Rendering multiplechoice:', {
    componentId: component.id,
    options: component.options,
    optionIcons: component.optionIcons
  });
  
  content = (
    <div style={{ ...baseStyle, padding: '16px' }}>
      <div style={{ fontWeight: '600', marginBottom: '16px', fontSize: '18px', textAlign: component.textAlign || 'left' }}>
        {component.text}
      </div>
      <div style={{
        display: 'flex', 
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: component.textAlign === 'center' ? 'center' : component.textAlign === 'right' ? 'flex-end' : 'flex-start'
      }}>
        {component.options?.map((option, idx) => {
          const optionIcon = component.optionIcons?.[idx] || 'fa-check';
          
          console.log(`Rendering option ${idx}:`, { text: option, icon: optionIcon });
          
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                const btn = e.currentTarget;
                const isSelected = btn.getAttribute('data-selected') === 'true';
                btn.setAttribute('data-selected', (!isSelected).toString());
                
                btn.style.background = isSelected ? 'white' : '#ecfdf5';
                btn.style.borderColor = isSelected ? '#d1d5db' : '#10b981';
                btn.style.color = isSelected ? '#002d51' : '#059669';
              }}
              data-selected="false"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'white',
                border: '2px solid #d1d5db',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '500',
                color: '#002d51',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                minWidth: '120px',
                flex: '0 1 auto'
              }}
              onMouseEnter={(e) => {
                if (e.currentTarget.getAttribute('data-selected') !== 'true') {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.getAttribute('data-selected') !== 'true') {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {getIconComponent(optionIcon, false)}
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
  break;
      default:
        content = <div>Unbekannte Komponente</div>;
    }

    return (
      <div 
        key={component.id}
        draggable={!isPreview}
        onDragStart={(e) => !isPreview && handleComponentDragStart(e, stepIndex, componentIndex)}
        onDragOver={handleComponentDragOver}
        onDrop={(e) => !isPreview && handleComponentDrop(e, stepIndex, componentIndex)}
        onClick={handleClick}
        style={{
          position: 'relative',
          border: isSelected ? '2px solid #002d51' : '1px solid transparent',
          borderRadius: '4px',
          padding: '8px',
          margin: '8px 0',
          cursor: isPreview ? 'default' : 'move',
          backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
          transition: 'all 0.2s ease'
        }}
      >
        {content}

        {!isPreview && isSelected && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            display: 'flex',
            gap: '4px'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveComponent(stepIndex, componentIndex, -1);
              }}
              disabled={componentIndex === 0}
              title="Komponente nach oben"
              style={{
                background: componentIndex === 0 ? 'rgba(100, 116, 139, 0.5)' : '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                width: '20px',
                height: '20px',
                cursor: componentIndex === 0 ? 'not-allowed' : 'pointer',
                fontSize: '10px',
              }}
            >
              ↑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                moveComponent(stepIndex, componentIndex, 1);
              }}
              disabled={componentIndex === steps[stepIndex].components.length - 1}
              title="Komponente nach unten"
              style={{
                background: componentIndex === steps[stepIndex].components.length - 1 ? 'rgba(100, 116, 139, 0.5)' : '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                width: '20px',
                height: '20px',
                cursor: componentIndex === steps[stepIndex].components.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '10px',
              }}
            >
              ↓
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteComponent(stepIndex, componentIndex);
              }}
              title="Komponente löschen"
              style={{
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
                fontSize: '10px',
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading.currentFunnel && isEditing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Funnel...</p>
        </div>
      </div>
    );
  }

  if (error && isEditing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Fehler beim Laden</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => router.push('/admin/get-new-clients')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              Zurück zur Übersicht
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8fafc' }}>
        {/* Header */}
        <div style={{
          height: '60px',
          background: 'linear-gradient(135deg, #002d51 0%, #003a65 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            🚀 {isEditing ? 'Funnel Bearbeiten' : 'Funnel Erstellen'}
            {isEditing && currentFunnel && (
              <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '10px', opacity: 0.8 }}>
                - {currentFunnel.name}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setIsPreview(!isPreview)}
              style={{
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isPreview ? 'Bearbeiten' : 'Vorschau'}
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              disabled={isEditing}
              style={{
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                background: isEditing ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                color: 'white',
                cursor: isEditing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                opacity: isEditing ? 0.5 : 1
              }}
            >
              Vorlagen
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={loading.creating || loading.updating}
              style={{
                padding: '8px 20px',
                border: 'none',
                borderRadius: '6px',
                background: '#10b981',
                color: 'white',
                cursor: loading.creating || loading.updating ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                opacity: loading.creating || loading.updating ? 0.6 : 1
              }}
            >
              {loading.creating || loading.updating
                ? (isEditing ? 'Aktualisiere...' : 'Erstelle...')
                : (isEditing ? 'Aktualisieren' : 'Speichern')
              }
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel - Components */}
          {!isPreview && (
            <div style={{
              width: '280px',
              background: 'white',
              borderRight: '1px solid #e2e8f0',
              padding: '20px',
              overflowY: 'auto',
               flexShrink: 0
            }}>
              <h3 style={{ color: '#002d51', marginBottom: '20px' }}>Komponenten</h3>
              
              {/* Form Settings Button */}
              <button
                onClick={() => setShowFormSettings(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '20px',
                  background: '#002d51',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ⚙️ Formular Einstellungen
              </button>

              {['Text', 'Medien', 'Formulare', 'Layout'].map(category => (
                <div key={category} style={{ marginBottom: '20px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    textTransform: 'uppercase', 
                    color: '#64748b', 
                    marginBottom: '10px',
                    fontWeight: '600'
                  }}>
                    {category}
                  </div>
                  {COMPONENTS.filter(comp => comp.category === category).map((comp, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, comp)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        marginBottom: '8px',
                        background: comp.required ? '#fffbeb' : '#f8fafc',
                        border: comp.required ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'grab'
                      }}
                    >
                      <span style={{ marginRight: '12px' }}>{comp.icon}</span>
                      <span style={{ fontWeight: comp.required ? '600' : 'normal' }}>
                        {comp.label}
                      </span>
                      {comp.required && (
                        <span style={{ marginLeft: 'auto', color: '#dc2626', fontSize: '12px' }}>
                          *
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Center - Funnel Steps */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            background: isPreview ? 'white' : '#f8fafc',
             minHeight: 0
          }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {/* Progress Bar */}
              {funnelSettings.showProgressBar && steps.length > 1 && (
                <div style={{
                  marginBottom: '32px',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    {steps.map((step, idx) => (
                      <div key={step.id} style={{ flex: 1, textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                        {step.title.split(': ')[1] || `Schritt ${idx + 1}`}
                      </div>
                    ))}
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    display: 'flex'
                  }}>
                    {steps.map((step, idx) => (
                      <div
                        key={step.id}
                        style={{
                          flex: 1,
                          background: '#10b981',
                          marginRight: idx < steps.length - 1 ? '4px' : '0'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {steps.map((step, stepIndex) => (
                <div
                  key={step.id}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginBottom: '24px',
                    overflow: 'hidden',
                    minHeight: isPreview ? '100vh' : 'auto',
                    padding: isPreview ? '60px 20px' : '0',
                  }}
                >
                  {/* Step Header */}
                  {!isPreview && (
                    <div style={{
                      background: 'linear-gradient(135deg, #002d51 0%, #003a65 100%)',
                      color: 'white',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div
                        style={{ fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => {
                          setEditingStepIndex(stepIndex);
                          setEditingStepTitle(step.title.split(': ')[1] || '');
                        }}
                        title="Klicken zum Bearbeiten"
                      >
                        {step.title}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => moveStep(stepIndex, -1)}
                          disabled={stepIndex === 0}
                          title="Schritt nach oben"
                          style={{
                            background: stepIndex === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: stepIndex === 0 ? 'rgba(255,255,255,0.4)' : 'white',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveStep(stepIndex, 1)}
                          disabled={stepIndex === steps.length - 1}
                          title="Schritt nach unten"
                          style={{
                            background: stepIndex === steps.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: stepIndex === steps.length - 1 ? 'rgba(255,255,255,0.4)' : 'white',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            cursor: stepIndex === steps.length - 1 ? 'not-allowed' : 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => deleteStep(stepIndex)}
                          title="Schritt löschen"
                          style={{
                            background: 'rgba(220, 38, 38, 0.8)',
                            border: 'none',
                            color: 'white',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step Content */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stepIndex)}
                    style={{
                      padding: isPreview ? '0' : '20px',
                      minHeight: isPreview ? 'auto' : '200px',
                      textAlign: isPreview ? 'center' : 'left',
                      maxWidth: isPreview ? '600px' : 'none',
                      width: isPreview ? '100%' : 'auto'
                    }}
                  >
                    {step.components.length === 0 && !isPreview ? (
                      <div style={{
                        minHeight: '150px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        Ziehen Sie Komponenten hierher
                      </div>
                    ) : (
                      step.components.map((component, componentIndex) => 
                        renderComponent(component, stepIndex, componentIndex)
                      )
                    )}
                  </div>

                  {/* Navigation Buttons in Preview */}
                  {isPreview && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '20px',
                      gap: '10px'
                    }}>
                      {stepIndex > 0 && (
                        <button
                          style={{
                            padding: '12px 24px',
                            background: funnelSettings.previousButtonColor || '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = funnelSettings.previousButtonHoverColor || '#4b5563';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = funnelSettings.previousButtonColor || '#6b7280';
                          }}
                        >
                          {funnelSettings.previousButtonText || 'Zurück'}
                        </button>
                      )}
                      {stepIndex < steps.length - 1 && (
                        <button
                          style={{
                            padding: '12px 24px',
                            background: funnelSettings.nextButtonColor || '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginLeft: 'auto',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = funnelSettings.nextButtonHoverColor || '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = funnelSettings.nextButtonColor || '#10b981';
                          }}
                        >
                          {funnelSettings.nextButtonText || 'Weiter'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {!isPreview && (
                <div style={{
                  position: 'sticky',
                  bottom: '20px',
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '20px 0',
                  background: 'linear-gradient(to top, #f8fafc 80%, transparent)',
                  zIndex: 10
                }}>
                  <button
                    onClick={addStep}
                    style={{
                      background: 'linear-gradient(135deg, #002d51 0%, #003a65 100%)',
                      color: 'white',
                      border: 'none',
                      marginBottom:'35px',
                      padding: '7px 1px',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 45, 81, 0.3)',
                      transition: 'all 0.2s ease',
                      maxWidth: '225px',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 45, 81, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 45, 81, 0.3)';
                    }}
                  >
                    + Neuen Schritt hinzufügen
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Properties */}
          {!isPreview && (
            <div style={{
              width: '320px',
              background: 'white',
              borderLeft: '1px solid #e2e8f0',
              padding: '20px',
              overflowY: 'auto',
              flexShrink: 0
            }}>
              <h3 style={{ color: '#002d51', marginBottom: '20px' }}>Eigenschaften</h3>

              {!validateTemplateHasRequiredFields(steps) && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                    ⚠️ Erforderliche Felder fehlen
                  </div>
                  <div style={{ color: '#92400e', fontSize: '13px' }}>
                    Bitte fügen Sie mindestens ein Namensfeld und ein E-Mail-Feld hinzu.
                  </div>
                </div>
              )}
              
              {selectedComponent ? (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Text Inhalt
                    </label>
                    <textarea
                      value={selectedComponent.text || ''}
                      onChange={(e) => updateComponent({ text: e.target.value })}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Text Alignment */}
                  {(selectedComponent.type === 'heading' || selectedComponent.type === 'paragraph' || selectedComponent.type === 'image') && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Text Ausrichtung
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            onClick={() => updateComponent({ textAlign: align })}
                            style={{
                              flex: 1,
                              padding: '8px',
                              background: selectedComponent.textAlign === align ? '#002d51' : '#f8fafc',
                              color: selectedComponent.textAlign === align ? 'white' : '#002d51',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            {align === 'left' ? '←' : align === 'center' ? '↔' : '→'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                    {/* Multiple Choice Options */}
                    {selectedComponent.type === 'multiplechoice' && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Antwortoptionen
                        </label>
                        {selectedComponent.options?.map((option, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '4px', marginBottom: '8px', alignItems: 'center' }}>
                            {/* Icon Picker Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setIconPickerState({
                                  isOpen: true,
                                  optionIndex: idx,
                                  componentId: selectedComponent.id
                                });
                              }}
                              style={{
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: '16px',
                                color: '#002d51'
                              }}
                            >
                              {getIconComponent(selectedComponent.optionIcons?.[idx] || 'fa-check', false)}
                            </button>

                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(selectedComponent.options || [])];
                                newOptions[idx] = e.target.value;
                                updateComponent({ options: newOptions });
                              }}
                              style={{
                                flex: 1,
                                padding: '8px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                            <button
                              onClick={() => {
                                if ((selectedComponent.options?.length || 0) <= 2) {
                                  setToast({ message: 'Sie müssen mindestens 2 Antwortoptionen behalten.', type: 'error' });
                                  return;
                                }

                                const newOptions = selectedComponent.options?.filter((_, i) => i !== idx);
                                const newOptionIcons = selectedComponent.optionIcons?.filter((_, i) => i !== idx);
                                updateComponent({ 
                                  options: newOptions,
                                  optionIcons: newOptionIcons
                                });
                              }}
                              style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newOptions = [...(selectedComponent.options || []), `Option ${(selectedComponent.options?.length || 0) + 1}`];
                            const newOptionIcons = [...(selectedComponent.optionIcons || []), 'fa-check'];
                            updateComponent({ 
                              options: newOptions,
                              optionIcons: newOptionIcons
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          + Option hinzufügen
                        </button>
                      </div>
                    )}


                    {/* Icon Picker Modal */}
                    {iconPickerState.isOpen && (
                      <div 
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10000
                        }}
                        onClick={() => setIconPickerState({ isOpen: false, optionIndex: null, componentId: null })}
                      >
                        <div 
                          style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            maxWidth: '500px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            borderBottom: '1px solid #e2e8f0',
                            paddingBottom: '16px'
                          }}>
                            <h3 style={{ color: '#002d51', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                              Icon auswählen
                            </h3>
                            <button
                              onClick={() => setIconPickerState({ isOpen: false, optionIndex: null, componentId: null })}
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer',
                                color: '#64748b'
                              }}
                            >
                              ×
                            </button>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: '12px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: '8px'
                          }}>
                            {FONT_AWESOME_ICONS.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                  if (iconPickerState.optionIndex !== null && iconPickerState.componentId) {
                                    // Find the current component to get its optionIcons
                                    const currentComponent = steps
                                      .flatMap(step => step.components)
                                      .find(comp => comp.id === iconPickerState.componentId);

                                    if (currentComponent && selectedStepIndex !== null) {
                                      const currentOptionIcons = currentComponent.optionIcons || [];
                                      const newOptionIcons = [...currentOptionIcons];
                                      
                                      // Ensure array is long enough
                                      while (newOptionIcons.length <= iconPickerState.optionIndex) {
                                        newOptionIcons.push('fa-check');
                                      }
                                      
                                      // Update the specific icon
                                      newOptionIcons[iconPickerState.optionIndex] = icon;

                                      // Update steps
                                      setSteps(prev => prev.map(step => ({
                                        ...step,
                                        components: step.components.map(comp => 
                                          comp.id === iconPickerState.componentId 
                                            ? { ...comp, optionIcons: newOptionIcons }
                                            : comp
                                        )
                                      })));

                                      // Update selected component if it's the same one
                                      if (selectedComponent?.id === iconPickerState.componentId) {
                                        setSelectedComponent(prev => prev ? { 
                                          ...prev, 
                                          optionIcons: newOptionIcons 
                                        } : null);
                                      }
                                    }
                                  }
                                  
                                  // Close the modal
                                  setIconPickerState({ isOpen: false, optionIndex: null, componentId: null });
                                }}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  background: 'white',
                                  cursor: 'pointer',
                                  fontSize: '20px',
                                  color: '#002d51',
                                  transition: 'all 0.2s ease',
                                  padding: '8px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f8fafc';
                                  e.currentTarget.style.borderColor = '#002d51';
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'white';
                                  e.currentTarget.style.borderColor = '#e2e8f0';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                }}
                              >
                                {getIconComponent(icon, false)}
                                <span style={{
                                  fontSize: '10px',
                                  marginTop: '4px',
                                  color: '#64748b',
                                  textAlign: 'center',
                                  lineHeight: '1.2'
                                }}>
                                  {icon.replace('fa-', '')}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div style={{
                            marginTop: '20px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e2e8f0',
                            textAlign: 'center'
                          }}>
                          </div>
                        </div>
                      </div>
                    )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Text Farbe
                    </label>
                    <input
                      type="color"
                      value={selectedComponent.color || '#002d51'}
                      onChange={(e) => updateComponent({ color: e.target.value })}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  {selectedComponent.type === 'button' && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Hintergrundfarbe
                        </label>
                        <input
                          type="color"
                          value={selectedComponent.backgroundColor || '#ffffff'}
                          onChange={(e) => updateComponent({ backgroundColor: e.target.value })}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Hover Farbe
                        </label>
                        <input
                          type="color"
                          value={selectedComponent.hoverColor || '#001f3d'}
                          onChange={(e) => updateComponent({ hoverColor: e.target.value })}
                          style={{
                            width: '100%',
                            height: '40px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Icon (Emoji)
                        </label>
                        <input
                          type="text"
                          value={selectedComponent.icon || ''}
                          onChange={(e) => updateComponent({ icon: e.target.value })}
                          placeholder="z.B. 🚀 oder ✓"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Link URL
                        </label>
                        <input
                          type="url"
                          value={selectedComponent.link || ''}
                          onChange={(e) => updateComponent({ link: e.target.value })}
                          placeholder="https://example.com"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {selectedComponent.type === 'image' && (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Bild Upload
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const imageUrl = await handleImageUpload(file, selectedComponent.id);
                                updateComponent({ src: imageUrl });
                                setToast({ message: 'Bild erfolgreich hochgeladen!', type: 'success' });
                              } catch (error: any) {
                                setToast({ message: error.message, type: 'error' });
                              }
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            marginBottom: '8px'
                          }}
                          disabled={uploadProgress[selectedComponent.id] !== undefined}
                        />
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          Max. 5MB - JPG, PNG, WebP, GIF
                        </div>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Oder Bild URL
                        </label>
                        <input
                          type="url"
                          value={selectedComponent.src || ''}
                          onChange={(e) => updateComponent({ src: e.target.value })}
                          placeholder="https://example.com/bild.jpg"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      {selectedComponent.src && (
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                            Vorschau
                          </label>
                          <img
                            src={selectedComponent.src}
                            alt="Vorschau"
                            style={{
                              width: '100%',
                              maxHeight: '200px',
                              objectFit: 'cover',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px'
                            }}
                          />
                        </div>
                      )}

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                          Alt Text
                        </label>
                        <input
                          type="text"
                          value={selectedComponent.alt || ''}
                          onChange={(e) => updateComponent({ alt: e.target.value })}
                          placeholder="Beschreibung"
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                    </>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Schriftgröße
                    </label>
                    <select
                      value={selectedComponent.fontSize || '16px'}
                      onChange={(e) => updateComponent({ fontSize: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="12px">12px - Klein</option>
                      <option value="14px">14px - Klein</option>
                      <option value="16px">16px - Normal</option>
                      <option value="18px">18px - Mittel</option>
                      <option value="20px">20px - Mittel</option>
                      <option value="24px">24px - Groß</option>
                      <option value="32px">32px - Groß</option>
                      <option value="2.5rem">2.5rem - Riesig</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>
                  <p>Klicken Sie auf eine Komponente, um ihre Eigenschaften zu bearbeiten</p>
                </div>
              )}
            </div>
          )}
        </div>

          {showFormSettings && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
            onClick={() => setShowFormSettings(false)}
          >
            <div
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px'
              }}>
                <h2 style={{ color: '#002d51', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  Formular Einstellungen
                </h2>
                <button
                  onClick={() => setShowFormSettings(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Custom URL - REQUIRED */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#002d51' }}>
                  Benutzerdefinierte URL (Slug) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>
                    /funnel/
                  </span>
                  <input
                    type="text"
                    value={funnelSettings.customUrl || ''}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                      setFunnelSettings(prev => ({ ...prev, customUrl: value }));
                    }}
                    placeholder="mein-funnel-name"
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: `1px solid ${!funnelSettings.customUrl?.trim() ? '#dc2626' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: !funnelSettings.customUrl?.trim() ? '#fef2f2' : 'white'
                    }}
                  />
                </div>
                {!funnelSettings.customUrl?.trim() ? (
                  <div style={{
                    fontSize: '12px',
                    color: '#dc2626',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⚠️ Diese URL ist erforderlich.
                  </div>
                ) : (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#ecfdf5',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#059669'
                  }}>
                    ✓ Ihre öffentliche URL: <strong>/funnel/{funnelSettings.customUrl}</strong>
                  </div>
                )}
                <div style={{ 
                  fontSize: '12px', 
                  color: !funnelSettings.customUrl?.trim() ? '#dc2626' : '#6b7280', 
                  marginTop: '4px' 
                }}>
                  Nur Kleinbuchstaben, Zahlen und Bindestriche. Beispiel: summer-webinar-2025
                </div>
              </div>

              {/* Privacy Policy - REQUIRED */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#002d51' }}>
                  Datenschutzerklärung *
                </label>
                <textarea
                  value={funnelSettings.privacyPolicy || ''}
                  onChange={(e) => {
                    setFunnelSettings(prev => ({ ...prev, privacyPolicy: e.target.value }));
                  }}
                  placeholder="Geben Sie hier Ihre Datenschutzerklärung ein. Diese wird am Ende des Funnels für Benutzer sichtbar sein..."
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${!funnelSettings.privacyPolicy?.trim() ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    backgroundColor: !funnelSettings.privacyPolicy?.trim() ? '#fef2f2' : 'white'
                  }}
                />
                {!funnelSettings.privacyPolicy?.trim() && (
                  <div style={{
                    fontSize: '12px',
                    color: '#dc2626',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⚠️ Diese Datenschutzerklärung ist erforderlich.
                  </div>
                )}
                <div style={{ 
                  fontSize: '12px', 
                  color: !funnelSettings.privacyPolicy?.trim() ? '#dc2626' : '#6b7280', 
                  marginTop: '4px' 
                }}>
                  Diese Datenschutzerklärung wird im letzten Schritt des Funnels als ausklappbarer Text angezeigt.
                </div>
              </div>

              {/* NEW: Privacy Policy Link */}
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#002d51', marginBottom: '16px' }}>
                  Externe Datenschutzerklärung
                </h3>
                
                {/* Privacy Policy Link URL Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#002d51' }}>
                    Datenschutz-Link URL
                  </label>
                  <input
                    type="url"
                    value={funnelSettings.privacyPolicyLink || ''}
                    onChange={(e) => setFunnelSettings(prev => ({ ...prev, privacyPolicyLink: e.target.value }))}
                    placeholder="https://example.com/datenschutz"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Privacy Policy Link Text Input */}
                <div style={{ marginBottom: '0' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#002d51' }}>
                    Link-Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={funnelSettings.privacyPolicyLinkText || ''}
                    onChange={(e) => setFunnelSettings(prev => ({ ...prev, privacyPolicyLinkText: e.target.value }))}
                    placeholder="Vollständige Datenschutzerklärung anzeigen"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Progress Bar Toggle */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={funnelSettings.showProgressBar ?? true}
                    onChange={(e) => setFunnelSettings(prev => ({ ...prev, showProgressBar: e.target.checked }))}
                    style={{ marginRight: '8px', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500', color: '#002d51' }}>
                    Fortschrittsbalken anzeigen
                  </span>
                </label>
              </div>

              {/* Navigation Buttons */}
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#002d51', marginBottom: '16px' }}>
                  Navigations-Buttons
                </h3>

                {/* Next Button */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    &quot;Weiter&quot; Button Text
                  </label>
                  <input
                    type="text"
                    value={funnelSettings.nextButtonText || 'Weiter'}
                    onChange={(e) => setFunnelSettings(prev => ({ ...prev, nextButtonText: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '12px' }}>
                      Button Farbe
                    </label>
                    <input
                      type="color"
                      value={funnelSettings.nextButtonColor || '#10b981'}
                      onChange={(e) => setFunnelSettings(prev => ({ ...prev, nextButtonColor: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '12px' }}>
                      Hover Farbe
                    </label>
                    <input
                      type="color"
                      value={funnelSettings.nextButtonHoverColor || '#059669'}
                      onChange={(e) => setFunnelSettings(prev => ({ ...prev, nextButtonHoverColor: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                {/* Previous Button */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    &quot;Zurück&quot; Button Text
                  </label>
                  <input
                    type="text"
                    value={funnelSettings.previousButtonText || 'Zurück'}
                    onChange={(e) => setFunnelSettings(prev => ({ ...prev, previousButtonText: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '12px' }}>
                      Button Farbe
                    </label>
                    <input
                      type="color"
                      value={funnelSettings.previousButtonColor || '#6b7280'}
                      onChange={(e) => setFunnelSettings(prev => ({ ...prev, previousButtonColor: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '12px' }}>
                      Hover Farbe
                    </label>
                    <input
                      type="color"
                      value={funnelSettings.previousButtonHoverColor || '#4b5563'}
                      onChange={(e) => setFunnelSettings(prev => ({ ...prev, previousButtonHoverColor: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button Section */}
                <div style={{ 
                  borderTop: '2px solid #e2e8f0', 
                  paddingTop: '16px',
                  marginTop: '16px' 
                }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#002d51', marginBottom: '12px' }}>
                    Final Submit Button (Letzter Schritt)
                  </h4>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                      Submit Button Text
                    </label>
                    <input
                      type="text"
                      value={funnelSettings.submitButtonText || 'Jetzt Absenden'}
                      onChange={(e) => setFunnelSettings(prev => ({ ...prev, submitButtonText: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '12px' }}>
                        Hintergrundfarbe
                      </label>
                      <input
                        type="color"
                        value={funnelSettings.submitButtonColor || '#10b981'}
                        onChange={(e) => setFunnelSettings(prev => ({ ...prev, submitButtonColor: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '40px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '12px' }}>
                        Text Farbe
                      </label>
                      <input
                        type="color"
                        value={funnelSettings.submitButtonTextColor || '#ffffff'}
                        onChange={(e) => setFunnelSettings(prev => ({ ...prev, submitButtonTextColor: e.target.value }))}
                        style={{
                          width: '100%',
                          height: '40px',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '12px' }}>
                      Hover Farbe
                    </label>
                    <input
                      type="color"
                      value={funnelSettings.submitButtonHoverColor || '#059669'}
                      onChange={(e) => setFunnelSettings(prev => ({ ...prev, submitButtonHoverColor: e.target.value }))}
                      style={{
                        width: '100%',
                        height: '40px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  
                  <div style={{ 
                    padding: '12px', 
                    background: '#ecfdf5', 
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#059669'
                  }}>
                    <strong>ℹ️ Hinweis:</strong> Dieser Button wird nur im letzten Schritt angezeigt, zusammen mit der Datenschutzerklärung.
                  </div>
                </div>
              </div>

              {/* Validation Summary */}
              {(!funnelSettings.customUrl?.trim() || !funnelSettings.privacyPolicy?.trim()) && (
                <div style={{
                  padding: '16px',
                  background: '#fef2f2',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#dc2626', fontSize: '16px' }}>⚠️</span>
                    <strong style={{ color: '#dc2626', fontSize: '14px' }}>Erforderliche Felder fehlen:</strong>
                  </div>
                  <ul style={{ color: '#dc2626', fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
                    {!funnelSettings.customUrl?.trim() && <li>Benutzerdefinierte URL (Slug)</li>}
                    {!funnelSettings.privacyPolicy?.trim() && <li>Datenschutzerklärung</li>}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowFormSettings(false)}
                  disabled={!funnelSettings.customUrl?.trim() || !funnelSettings.privacyPolicy?.trim()}
                  style={{
                    background: (!funnelSettings.customUrl?.trim() || !funnelSettings.privacyPolicy?.trim()) ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: (!funnelSettings.customUrl?.trim() || !funnelSettings.privacyPolicy?.trim()) ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: (!funnelSettings.customUrl?.trim() || !funnelSettings.privacyPolicy?.trim()) ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (funnelSettings.customUrl?.trim() && funnelSettings.privacyPolicy?.trim()) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (funnelSettings.customUrl?.trim() && funnelSettings.privacyPolicy?.trim()) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {(!funnelSettings.customUrl?.trim() || !funnelSettings.privacyPolicy?.trim()) 
                    ? 'Bitte füllen Sie alle Pflichtfelder aus' 
                    : 'Fertig'
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Title Edit Modal */}
        {editingStepIndex !== null && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
            onClick={() => setEditingStepIndex(null)}
          >
            <div
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                maxWidth: '400px',
                width: '90%'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '16px', color: '#002d51' }}>Schritt umbenennen</h3>
              <input
                type="text"
                value={editingStepTitle}
                onChange={(e) => setEditingStepTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateStepTitle(editingStepIndex, editingStepTitle);
                    setEditingStepIndex(null);
                  }
                }}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditingStepIndex(null)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    updateStepTitle(editingStepIndex, editingStepTitle);
                    setEditingStepIndex(null);
                  }}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Modal */}
        {showSaveModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowSaveModal(false)}
          >
            <div 
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '16px'
              }}>
                <h2 style={{ color: '#002d51', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  {isEditing ? 'Funnel Aktualisieren' : 'Funnel Speichern'}
                </h2>
                <button
                  onClick={() => setShowSaveModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#002d51' }}>
                  Funnel Name *
                </label>
                <input
                  type="text"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                  placeholder="Geben Sie den Funnel-Namen ein"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#002d51' }}>
                  Beschreibung
                </label>
                <textarea
                  value={funnelDescription}
                  onChange={(e) => setFunnelDescription(e.target.value)}
                  placeholder="Beschreibung (optional)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {(!isEditing || pipelineOption !== 'existing') && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#002d51' }}>
                    Pipeline Auswahl *
                  </label>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        value="existing"
                        checked={pipelineOption === 'existing'}
                        onChange={(e) => setPipelineOption(e.target.value as 'existing' | 'new')}
                        style={{ marginRight: '8px' }}
                      />
                      Bestehende Pipeline
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        value="new"
                        checked={pipelineOption === 'new'}
                        onChange={(e) => setPipelineOption(e.target.value as 'existing' | 'new')}
                        style={{ marginRight: '8px' }}
                      />
                      Neue Pipeline
                    </label>
                  </div>

                  {pipelineOption === 'existing' ? (
                    <>
                      <div style={{ marginBottom: '16px' }}>
                        <select
                          value={selectedPipeline}
                          onChange={(e) => {
                            setSelectedPipeline(e.target.value);
                            setSelectedStage('');
                          }}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="">Pipeline auswählen...</option>
                          {leadpoolPipelines.map(pipeline => (
                            <option key={pipeline.id} value={pipeline.id.toString()}>
                              {pipeline.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedPipeline && (
                        <div style={{ marginBottom: '16px' }}>
                          <select
                            value={selectedStage}
                            onChange={(e) => setSelectedStage(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          >
                            <option value="">Stage auswählen...</option>
                            {getSelectedPipelineStages().map(stage => (
                              <option key={stage.id} value={stage.id}>
                                {stage.order}. {stage.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  ) : (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          <input
                            type="text"
                            value={newPipelineName}
                            onChange={(e) => setNewPipelineName(e.target.value)}
                            placeholder="Pipeline-Namen eingeben"
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <input
                            type="text"
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            placeholder="Stage-Namen eingeben"
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  onClick={() => setShowSaveModal(false)}
                  disabled={loading.creating || loading.updating}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: loading.creating || loading.updating ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    opacity: loading.creating || loading.updating ? 0.6 : 1
                  }}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading.creating || loading.updating}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: loading.creating || loading.updating ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: loading.creating || loading.updating ? 0.6 : 1
                  }}
                >
                  {loading.creating || loading.updating
                    ? (isEditing ? 'Aktualisiere...' : 'Erstelle...')
                    : (isEditing ? 'Aktualisieren' : 'Speichern')
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowTemplates(false)}
          >
            <div 
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                maxWidth: '800px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '20px'
              }}>
                <h2 style={{ color: '#002d51', fontSize: '18px', fontWeight: '600' }}>
                  Vorlage wählen
                </h2>
                <button
                  onClick={() => setShowTemplates(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <div
                    key={key}
                    onClick={() => loadTemplate(key)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = '#002d51';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h3 style={{ color: '#002d51', marginBottom: '8px', fontSize: '16px' }}>
                      {template.name}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>
                      {template.description}
                    </p>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {template.steps.length} Schritt{template.steps.length !== 1 ? 'e' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Add Font Awesome CSS */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;  height: 100%; 
    overflow: hidden; }
        button:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        button:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
        [contenteditable]:focus { outline: 2px solid #002d51; outline-offset: 2px; border-radius: 4px; }
        [contenteditable]:hover { background: rgba(0, 45, 81, 0.05); }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #002d51 !important; box-shadow: 0 0 0 3px rgba(0, 45, 81, 0.1); }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #002d51; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #001f3d; }
      `}</style>
    </>
  );
};

const FunnelBuilder: React.FC = () => {
  return (
    <ClientOnlyWrapper>
      <FunnelBuilderContent />
    </ClientOnlyWrapper>
  );
};

export default FunnelBuilder;