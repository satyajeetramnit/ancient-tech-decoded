'use client';

import React, { useState } from 'react';
import { BookOpen, Landmark, Pickaxe, Atom, Compass, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { EvidenceType, ClaimStatus, Confidence, ValidationStatus } from '@/types/sources';
import { cn } from '@/lib/utils';

interface EvidenceBadgeProps {
  evidenceType: EvidenceType;
  status: ClaimStatus;
  confidence?: Confidence;
  validationStatus?: ValidationStatus;
  passageRef?: string;
  className?: string;
  onClick?: () => void;
}

const typeConfig: Record<EvidenceType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; border: string }> = {
  TEXTUAL: {
    label: 'Primary Text',
    icon: BookOpen,
    color: 'text-amber-300 bg-amber-950/40 border-amber-500/30',
    border: 'border-amber-500/40',
  },
  HISTORICAL: {
    label: 'Historical',
    icon: Landmark,
    color: 'text-blue-300 bg-blue-950/40 border-blue-500/30',
    border: 'border-blue-500/40',
  },
  ARCHAEOLOGICAL: {
    label: 'Archaeological',
    icon: Pickaxe,
    color: 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30',
    border: 'border-emerald-500/40',
  },
  SCIENTIFIC: {
    label: 'Scientific Analogy',
    icon: Atom,
    color: 'text-cyan-300 bg-cyan-950/40 border-cyan-500/30',
    border: 'border-cyan-500/40',
  },
  SPECULATIVE: {
    label: 'Hypothesis',
    icon: Compass,
    color: 'text-purple-300 bg-purple-950/40 border-purple-500/30',
    border: 'border-purple-500/40',
  },
};

const statusConfig: Record<ClaimStatus, { label: string; color: string }> = {
  SUPPORTED: { label: 'Supported by Text', color: 'text-emerald-400' },
  CONTESTED: { label: 'Scholarly Contested', color: 'text-amber-400' },
  ANALOGICAL: { label: 'Conceptual Analogy', color: 'text-cyan-400' },
  HYPOTHETICAL: { label: 'Speculative Model', color: 'text-purple-400' },
  UNSUPPORTED: { label: 'Unsupported Claim', color: 'text-rose-400' },
};

export const EvidenceBadge: React.FC<EvidenceBadgeProps> = ({
  evidenceType,
  status,
  confidence,
  validationStatus,
  passageRef,
  className,
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const typeInfo = typeConfig[evidenceType] || typeConfig.TEXTUAL;
  const statusInfo = statusConfig[status] || statusConfig.SUPPORTED;
  const Icon = typeInfo.icon;

  return (
    <div className="relative inline-block" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono tracking-wider uppercase border transition-all duration-200 backdrop-blur-md',
          typeInfo.color,
          onClick && 'hover:brightness-125 cursor-pointer',
          className
        )}
      >
        <Icon className="w-3 h-3 opacity-90 shrink-0" />
        <span className="font-semibold">{typeInfo.label}</span>
        <span className="opacity-40">|</span>
        <span className={cn('text-[10px]', statusInfo.color)}>{status}</span>
        {validationStatus === 'VERIFIED' && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]" title="Verified in BORI Critical Edition" />
        )}
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-72 p-3 bg-obsidian-100 border border-gold-antique/30 rounded-sm shadow-xl text-left font-sans text-xs backdrop-blur-xl animate-fade-in pointer-events-none">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-2">
            <span className="font-mono text-[10px] tracking-widest text-gold-warm uppercase">{evidenceType} EVIDENCE</span>
            {confidence && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-gray-300">
                Confidence: {confidence}
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-gray-300">
            <div className="flex items-start gap-1.5">
              <span className="text-gray-400 shrink-0">Epistemic Status:</span>
              <span className={cn('font-medium', statusInfo.color)}>{statusInfo.label}</span>
            </div>

            {passageRef && (
              <div className="text-[11px] text-gray-400 font-mono pt-1">
                Ref: <span className="text-gold-pale">{passageRef}</span>
              </div>
            )}

            {validationStatus && (
              <div className="text-[10px] pt-1 text-gray-400 flex items-center gap-1 border-t border-white/5 mt-1">
                {validationStatus === 'VERIFIED' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                )}
                <span>BORI Validation: <strong className="text-white">{validationStatus}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
