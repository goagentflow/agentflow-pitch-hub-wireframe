/**
 * Mock data constants and helpers
 *
 * Extracted to prevent circular dependencies between mock data files.
 */

// ============================================================================
// Date Helpers
// ============================================================================

const now = new Date();
export const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
export const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
export const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

// ============================================================================
// Hub IDs
// ============================================================================

// Mock converted client hub (hub-3 "Meridian Digital" is status: "won")
export const mockClientHubId = "hub-3";
