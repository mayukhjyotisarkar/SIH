import React from 'react';
import { MessageSquare, FileText, UserCheck, Stethoscope, CheckCircle2 } from 'lucide-react';
import { ProvenanceType } from '../types';

interface ProvenanceTagProps {
  provenance?: ProvenanceType | string;
  staffId?: string | null;
  className?: string;
}

export const ProvenanceTag: React.FC<ProvenanceTagProps> = ({
  provenance = 'patient-conversation',
  staffId,
  className = '',
}) => {
  if (provenance === 'physician-amended') {
    return (
      <span
        title="Amended & verified by attending OPD physician"
        className={`inline-flex items-center space-x-1 text-[11px] font-medium bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-full ${className}`}
      >
        <Stethoscope className="w-3 h-3 text-indigo-700" />
        <span>Doctor Amended</span>
      </span>
    );
  }

  if (provenance === 'manual-correction') {
    return (
      <span
        title="Corrected and verified by patient/staff after OCR inspection"
        className={`inline-flex items-center space-x-1 text-[11px] font-medium bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full ${className}`}
      >
        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
        <span>Verified / Corrected</span>
      </span>
    );
  }

  if (provenance === 'staff-manual') {
    return (
      <span
        title={`Manually entered by hospital staff (${staffId || 'OPD Nurse'})`}
        className={`inline-flex items-center space-x-1 text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full ${className}`}
      >
        <UserCheck className="w-3 h-3 text-amber-700" />
        <span>Staff Manual {staffId ? `(${staffId})` : ''}</span>
      </span>
    );
  }

  if (provenance === 'document-extraction' || provenance === 'document-extraction-fallback') {
    return (
      <span
        title="Extracted from uploaded medical prescription or lab report"
        className={`inline-flex items-center space-x-1 text-[11px] font-medium bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-full ${className}`}
      >
        <FileText className="w-3 h-3 text-blue-700" />
        <span>Document OCR</span>
      </span>
    );
  }

  if (provenance === 'attendant-conversation') {
    return (
      <span
        title="Reported by patient attendant / relative"
        className={`inline-flex items-center space-x-1 text-[11px] font-medium bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full ${className}`}
      >
        <MessageSquare className="w-3 h-3 text-purple-700" />
        <span>Attendant Conversation</span>
      </span>
    );
  }

  return (
    <span
      title="Captured via conversational intake at patient kiosk"
      className={`inline-flex items-center space-x-1 text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full ${className}`}
    >
      <MessageSquare className="w-3 h-3 text-teal-600" />
      <span>Patient Voice/Tap</span>
    </span>
  );
};
