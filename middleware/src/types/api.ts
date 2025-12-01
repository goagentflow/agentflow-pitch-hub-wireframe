/**
 * Standard API response format
 * Per PRD_MVP_SUMMARY.md API Contract
 */

export interface ApiResponse<T> {
  data: T;
  metadata: {
    timestamp: string;
    correlationId: string;
  };
}

export interface ApiListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    retryable: boolean;
  };
}

/**
 * User context extracted from JWT token
 */
export interface UserContext {
  userId: string;
  tenantId: string;
  email: string;
  name: string;
  isStaff: boolean;
}

/**
 * Hub access permissions
 */
export interface HubAccess {
  hubId: string;
  canView: boolean;
  canEdit: boolean;
  canInvite: boolean;
  canViewInternal: boolean;
  accessLevel: 'full_access' | 'proposal_only' | 'documents_only' | 'view_only';
}

/**
 * Hub status
 */
export type HubStatus = 'draft' | 'active' | 'won' | 'lost';

/**
 * Hub type
 */
export type HubType = 'pitch' | 'client';

/**
 * Document visibility
 */
export type DocumentVisibility = 'client' | 'internal';

/**
 * Document category
 */
export type DocumentCategory = 'proposal' | 'contract' | 'reference' | 'brief' | 'deliverable' | 'other';
