/**
 * Client Intelligence services barrel export
 *
 * AI-powered features for client hubs:
 * - Instant Answers
 * - Decision Queue
 * - Meeting Prep/Follow-up
 * - Performance Narratives
 * - History (Institutional Memory)
 * - Risk Alerts
 */

// Instant Answers
export {
  createInstantAnswer,
  getInstantAnswer,
  getRecentInstantAnswers,
} from "./instant-answers.service";

// Decision Queue
export {
  getDecisions,
  getDecision,
  createDecision,
  updateDecision,
} from "./decision-queue.service";
export type { DecisionFilterParams } from "./decision-queue.service";

// Meeting Intelligence
export {
  generateMeetingPrep,
  getMeetingPrep,
  generateMeetingFollowUp,
  getMeetingFollowUp,
} from "./meeting-intelligence.service";

// Performance Narratives
export {
  generatePerformanceNarrative,
  getPerformanceNarrative,
  getLatestPerformanceNarrative,
} from "./performance.service";

// History & Alerts
export {
  getHistoryEvents,
  getRiskAlerts,
  acknowledgeRiskAlert,
} from "./history-alerts.service";
