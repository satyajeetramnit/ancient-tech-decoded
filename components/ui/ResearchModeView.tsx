'use client';

import React from 'react';
import { BookOpen, Shield, Atom, Sparkles, Scale, AlertTriangle, ExternalLink, CheckCircle2, Bookmark, ArrowUpRight } from 'lucide-react';
import { EpisodeData } from '@/types/episode';
import { EvidenceBadge } from './EvidenceBadge';

interface ResearchModeViewProps {
  data: EpisodeData;
  onOpenSources: () => void;
  onInspectPassage?: (passageId: string) => void;
}

export const ResearchModeView: React.FC<ResearchModeViewProps> = ({
  data,
  onOpenSources,
  onInspectPassage,
}) => {
  return (
    <main className="w-full min-h-screen bg-obsidian-500 text-gray-200 pt-24 pb-32 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto space-y-16 animate-fade-in font-sans">
      {/* Header Banner */}
      <header className="border-b border-gold-antique/20 pb-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-widest">
            Scholar Research Mode
          </span>
          <span className="px-2.5 py-1 rounded bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs font-mono uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Visual Status: {data.artifact.visualStatus}
          </span>
          <span className="text-xs font-mono text-gray-500">
            Season {data.season}, Episode {data.episode}
          </span>
        </div>

        <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-white tracking-wide">
          {data.title}
        </h1>
        <p className="text-lg md:text-xl font-garamond italic text-gold-warm/90 max-w-3xl">
          {data.subtitle}
        </p>
        <p className="text-xs text-gray-400 font-mono italic">
          *{data.artifact.visualDisclaimer}
        </p>
      </header>

      {/* Section 1: Primary Textual Witnesses */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-xl font-cinzel font-bold text-gold-antique flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold-warm" /> 1. Primary Textual Witnesses (Verified Against Cited BORI References)
          </h2>
          <button
            onClick={onOpenSources}
            className="text-xs font-mono text-telemetry-cyan hover:underline flex items-center gap-1"
          >
            <span>Inspect All Citations</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid gap-6">
          {data.passages.map((p) => (
            <div key={p.id} className="p-5 rounded-sm bg-obsidian-200/90 border border-gold-antique/25 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-gold-warm">
                  {p.work} — {p.parva || 'Parva: Unavailable'} ({p.verse})
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" /> {p.validationStatus}
                </span>
              </div>

              <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
                <p className="font-sanskrit text-lg text-amber-100 whitespace-pre-line leading-relaxed">
                  {p.originalText}
                </p>
                <p className="text-xs font-mono text-gray-400 italic">
                  IAST: {p.transliteration}
                </p>
              </div>

              <p className="text-sm font-sans text-gray-200 border-l-2 border-gold-antique pl-3 py-1">
                "{p.translation}"
              </p>

              {p.literalReadingNotes && (
                <p className="text-xs text-gray-400 pt-1 border-t border-white/5">
                  <strong className="text-gray-300">Scholarly Context:</strong> {p.literalReadingNotes}
                </p>
              )}

              {p.concordance && (
                <div className="text-[11px] font-mono text-gray-500 flex justify-between items-center pt-1 border-t border-white/5">
                  <span>Concordance: {p.concordance}</span>
                  {onInspectPassage && (
                    <button
                      onClick={() => onInspectPassage(p.id)}
                      className="text-gold-warm hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Inspect in Sources Drawer</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Formally Attested Textual Observations (Claims) */}
      <section className="space-y-6">
        <h2 className="text-xl font-cinzel font-bold text-gold-antique flex items-center gap-2 border-b border-white/10 pb-3">
          <BookOpen className="w-5 h-5 text-gold-warm" /> 2. Formally Attested Textual Observations (Claim Graph)
        </h2>

        <div className="space-y-4">
          {data.textualObservations.map((obs) => {
            const linkedPassages = data.passages.filter((p) => obs.passageIds?.includes(p.id));
            const linkedSources = data.sources.filter((s) => obs.sourceIds?.includes(s.id));

            return (
              <div key={obs.id} className="p-5 rounded-sm bg-obsidian-100 border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gold-warm">{obs.id}</span>
                    <EvidenceBadge
                      evidenceType={obs.evidenceType}
                      status={obs.status}
                      confidence={obs.confidence}
                      validationStatus={obs.validationStatus}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">
                    Status: {obs.status} // {obs.confidence} CONFIDENCE
                  </span>
                </div>

                <p className="text-sm text-gray-200 font-medium leading-relaxed">
                  {obs.statement}
                </p>

                {obs.notes && (
                  <p className="text-xs text-gray-400 font-sans italic border-l-2 border-white/10 pl-3">
                    {obs.notes}
                  </p>
                )}

                {/* Traceable Links: Passages & Sources */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-gray-500 text-[11px]">Supporting Passages:</span>
                  {linkedPassages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onInspectPassage ? onInspectPassage(p.id) : onOpenSources()}
                      className="px-2 py-0.5 rounded bg-black/40 border border-gold-antique/30 text-gold-warm hover:border-gold-warm text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Bookmark className="w-2.5 h-2.5" />
                      <span>{p.work} {p.verse}</span>
                    </button>
                  ))}

                  <span className="text-gray-500 text-[11px] ml-2">Sources:</span>
                  {linkedSources.map((s) => (
                    <span key={s.id} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 text-[10px] border border-white/5">
                      {s.title.slice(0, 32)}...
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 3: Deconstructed Phenomenological Attributes */}
      <section className="space-y-6">
        <h2 className="text-xl font-cinzel font-bold text-gold-antique flex items-center gap-2 border-b border-white/10 pb-3">
          <Atom className="w-5 h-5 text-gold-warm" /> 3. Deconstructed Phenomenological Attributes
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {data.phenomenology.map((cat, idx) => (
            <div key={idx} className="p-5 rounded-sm bg-obsidian-200 border border-white/10 space-y-3">
              <h3 className="text-sm font-mono uppercase tracking-wider text-gold-pale border-b border-white/10 pb-2">
                {cat.category}
              </h3>
              <ul className="space-y-2 text-xs text-gray-300">
                {cat.attributedProperties.map((prop, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2">
                    <span className="text-gold-antique text-sm">•</span>
                    <span>{prop}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Potential Modern Analogies */}
      <section className="space-y-6">
        <div className="border-b border-white/10 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-cinzel font-bold text-gold-antique flex items-center gap-2">
              <Atom className="w-5 h-5 text-telemetry-cyan" /> 4. Potential Modern Analogies (Co-Existing & Non-Ranked)
            </h2>
          </div>
          <div className="flex gap-2 pt-2 text-[10px] font-mono text-gray-400">
            <span className="px-2 py-0.5 rounded bg-telemetry-cyan/10 border border-telemetry-cyan/30 text-telemetry-cyan">
              MODERN ANALOGY
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
              NOT IDENTIFICATION
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
              NOT HISTORICAL EVIDENCE
            </span>
          </div>
        </div>

        <div className="grid gap-6">
          {data.potentialModernAnalogies.map((analogy) => {
            const motivatedClaims = data.textualObservations.filter((c) => analogy.motivatedByClaimIds?.includes(c.id));
            const linkedSources = data.sources.filter((s) => analogy.sourceIds?.includes(s.id));

            return (
              <div key={analogy.id || analogy.concept} className="p-6 rounded-sm bg-obsidian-200 border border-telemetry-cyan/25 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{analogy.concept}</h3>
                    <div className="text-[10px] font-mono text-gray-400 pt-0.5">
                      Motivated by textual claims: {analogy.motivatedByClaimIds?.join(', ') || 'N/A'}
                    </div>
                  </div>
                  <EvidenceBadge evidenceType={analogy.evidenceType} status={analogy.status} confidence={analogy.confidence} />
                </div>

                {/* 4 Required Facets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded bg-black/40 border border-emerald-500/20 space-y-1">
                    <span className="text-emerald-300 font-mono text-[10px] uppercase font-bold block">
                      1. What Resembles the Text:
                    </span>
                    <p className="text-gray-300 leading-relaxed">{analogy.whatResembles}</p>
                  </div>

                  <div className="p-3 rounded bg-black/40 border border-rose-500/20 space-y-1">
                    <span className="text-rose-300 font-mono text-[10px] uppercase font-bold block">
                      2. What Does Not Match:
                    </span>
                    <p className="text-gray-300 leading-relaxed">{analogy.whatDoesNotMatch}</p>
                  </div>

                  <div className="p-3 rounded bg-black/40 border border-amber-500/20 space-y-1">
                    <span className="text-amber-300 font-mono text-[10px] uppercase font-bold block">
                      3. What Would Be Required:
                    </span>
                    <p className="text-gray-300 leading-relaxed">{analogy.whatWouldBeRequired}</p>
                  </div>

                  <div className="p-3 rounded bg-black/40 border border-blue-500/20 space-y-1">
                    <span className="text-blue-300 font-mono text-[10px] uppercase font-bold block">
                      4. What the Text Does Not Establish:
                    </span>
                    <p className="text-gray-300 leading-relaxed">{analogy.whatTextDoesNotEstablish}</p>
                  </div>
                </div>

                {/* Supporting Motivated Claims & Sources */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] font-mono text-gray-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Motivating Evidence:</span>
                    {motivatedClaims.map((mc) => (
                      <span key={mc.id} className="text-gold-pale">
                        [{mc.id}]
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Scientific Sources:</span>
                    {linkedSources.map((ls) => (
                      <span key={ls.id} className="text-telemetry-cyan underline">
                        {ls.author || ls.title.slice(0, 24)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 5: Scientific Stress Test */}
      <section className="space-y-6">
        <h2 className="text-xl font-cinzel font-bold text-gold-antique flex items-center gap-2 border-b border-white/10 pb-3">
          <AlertTriangle className="w-5 h-5 text-amber-400" /> 5. Scientific & Material Stress Testing
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-5 rounded-sm bg-obsidian-200 border border-emerald-500/20 space-y-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-emerald-300 border-b border-white/10 pb-2">
              Established Scientific Principles
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              {data.scientificStressTest.establishedScientificPrinciples.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-sm bg-obsidian-200 border border-rose-500/20 space-y-3">
            <h3 className="text-sm font-mono uppercase tracking-wider text-rose-300 border-b border-white/10 pb-2">
              Material & Archaeological Constraints
            </h3>
            <ul className="space-y-2 text-xs text-gray-300">
              {data.scientificStressTest.materialAndPhysicalConstraints.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Section 6: The Dialectic Debate */}
      <section className="space-y-6">
        <h2 className="text-xl font-cinzel font-bold text-gold-antique flex items-center gap-2 border-b border-white/10 pb-3">
          <Scale className="w-5 h-5 text-gold-warm" /> 6. The Dialectic: Interpreter vs. Skeptic
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* The Interpreter */}
          <div className="p-6 rounded-sm bg-obsidian-200 border border-gold-antique/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-mono text-xs text-gold-warm uppercase tracking-wider font-semibold">The Interpreter</span>
              <span className="text-[10px] font-mono text-gray-400">Technological Hypothesis</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed italic">
              "{data.dialectics.interpreter.thesis}"
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-gold-pale uppercase block">Observed Features Interpreted:</span>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {data.dialectics.interpreter.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-gold-antique">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {data.dialectics.interpreter.supportingClaimIds && (
              <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-gray-400">
                Supporting Claims: {data.dialectics.interpreter.supportingClaimIds.join(', ')}
              </div>
            )}
          </div>

          {/* The Skeptic */}
          <div className="p-6 rounded-sm bg-obsidian-200 border border-blue-500/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-mono text-xs text-blue-300 uppercase tracking-wider font-semibold">The Skeptic</span>
              <span className="text-[10px] font-mono text-gray-400">Historical / Critical Method</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed italic">
              "{data.dialectics.skeptic.thesis}"
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-mono text-blue-300 uppercase block">Methodological Objections:</span>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {data.dialectics.skeptic.keyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {data.dialectics.skeptic.challengingClaimIds && (
              <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-gray-400">
                Challenging Interpretations of: {data.dialectics.skeptic.challengingClaimIds.join(', ')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 7: Reality Check Audit */}
      <section className="space-y-6 pt-4">
        <div className="p-8 rounded-sm bg-obsidian-900 border border-gold-antique/40 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-2xl font-cinzel font-bold text-white">7. The Reality Check Audit</h2>
            <p className="text-sm text-gray-300 mt-1">{data.realityCheck.summary}</p>
          </div>

          <div className="space-y-4">
            {data.realityCheck.matrix.map((row) => {
              const linkedPassages = data.passages.filter((p) => row.passageIds?.includes(p.id));
              const linkedSources = data.sources.filter((s) => row.sourceIds?.includes(s.id));

              return (
                <div key={row.id || row.category} className="p-5 rounded bg-obsidian-300 border border-white/5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-gold-warm font-semibold">
                      {row.category}
                    </span>
                    <EvidenceBadge evidenceType={row.badge.type} status={row.badge.status} confidence={row.badge.confidence} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm text-white font-medium">{row.finding}</h4>
                    {row.explanation && (
                      <p className="text-xs text-gray-300 leading-relaxed font-sans">{row.explanation}</p>
                    )}
                  </div>

                  {/* Supporting Provenance Links */}
                  {(linkedPassages.length > 0 || linkedSources.length > 0) && (
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-3 text-[11px] font-mono text-gray-400">
                      {linkedPassages.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Passages:</span>
                          {linkedPassages.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => onInspectPassage ? onInspectPassage(p.id) : onOpenSources()}
                              className="text-gold-pale hover:underline flex items-center gap-0.5"
                            >
                              <Bookmark className="w-2.5 h-2.5" />
                              <span>{p.verse}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {linkedSources.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Sources:</span>
                          {linkedSources.map((s) => (
                            <span key={s.id} className="text-gray-300">
                              {s.author || s.title.slice(0, 20)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 8: Speculative Engineering Sandbox Boundary */}
      <section className="p-6 rounded-sm bg-purple-950/20 border border-purple-500/30 space-y-4 text-xs font-mono">
        <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
          <span className="text-purple-300 font-bold uppercase tracking-widest">8. The What-If Speculative Sandbox Boundary</span>
          <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 text-[10px]">
            {data.whatIfSandbox.disclaimer}
          </span>
        </div>
        <p className="text-gray-300 leading-relaxed">
          The interactive What-If sandbox represents a theoretical systems modeling experiment. It demonstrates thermodynamic contradictions and material incompatibilities (e.g. grass reed vaporization at 300°C vs. Coulomb barrier energy densities) to explain why mythopoetic descriptions cannot be mapped to operational physical weapons without invoking speculative physics.
        </p>
      </section>
    </main>
  );
};
