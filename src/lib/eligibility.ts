export type Status = "eligible" | "verify" | "not-met";
export type Check = { status: Status; note: string };

export type IeltsRequirement = { overall: number; band: number };

export type IeltsScores = {
  overall: string;
  listening: string;
  reading: string;
  writing: string;
  speaking: string;
};

const VERIFY_TEXT = "This requirement needs verification using the official university source.";

function parseIeltsScore(raw: string): number | null {
  if (!raw.trim()) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 9) return null;
  return value;
}

export function ieltsResult(requirement: IeltsRequirement | null, scores: IeltsScores): Check {
  if (!requirement) {
    return { status: "verify", note: `IELTS requirement not verified. ${VERIFY_TEXT}` };
  }

  const { overall, band } = requirement;
  const overallScore = parseIeltsScore(scores.overall);
  if (overallScore === null) {
    return {
      status: "verify",
      note: `No valid IELTS overall score provided. Published requirement: ${overall} overall, minimum ${band} in each component.`,
    };
  }

  if (overallScore < overall) {
    return {
      status: "not-met",
      note: `${overallScore} overall is below the published ${overall} overall requirement. Each component must also be at least ${band}.`,
    };
  }

  const components = [
    ["Listening", scores.listening],
    ["Reading", scores.reading],
    ["Writing", scores.writing],
    ["Speaking", scores.speaking],
  ] as const;

  const parsedComponents = components.map(([label, raw]) => [label, parseIeltsScore(raw)] as const);
  const missing = parsedComponents.filter(([, value]) => value === null).map(([label]) => label);

  if (missing.length > 0) {
    return {
      status: "verify",
      note: `${overallScore} overall meets the published ${overall}, but ${missing.join(", ")} ${missing.length === 1 ? "score is" : "scores are"} missing or invalid. Each component must be at least ${band}.`,
    };
  }

  const failed = parsedComponents.filter(([, value]) => value !== null && value < band);
  if (failed.length > 0) {
    const details = failed.map(([label, value]) => `${label} ${value}`).join(", ");
    return {
      status: "not-met",
      note: `${overallScore} overall meets the published ${overall}, but ${details} ${failed.length === 1 ? "is" : "are"} below the minimum ${band} component requirement.`,
    };
  }

  return {
    status: "eligible",
    note: `${overallScore} overall meets the published ${overall}, and all four component scores meet the minimum ${band}.`,
  };
}
