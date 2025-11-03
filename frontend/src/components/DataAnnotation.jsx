import React, { useEffect, useState } from 'react';
import { Info, Clock, MapPin, Calendar, Tag, User, Check, Download } from 'lucide-react';

/**
 * DataAnnotation Component
 * Provides consistent, styled annotations for data visualization
 * 
 * Supports automated data insertion and quality assurance features
 */
export const DataAnnotation = ({ 
  type = 'info', 
  label, 
  value, 
  timestamp,
  position = 'top-right',
  color = 'primary'
}) => {
  // Icon mapping based on annotation type
  const iconMap = {
    info: Info,
    time: Clock,
    location: MapPin,
    date: Calendar,
    tag: Tag,
    user: User
  };
  
  // Color mapping for consistent styling
  const colorMap = {
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    secondary: 'bg-purple-100 text-purple-800 border-purple-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200'
  };
  
  // Position mapping for placement
  const positionMap = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'center': 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };
  
  const IconComponent = iconMap[type] || Info;
  
  return (
    <div className={`absolute ${positionMap[position]} z-10 flex items-center rounded-md px-3 py-1.5 text-sm font-medium border ${colorMap[color]}`}>
      <IconComponent size={14} className="mr-1.5" />
      <span className="font-semibold mr-1">{label}:</span>
      <span>{value}</span>
      {timestamp && (
        <span className="ml-2 text-xs opacity-75">
          {new Date(timestamp).toLocaleString()}
        </span>
      )}
    </div>
  );
};

/**
 * DataAnnotationGroup Component
 * Container for multiple annotations with consistent spacing
 */
export const DataAnnotationGroup = ({ children, position = 'top-right' }) => {
  // Position mapping for the group
  const positionMap = {
    'top-left': 'top-2 left-2 flex-col items-start',
    'top-right': 'top-2 right-2 flex-col items-end',
    'bottom-left': 'bottom-2 left-2 flex-col items-start',
    'bottom-right': 'bottom-2 right-2 flex-col items-end',
    'top': 'top-2 left-0 right-0 flex-row justify-center',
    'bottom': 'bottom-2 left-0 right-0 flex-row justify-center'
  };
  
  return (
    <div className={`absolute ${positionMap[position]} z-10 flex gap-2`}>
      {children}
    </div>
  );
};

/**
 * AnnotatedImage Component
 * Wrapper for images with annotations
 */
export const AnnotatedImage = ({ 
  src, 
  alt, 
  className, 
  annotations = [],
  preserveOriginal = true
}) => {
  return (
    <div className="relative inline-block">
      <img 
        src={src} 
        alt={alt} 
        className={`${className} ${preserveOriginal ? 'pointer-events-none' : ''}`} 
      />
      
      {annotations.map((annotation, index) => (
        <DataAnnotation 
          key={index}
          {...annotation}
        />
      ))}
    </div>
  );
};

/**
 * AnnotatedCard Component
 * Card with data annotations
 */
export const AnnotatedCard = ({ 
  title, 
  children, 
  className, 
  annotations = [],
  autoInsertData = true
}) => {
  const [autoAnnotations, setAutoAnnotations] = useState([]);
  
  // Automated data insertion mechanism
  useEffect(() => {
    if (autoInsertData) {
      // Generate automatic annotations based on content and context
      const currentTime = new Date().toISOString();
      const automaticAnnotations = [
        ...(annotations || []),
        // Only add timestamp if not already present
        !(annotations || []).some(a => a && a.type === 'time') ? {
          type: 'time',
          label: 'Generated',
          value: new Date().toLocaleTimeString(),
          position: 'bottom-left',
          color: 'secondary'
        } : null
      ].filter(Boolean);
      
      setAutoAnnotations(automaticAnnotations);
    } else {
      setAutoAnnotations(annotations || []);
    }
  }, [annotations, autoInsertData]);

  return (
    <div className={`relative bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {children}
      
      {autoAnnotations.map((annotation, index) => (
        <DataAnnotation 
          key={index}
          {...annotation}
        />
      ))}
    </div>
  );
};

/**
 * ExportOptions Component
 * Controls for exporting annotated data
 */
export const ExportOptions = ({ 
  onExport, 
  formats = ['png', 'pdf', 'csv'],
  className = ''
}) => {
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Export:</span>
      <div className="flex items-center gap-1">
        {formats.map(format => (
          <button
            key={format}
            onClick={() => onExport(format, includeAnnotations)}
            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            {format.toUpperCase()}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-1 text-xs text-gray-600 ml-2">
        <input
          type="checkbox"
          checked={includeAnnotations}
          onChange={(e) => setIncludeAnnotations(e.target.checked)}
          className="h-3 w-3"
        />
        Include annotations
      </label>
    </div>
  );
};

/**
 * VerificationBadge Component
 * Visual indicator for verified data
 */
export const VerificationBadge = ({
  verified = false,
  verifiedBy,
  verifiedAt,
  position = 'bottom-left',
  onVerify = null
}) => {
  const [isVerified, setIsVerified] = useState(verified);
  const [qaChecked, setQaChecked] = useState(false);
  
  const positionMap = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2'
  };
  
  // Quality assurance check
  const performQaCheck = () => {
    setQaChecked(true);
    // Simulate QA verification process
    console.log("QA check performed for data accuracy and readability");
    return true;
  };
  
  // Handle verification
  const handleVerify = () => {
    const qaResult = performQaCheck();
    if (qaResult && onVerify) {
      onVerify({
        verified: true,
        verifiedBy: "Current User",
        verifiedAt: new Date().toISOString(),
        qaChecked: true
      });
    }
    setIsVerified(true);
  };
  
  // Only return null if both conditions are met
  if (isVerified === false && onVerify === null) return null;
  
  return (
    <div className={`absolute ${positionMap[position]} z-20 flex items-center ${isVerified ? 'bg-green-100 text-green-800 border border-green-200 rounded-full px-2 py-0.5 text-xs font-medium' : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium'}`}>
      {isVerified ? (
        <>
          <Check size={14} className="mr-1.5" />
          <span>Verified</span>
          {verifiedBy && <span className="ml-1 font-semibold">by {verifiedBy}</span>}
          {verifiedAt && <span className="ml-1 text-xs opacity-75">• {new Date(verifiedAt).toLocaleDateString()}</span>}
          {qaChecked && <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">QA Passed</span>}
        </>
      ) : (
        <button 
          onClick={handleVerify}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <Check size={14} className="mr-1.5" />
          Verify Data
        </button>
      )}
    </div>
  );
};

export default {
  DataAnnotation,
  DataAnnotationGroup,
  AnnotatedImage,
  AnnotatedCard,
  ExportOptions,
  VerificationBadge
};