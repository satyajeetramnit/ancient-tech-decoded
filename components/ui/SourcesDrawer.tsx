'use client';

import React, { useState, useEffect } from 'react';
import { X, BookOpen, ExternalLink, CheckCircle2, ShieldAlert, Sparkles, Filter, Bookmark } from 'lucide-react';
import { PassageReference, Source, SourceType } from '@/types/sources';
import { cn } from '@/lib/utils';

interface SourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sources: Source[];
  passages: PassageReference[];
  activePassageId?: string | null;
}

type FilterCategory = 'all' | 'passages' | 'primary-text' | 'translation' | 'academic' | 'archaeological' | 'scientific' | 'secondary';

export const SourcesDrawer: React.FC<SourcesDrawerProps> = ({
  isOpen,
  onClose,
  sources,
  passages,
  activePassageId,
}) => {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');

  useEffect(() => {
    if (isOpen && activePassageId) {
      setFilterCategory('passages');
      setTimeout(() => {
        const el = document.getElementById(`passage-${activePassageId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [isOpen, activePassageId]);

  if (!isOpen) return null;

  const getSourceBadge = (type: SourceType) => {
    switch (type) {
      case 'primary-text':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'translation':
        return 'bg-blue-950/60 text-blue-300 border-blue-500/40';
      case 'academic':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      case 'archaeological':
        return 'bg-orange-950/60 text-orange-300 border-orange-500/40';
      case 'scientific':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40';
      case 'secondary':
        return 'bg-gray-800 text-gray-300 border-gray-600/40';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  const filteredSources = sources.filter((s) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'passages') return false;
    return s.type === filterCategory;
  });

  const showPassages = filterCategory === 'all' || filterCategory === 'passages';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-full max-w-2xl h-full bg-obsidian-200 border-l border-gold-antique/30 shadow-2xl flex flex-col overflow-hidden text-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-obsidian-300/80">
          <div>
            <div className="flex items-center gap-2 text-gold-warm text-xs font-mono uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Research Archive & Primary Witnesses</span>
            </div>
            <h2 className="text-xl font-cinzel font-bold text-white mt-1">Source & Textual Documentation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sources overlay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Category Filter Bar */}
        <div className="px-6 py-2.5 border-b border-white/5 flex gap-1.5 overflow-x-auto bg-obsidian-100/60 text-[11px] font-mono scrollbar-thin">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn('px-2.5 py-1 rounded-sm border whitespace-nowrap transition-colors', filterCategory === 'all' ? 'border-gold-warm text-gold-warm bg-gold-warm/10' : 'border-white/10 text-gray-400 hover:text-gray-200')}
          >
            All ({passages.length + sources.length})
          </button>
          <button
            onClick={() => setFilterCategory('passages')}
            className={cn('px-2.5 py-1 rounded-sm border whitespace-nowrap transition-colors', filterCategory === 'passages' ? 'border-gold-warm text-gold-warm bg-gold-warm/10' : 'border-white/10 text-gray-400 hover:text-gray-200')}
          >
            Primary Passages ({passages.length})
          </button>
          <button
            onClick={() => setFilterCategory('primary-text')}
            className={cn('px-2.5 py-1 rounded-sm border whitespace-nowrap transition-colors', filterCategory === 'primary-text' ? 'border-amber-400 text-amber-300 bg-amber-950/40' : 'border-white/10 text-gray-400 hover:text-gray-200')}
          >
            Primary Texts
          </button>
          <button
            onClick={() => setFilterCategory('translation')}
            className={cn('px-2.5 py-1 rounded-sm border whitespace-nowrap transition-colors', filterCategory === 'translation' ? 'border-blue-400 text-blue-300 bg-blue-950/40' : 'border-white/10 text-gray-400 hover:text-gray-200')}
          >
            Translations
          </button>
          <button
            onClick={() => setFilterCategory('academic')}
            className={cn('px-2.5 py-1 rounded-sm border whitespace-nowrap transition-colors', filterCategory === 'academic' ? 'border-purple-400 text-purple-300 bg-purple-950/40' : 'border-white/10 text-gray-400 hover:text-gray-200')}
          >
            Academic / Scholarly
          </button>
          <button
            onClick={() => setFilterCategory('archaeological')}
            className={cn('px-2.5 py-1 rounded-sm border whitespace-nowrap transition-colors', filterCategory === 'archaeological' ? 'border-orange-400 text-orange-300 bg-orange-950/40' : 'border-white/10 text-gray-400 hover:text-gray-200')}
          >
            Archaeological
          </button>
          <button
            onClick={() => setFilterCategory('scientific')}
            className={cn('px-2.5 py-1 rounded-sm border whitespace-nowrap transition-colors', filterCategory === 'scientific' ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40' : 'border-white/10 text-gray-400 hover:text-gray-200')}
          >
            Scientific
          </button>
          <button
            onClick={() => setFilterCategory('secondary')}
            className={cn('px-2.5 py-1 rounded-sm border whitespace-nowrap transition-colors', filterCategory === 'secondary' ? 'border-gray-400 text-gray-200 bg-gray-800' : 'border-white/10 text-gray-400 hover:text-gray-200')}
          >
            Secondary
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Primary Passages Section */}
          {showPassages && (
            <div className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gold-antique flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Primary Passages (Verified Against Cited BORI References)
              </h3>

              {passages.map((p) => {
                const isHighlighted = activePassageId === p.id;
                const parentSource = sources.find((s) => s.id === p.sourceId);

                return (
                  <div
                    key={p.id}
                    id={`passage-${p.id}`}
                    className={cn(
                      'p-4 rounded-sm border transition-all duration-300 space-y-3',
                      isHighlighted
                        ? 'border-gold-warm bg-gold-warm/10 ring-2 ring-gold-warm/40 shadow-[0_0_20px_rgba(243,198,79,0.15)]'
                        : 'border-white/10 bg-obsidian-100/60 hover:border-gold-antique/30'
                    )}
                  >
                    {/* Passage Header */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <Bookmark className={cn('w-3 h-3', isHighlighted ? 'text-gold-warm' : 'text-gray-500')} />
                        <span className="font-semibold text-gold-warm">{p.work} ({p.parva || 'Parva: Unavailable'} {p.verse})</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 text-[10px]">
                        <CheckCircle2 className="w-2.5 h-2.5" /> {p.validationStatus}
                      </span>
                    </div>

                    {/* Bibliographic Structure Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-black/30 p-2 rounded border border-white/5 text-gray-400">
                      <div>
                        <span className="text-gray-500 block">Work:</span>
                        <span className="text-gray-200">{p.work}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Edition:</span>
                        <span className="text-gray-200">{p.edition}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Parva / Chapter:</span>
                        <span className="text-gray-200">{p.parva || 'Unavailable'} — Ch. {p.chapter}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Verse Number:</span>
                        <span className="text-gray-200">{p.verse}</span>
                      </div>
                    </div>

                    {/* Sanskrit & Translation */}
                    <div className="space-y-2">
                      <p className="font-sanskrit text-base text-amber-100/95 leading-relaxed tracking-wide whitespace-pre-line bg-black/40 p-3 rounded border border-white/5">
                        {p.originalText}
                      </p>
                      <p className="text-xs font-mono text-gray-400 italic pl-1">
                        IAST: {p.transliteration}
                      </p>
                      <p className="text-sm font-sans text-gray-200 leading-relaxed border-l-2 border-gold-antique/60 pl-3 py-1 bg-obsidian-300/30">
                        "{p.translation}"
                      </p>
                    </div>

                    {/* Context, Concordance & Provenance */}
                    <div className="pt-2 border-t border-white/5 text-[11px] font-mono space-y-1 text-gray-400">
                      {p.literalReadingNotes && (
                        <div>
                          <span className="text-gold-pale">Context: </span>
                          <span className="text-gray-300">{p.literalReadingNotes}</span>
                        </div>
                      )}
                      {p.concordance && (
                        <div>
                          <span className="text-gray-500">Concordance: </span>
                          <span className="text-gray-300">{p.concordance}</span>
                        </div>
                      )}
                      {p.provenanceNotes && (
                        <div>
                          <span className="text-gray-500">Provenance: </span>
                          <span className="text-gray-300">{p.provenanceNotes}</span>
                        </div>
                      )}
                      {parentSource && (
                        <div className="text-[10px] text-gray-500 pt-1">
                          Source Repository: {parentSource.title} ({parentSource.publisher || parentSource.publication || 'Publisher: Unavailable'})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sources Section */}
          {filteredSources.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-mono uppercase tracking-widest text-gold-antique flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Cited Editions & Research Bibliography ({filteredSources.length})
              </h3>

              {filteredSources.map((src) => (
                <div
                  key={src.id}
                  className="p-4 rounded-sm border border-white/10 bg-obsidian-100/60 hover:border-white/20 transition-all text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <span className={cn('font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border', getSourceBadge(src.type))}>
                      {src.type.replace('-', ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-gold-pale">{src.year ? src.year : 'Year: Unavailable'}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">{src.title}</h4>

                  <div className="text-gray-300 font-sans space-y-0.5">
                    <p>{src.author ? `Author: ${src.author}` : src.translator ? `Translator: ${src.translator}` : 'Author: Traditional / Collective'}</p>
                    <p className="text-gray-400 text-[11px]">{src.publisher ? `Publisher: ${src.publisher}` : src.publication ? `Publication: ${src.publication}` : 'Publisher: Unavailable in record'}</p>
                    {src.citation && (
                      <p className="text-[11px] font-mono text-gray-400">Citation: {src.citation}</p>
                    )}
                  </div>

                  {src.scholarlyStanding && (
                    <p className="text-[11px] text-gray-400 pt-1.5 border-t border-white/5 italic">
                      {src.scholarlyStanding}
                    </p>
                  )}

                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-telemetry-cyan hover:underline pt-1"
                    >
                      <span>External Source Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
