export const REQUIREMENT_TYPES = [
  "policy",
  "process",
  "competency",
  "task",
  "assessment",
  "knowledge",
];

export const MUST_TYPES = [
  "must_know",
  "must_complete",
  "must_demonstrate",
  "must_acknowledge",
  "recommended",
  "optional",
  "not_applicable",
];

export const MANDATORY_MUST_TYPES = new Set([
  "must_know",
  "must_complete",
  "must_demonstrate",
  "must_acknowledge",
]);

export const PRIORITIES = ["low", "medium", "high", "critical"];

export const DUE_STAGES = [
  "day_1",
  "week_1",
  "week_2",
  "first_30_days",
  "first_60_days",
  "first_90_days",
];

export const PRECEDENCE_SOURCE_TYPES = [
  "policy",
  "hr_policy",
  "info_security",
  "workplace_conduct",
  "data_privacy",
  "sop",
  "process_manual",
  "compliance",
  "role_description",
  "handbook",
  "department_guideline",
  "faq",
  "safety",
  "informal_guidance",
  "other",
];
