import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const episodePath = path.resolve(__dirname, '../content/episodes/brahmastra.json');

console.log('🏛️  [ANCIENT TECH DECODED] Running Research Graph & Evidence Validator...');
console.log(`📁  Target File: ${episodePath}`);

if (!fs.existsSync(episodePath)) {
  console.error(`❌  ERROR: Episode file not found at ${episodePath}`);
  process.exit(1);
}

const raw = fs.readFileSync(episodePath, 'utf8');
let episode;
try {
  episode = JSON.parse(raw);
} catch (e) {
  console.error(`❌  ERROR: Invalid JSON syntax in ${episodePath}:`, e.message);
  process.exit(1);
}

const errors = [];
const warnings = [];

const sourceMap = new Map();
const passageMap = new Map();
const claimMap = new Map();

const referencedSourceIds = new Set();
const referencedPassageIds = new Set();
const referencedClaimIds = new Set();

// 1. Sources
(episode.sources || []).forEach((source, idx) => {
  if (!source.id) errors.push(`sources[${idx}]: Source missing id.`);
  if (sourceMap.has(source.id)) errors.push(`Duplicate source ID: "${source.id}".`);
  sourceMap.set(source.id, source);

  const validTypes = ['primary-text', 'translation', 'academic', 'archaeological', 'scientific', 'secondary'];
  if (!validTypes.includes(source.type)) {
    errors.push(`Source "${source.id}": Invalid type "${source.type}". Must be one of: ${validTypes.join(', ')}`);
  }
  if (!source.title) errors.push(`Source "${source.id}": Missing title.`);
});

// 2. Passages
(episode.passages || []).forEach((passage, idx) => {
  if (!passage.id) errors.push(`passages[${idx}]: Passage missing id.`);
  if (passageMap.has(passage.id)) errors.push(`Duplicate passage ID: "${passage.id}".`);
  passageMap.set(passage.id, passage);

  if (!passage.sourceId) {
    errors.push(`Passage "${passage.id}": Missing sourceId.`);
  } else if (!sourceMap.has(passage.sourceId)) {
    errors.push(`Passage "${passage.id}": References unknown sourceId "${passage.sourceId}".`);
  } else {
    referencedSourceIds.add(passage.sourceId);
  }

  if (!passage.originalText) errors.push(`Passage "${passage.id}": Missing Sanskrit text.`);
  if (!passage.transliteration) errors.push(`Passage "${passage.id}": Missing transliteration.`);
  if (!passage.translation) errors.push(`Passage "${passage.id}": Missing translation.`);
});

// 3. Claims
(episode.textualObservations || []).forEach((claim, idx) => {
  if (!claim.id) errors.push(`claim[${idx}]: Claim missing id.`);
  if (claimMap.has(claim.id)) errors.push(`Duplicate claim ID: "${claim.id}".`);
  claimMap.set(claim.id, claim);

  if (!claim.statement) errors.push(`Claim "${claim.id}": Missing statement.`);

  if (claim.evidenceType !== 'SPECULATIVE') {
    if (!claim.sourceIds || claim.sourceIds.length === 0) {
      errors.push(`Claim "${claim.id}": Non-speculative claim has empty sourceIds.`);
    } else {
      claim.sourceIds.forEach((sId) => {
        if (!sourceMap.has(sId)) errors.push(`Claim "${claim.id}": References unknown sourceId "${sId}".`);
        else referencedSourceIds.add(sId);
      });
    }
  }

  if (claim.evidenceType === 'TEXTUAL') {
    if (!claim.passageIds || claim.passageIds.length === 0) {
      errors.push(`Textual Claim "${claim.id}": Missing passageIds.`);
    } else {
      claim.passageIds.forEach((pId) => {
        if (!passageMap.has(pId)) errors.push(`Claim "${claim.id}": References unknown passageId "${pId}".`);
        else referencedPassageIds.add(pId);
      });
    }
  }
});

