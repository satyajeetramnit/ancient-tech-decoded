import { EpisodeData } from '@/types/episode';

export interface ValidationIssue {
  severity: 'ERROR' | 'WARNING';
  path: string;
  message: string;
}

export interface ValidationReport {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  stats: {
    sourcesCount: number;
    passagesCount: number;
    claimsCount: number;
    analogiesCount: number;
    realityCheckItemsCount: number;
  };
}

/**
 * Validates the research integrity and relational graph consistency
 * of an EpisodeData object according to Milestone 5 standards.
 */
export function validateEpisodeResearch(episode: EpisodeData): ValidationReport {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const sourceMap = new Map<string, typeof episode.sources[0]>();
  const passageMap = new Map<string, typeof episode.passages[0]>();
  const claimMap = new Map<string, typeof episode.textualObservations[0]>();

  const referencedSourceIds = new Set<string>();
  const referencedPassageIds = new Set<string>();
  const referencedClaimIds = new Set<string>();

  // 1. Validate Sources
  episode.sources.forEach((source, idx) => {
    if (!source.id) {
      errors.push({ severity: 'ERROR', path: `sources[${idx}]`, message: 'Source is missing an id.' });
      return;
    }
    if (sourceMap.has(source.id)) {
      errors.push({ severity: 'ERROR', path: `sources[${idx}].id`, message: `Duplicate source ID: "${source.id}".` });
    }
    sourceMap.set(source.id, source);

    if (!source.title || source.title.trim() === '') {
      errors.push({ severity: 'ERROR', path: `sources[${source.id}].title`, message: 'Source title cannot be empty.' });
    }
    const validSourceTypes = ['primary-text', 'translation', 'academic', 'archaeological', 'scientific', 'secondary'];
    if (!validSourceTypes.includes(source.type)) {
      errors.push({ severity: 'ERROR', path: `sources[${source.id}].type`, message: `Invalid source type: "${source.type}". Must be one of: ${validSourceTypes.join(', ')}` });
    }
  });

  // 2. Validate Passages
  episode.passages.forEach((passage, idx) => {
    if (!passage.id) {
      errors.push({ severity: 'ERROR', path: `passages[${idx}]`, message: 'Passage is missing an id.' });
      return;
    }
    if (passageMap.has(passage.id)) {
      errors.push({ severity: 'ERROR', path: `passages[${idx}].id`, message: `Duplicate passage ID: "${passage.id}".` });
    }
    passageMap.set(passage.id, passage);

    if (!passage.sourceId) {
      errors.push({ severity: 'ERROR', path: `passages[${passage.id}].sourceId`, message: 'Passage is missing a sourceId.' });
    } else if (!sourceMap.has(passage.sourceId)) {
      errors.push({ severity: 'ERROR', path: `passages[${passage.id}].sourceId`, message: `Passage references unknown sourceId: "${passage.sourceId}".` });
    } else {
      referencedSourceIds.add(passage.sourceId);
    }

    if (!passage.originalText || passage.originalText.trim() === '') {
      errors.push({ severity: 'ERROR', path: `passages[${passage.id}].originalText`, message: 'Passage missing original Sanskrit text.' });
    }
    if (!passage.transliteration || passage.transliteration.trim() === '') {
      errors.push({ severity: 'ERROR', path: `passages[${passage.id}].transliteration`, message: 'Passage missing transliteration (IAST).' });
    }
    if (!passage.translation || passage.translation.trim() === '') {
      errors.push({ severity: 'ERROR', path: `passages[${passage.id}].translation`, message: 'Passage missing translation.' });
    }
  });

  // 3. Validate Textual Observations (Claims)
  episode.textualObservations.forEach((claim, idx) => {
    if (!claim.id) {
      errors.push({ severity: 'ERROR', path: `textualObservations[${idx}]`, message: 'Claim is missing an id.' });
      return;
    }
    if (claimMap.has(claim.id)) {
      errors.push({ severity: 'ERROR', path: `textualObservations[${idx}].id`, message: `Duplicate claim ID: "${claim.id}".` });
    }
    claimMap.set(claim.id, claim);

    if (!claim.statement || claim.statement.trim() === '') {
      errors.push({ severity: 'ERROR', path: `textualObservations[${claim.id}].statement`, message: 'Claim statement cannot be empty.' });
    }

    // Check sources
    if (claim.evidenceType !== 'SPECULATIVE') {
      if (!claim.sourceIds || claim.sourceIds.length === 0) {
        errors.push({ severity: 'ERROR', path: `textualObservations[${claim.id}].sourceIds`, message: 'Non-speculative claim must cite at least one sourceId.' });
      } else {
        claim.sourceIds.forEach((srcId) => {
          if (!sourceMap.has(srcId)) {
            errors.push({ severity: 'ERROR', path: `textualObservations[${claim.id}].sourceIds`, message: `Claim references unknown sourceId: "${srcId}".` });
          } else {
            referencedSourceIds.add(srcId);
          }
        });
      }
    }

    // Check textual claims have passages
    if (claim.evidenceType === 'TEXTUAL') {
      if (!claim.passageIds || claim.passageIds.length === 0) {
        errors.push({ severity: 'ERROR', path: `textualObservations[${claim.id}].passageIds`, message: 'Textual claim must cite at least one passageId.' });
      } else {
        claim.passageIds.forEach((passId) => {
          if (!passageMap.has(passId)) {
            errors.push({ severity: 'ERROR', path: `textualObservations[${claim.id}].passageIds`, message: `Claim references unknown passageId: "${passId}".` });
          } else {
            referencedPassageIds.add(passId);
          }
        });
      }
    }

    if (claim.status === 'UNSUPPORTED' && claim.evidenceType === 'TEXTUAL') {
      warnings.push({ severity: 'WARNING', path: `textualObservations[${claim.id}].status`, message: 'Canonical textual claim is marked UNSUPPORTED.' });
    }
  });

  // 4. Validate Modern Analogies
  episode.potentialModernAnalogies.forEach((analogy, idx) => {
    if (!analogy.id) {
      errors.push({ severity: 'ERROR', path: `potentialModernAnalogies[${idx}]`, message: 'Analogy is missing an id.' });
    }
    if (!analogy.motivatedByClaimIds || analogy.motivatedByClaimIds.length === 0) {
      errors.push({ severity: 'ERROR', path: `potentialModernAnalogies[${analogy.id || idx}].motivatedByClaimIds`, message: 'Analogy must identify motivatedByClaimIds.' });
    } else {
      analogy.motivatedByClaimIds.forEach((cId) => {
        if (!claimMap.has(cId)) {
          errors.push({ severity: 'ERROR', path: `potentialModernAnalogies[${analogy.id}].motivatedByClaimIds`, message: `Analogy references unknown claimId: "${cId}".` });
        } else {
          referencedClaimIds.add(cId);
        }
      });
    }

    analogy.sourceIds.forEach((srcId) => {
      if (!sourceMap.has(srcId)) {
        errors.push({ severity: 'ERROR', path: `potentialModernAnalogies[${analogy.id}].sourceIds`, message: `Analogy references unknown sourceId: "${srcId}".` });
      } else {
        referencedSourceIds.add(srcId);
      }
    });

    if (!analogy.whatResembles || !analogy.whatDoesNotMatch || !analogy.whatWouldBeRequired || !analogy.whatTextDoesNotEstablish) {
      errors.push({
        severity: 'ERROR',
        path: `potentialModernAnalogies[${analogy.id}]`,
        message: 'Analogy missing one of the 4 required facets: whatResembles, whatDoesNotMatch, whatWouldBeRequired, whatTextDoesNotEstablish.'
      });
    }
  });

  // 5. Validate Dialectics
  if (episode.dialectics) {
    const { interpreter, skeptic } = episode.dialectics;
    if (interpreter?.supportingClaimIds) {
      interpreter.supportingClaimIds.forEach((cId) => {
        if (!claimMap.has(cId)) {
          errors.push({ severity: 'ERROR', path: 'dialectics.interpreter.supportingClaimIds', message: `Interpreter references unknown claimId: "${cId}".` });
        } else {
          referencedClaimIds.add(cId);
        }
      });
    }
    if (skeptic?.challengingClaimIds) {
      skeptic.challengingClaimIds.forEach((cId) => {
        if (!claimMap.has(cId)) {
          errors.push({ severity: 'ERROR', path: 'dialectics.skeptic.challengingClaimIds', message: `Skeptic references unknown claimId: "${cId}".` });
        } else {
          referencedClaimIds.add(cId);
        }
      });
    }
  }

  // 6. Validate Reality Check
  if (episode.realityCheck?.matrix) {
    episode.realityCheck.matrix.forEach((item, idx) => {
      if (item.claimIds) {
        item.claimIds.forEach((cId) => {
          if (!claimMap.has(cId)) {
            errors.push({ severity: 'ERROR', path: `realityCheck.matrix[${idx}].claimIds`, message: `Reality check references unknown claimId: "${cId}".` });
          } else {
            referencedClaimIds.add(cId);
          }
        });
      }
      if (item.passageIds) {
        item.passageIds.forEach((pId) => {
          if (!passageMap.has(pId)) {
            errors.push({ severity: 'ERROR', path: `realityCheck.matrix[${idx}].passageIds`, message: `Reality check references unknown passageId: "${pId}".` });
          } else {
            referencedPassageIds.add(pId);
          }
        });
      }
      if (item.sourceIds) {
        item.sourceIds.forEach((srcId) => {
          if (!sourceMap.has(srcId)) {
            errors.push({ severity: 'ERROR', path: `realityCheck.matrix[${idx}].sourceIds`, message: `Reality check references unknown sourceId: "${srcId}".` });
          } else {
            referencedSourceIds.add(srcId);
          }
        });
      }
    });
  }

  // 7. Orphan Checks
  passageMap.forEach((_, pId) => {
    if (!referencedPassageIds.has(pId)) {
      warnings.push({ severity: 'WARNING', path: `passages[${pId}]`, message: `Passage "${pId}" is not referenced by any claim or audit item.` });
    }
  });

  sourceMap.forEach((_, sId) => {
    if (!referencedSourceIds.has(sId)) {
      warnings.push({ severity: 'WARNING', path: `sources[${sId}]`, message: `Source "${sId}" is not referenced by any passage, claim, analogy, or audit item.` });
    }
  });

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    warnings,
    stats: {
      sourcesCount: episode.sources.length,
      passagesCount: episode.passages.length,
      claimsCount: episode.textualObservations.length,
      analogiesCount: episode.potentialModernAnalogies.length,
      realityCheckItemsCount: episode.realityCheck?.matrix?.length || 0,
    }
  };
}

/**
 * Asserts research validity at development or build time.
 * Throws a formatted Error if any violation occurs.
 */
export function assertResearchIntegrity(episode: EpisodeData): void {
  const report = validateEpisodeResearch(episode);
  if (!report.isValid) {
    const formatted = report.errors.map((e) => `  - [${e.path}]: ${e.message}`).join('\n');
    throw new Error(`[RESEARCH INTEGRITY ERROR] Found ${report.errors.length} research graph validation error(s):\n${formatted}`);
  }
}