// 4. Analogies
(episode.potentialModernAnalogies || []).forEach((analogy) => {
  if (!analogy.id) errors.push(`Analogy "${analogy.concept}": Missing id.`);
  if (!analogy.motivatedByClaimIds || analogy.motivatedByClaimIds.length === 0) {
    errors.push(`Analogy "${analogy.id}": Missing motivatedByClaimIds.`);
  } else {
    analogy.motivatedByClaimIds.forEach((cId) => {
      if (!claimMap.has(cId)) errors.push(`Analogy "${analogy.id}": References unknown claimId "${cId}".`);
      else referencedClaimIds.add(cId);
    });
  }

  (analogy.sourceIds || []).forEach((sId) => {
    if (!sourceMap.has(sId)) errors.push(`Analogy "${analogy.id}": References unknown sourceId "${sId}".`);
    else referencedSourceIds.add(sId);
  });

  const requiredFacets = ['whatResembles', 'whatDoesNotMatch', 'whatWouldBeRequired', 'whatTextDoesNotEstablish'];
  requiredFacets.forEach((f) => {
    if (!analogy[f]) errors.push(`Analogy "${analogy.id}": Missing required facet "${f}".`);
  });
});

// 5. Dialectics
if (episode.dialectics) {
  const { interpreter, skeptic } = episode.dialectics;
  (interpreter?.supportingClaimIds || []).forEach((cId) => {
    if (!claimMap.has(cId)) errors.push(`Interpreter references unknown claimId "${cId}".`);
    else referencedClaimIds.add(cId);
  });
  (skeptic?.challengingClaimIds || []).forEach((cId) => {
    if (!claimMap.has(cId)) errors.push(`Skeptic references unknown claimId "${cId}".`);
    else referencedClaimIds.add(cId);
  });
}

// 6. Reality Check
if (episode.realityCheck?.matrix) {
  episode.realityCheck.matrix.forEach((item, idx) => {
    (item.claimIds || []).forEach((cId) => {
      if (!claimMap.has(cId)) errors.push(`Reality check item [${idx}] references unknown claimId "${cId}".`);
      else referencedClaimIds.add(cId);
    });
    (item.passageIds || []).forEach((pId) => {
      if (!passageMap.has(pId)) errors.push(`Reality check item [${idx}] references unknown passageId "${pId}".`);
      else referencedPassageIds.add(pId);
    });
    (item.sourceIds || []).forEach((sId) => {
      if (!sourceMap.has(sId)) errors.push(`Reality check item [${idx}] references unknown sourceId "${sId}".`);
      else referencedSourceIds.add(sId);
    });
  });
}

// 7. Orphan Checks
passageMap.forEach((_, pId) => {
  if (!referencedPassageIds.has(pId)) {
    warnings.push(`Passage "${pId}" is not referenced by any claim or audit item.`);
  }
});

sourceMap.forEach((_, sId) => {
  if (!referencedSourceIds.has(sId)) {
    warnings.push(`Source "${sId}" is not referenced by any passage, claim, analogy, or audit item.`);
  }
});

console.log('\n📊  Traceability Statistics:');
console.log(`    - Sources: ${sourceMap.size}`);
console.log(`    - Primary Passages: ${passageMap.size}`);
console.log(`    - Textual Claims: ${claimMap.size}`);
console.log(`    - Modern Analogies: ${(episode.potentialModernAnalogies || []).length}`);
console.log(`    - Reality Check Items: ${(episode.realityCheck?.matrix || []).length}`);
console.log(`    - Referenced Claims: ${referencedClaimIds.size}`);
console.log(`    - Referenced Passages: ${referencedPassageIds.size}`);
console.log(`    - Referenced Sources: ${referencedSourceIds.size}`);

if (warnings.length > 0) {
  console.log('\n⚠️   Warnings:');
  warnings.forEach((w) => console.log(`    - ${w}`));
}

if (errors.length > 0) {
  console.error('\n❌  VALIDATION FAILED with errors:');
  errors.forEach((err) => console.error(`    - ${err}`));
  process.exit(1);
} else {
  console.log('\n✅  RESEARCH INTEGRITY VALIDATION PASSED (0 Errors). All claims, passages, and sources are fully connected.\n');
  process.exit(0);
}
