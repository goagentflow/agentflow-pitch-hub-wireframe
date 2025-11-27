# AgentFlow Pitch Hub - Frontend Audit

**Phase 1 Complete** - Comprehensive audit of current state, identifying what works, what's placeholder, and what Stephen needs to build in the middleware.

**Revision 1** - Updated per senior dev review: hub-scoped endpoints, pagination standards, event enums, licensing caveats.

---

## 0. API Conventions

### Base URL & Versioning

All endpoints use `/api/v1/` prefix:
```
https://api.agentflow.com/api/v1/hubs/{hubId}/...
```

### Pagination, Sorting, Filtering

All list endpoints support these query parameters:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (1-indexed) | `?page=2` |
| `pageSize` | number | Items per page (default 20, max 100) | `?pageSize=50` |
| `sort` | string | Sort field and direction | `?sort=createdAt:desc` |
| `filter` | string | Filter expression | `?filter=status:active` |
| `search` | string | Full-text search | `?search=proposal` |

### Common Error Responses

All endpoints return errors in this format:

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

| Status | Code | When |
|--------|------|------|
| 401 | `UNAUTHENTICATED` | No valid token |
| 403 | `FORBIDDEN` | User lacks permission for this hub/resource |
| 404 | `NOT_FOUND` | Hub or resource doesn't exist |
| 409 | `CONFLICT` | Resource already exists (e.g., duplicate invite) |
| 413 | `PAYLOAD_TOO_LARGE` | File exceeds size limit |
| 429 | `RATE_LIMITED` | Too many requests |
| 5xx | `INTERNAL_ERROR` | Server error |

---

## 1. Authentication & Routing

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Login page | **Working (Demo)** | Hardcoded credentials, localStorage-based |
| Role detection | **Placeholder** | Checks `localStorage.userRole` |
| Route guards | **Missing** | No protection - anyone can access any route |
| MSAL integration | **Not implemented** | Disabled "Sign in with Microsoft" button |

### Current Implementation

**Login.tsx (lines 17-27)**:
```typescript
// Hardcoded demo credentials
if (email === "sarah@neverlandcreative.com" && password === "password123") {
  localStorage.setItem("userRole", "client");
  localStorage.setItem("userEmail", email);
  navigate("/portal/overview");
} else if (email === "hamish@goagentflow.com" && password === "password123") {
  localStorage.setItem("userRole", "staff");
  localStorage.setItem("userEmail", email);
  navigate("/hubs");
}
```

### Routes (App.tsx)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Index | Redirect to login |
| `/login` | Login | Authentication |
| `/hubs` | HubList | Staff: list of pitch hubs |
| `/hub/*` | HubDetail | Staff: hub sections |
| `/portal/*` | PortalDetail | Client: portal sections |
| `*` | NotFound | 404 page |

### Required for Production

1. **MSAL Browser integration**
   - Acquire token for `api://agentflow-backend/access_as_user`
   - Store token in memory (not localStorage)
   - Handle token refresh

2. **Route guards** (`src/routes/guards.tsx`)
   - `RequireAuth` - Redirect to login if no token
   - `RequireStaff` - Block clients from staff routes
   - `RequireClient` - Block staff from client routes
   - `RequireHubAccess` - Verify user has access to specific hub

3. **API Endpoints Required**:
   - `GET /api/v1/auth/me` - Return current user profile and role
   - `GET /api/v1/hubs/:hubId/access` - Check user's access level for a hub

---

## 2. Sharing & Access

### Current State

| Feature | Status | Notes |
|---------|--------|-------|
| Invite client (Staff) | **Placeholder** | Button exists, no functionality |
| Share link (Staff) | **Placeholder** | Displays static URL |
| Domain restriction | **Placeholder** | UI validates but doesn't enforce |
| Invite colleague (Client) | **Placeholder** | Modal with form, no API call |
| Revoke access | **Placeholder** | Dropdown menu item, no functionality |
| Permission levels | **UI Only** | Full Access, Proposal Only, Documents Only |

### UI Locations

- **Staff**: ClientPortalSection.tsx - "Invite Client" button, share link display
- **Staff**: OverviewSection.tsx - "Invite Client" quick action
- **Client**: ClientPeopleSection.tsx - "Invite Someone" button, manage access
- **Client**: ClientProposalSection.tsx - Share modal with domain validation

### Required API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/hubs/:hubId/invites` | POST | Invite a guest to a hub |
| `/api/v1/hubs/:hubId/invites` | GET | List pending invites |
| `/api/v1/hubs/:hubId/invites/:id` | DELETE | Revoke invite |
| `/api/v1/hubs/:hubId/members` | GET | List members with access |
| `/api/v1/hubs/:hubId/members/:id` | PATCH | Update access level |
| `/api/v1/hubs/:hubId/members/:id` | DELETE | Remove member access |
| `/api/v1/hubs/:hubId/share-link` | POST | Generate shareable link |
| `/api/v1/invites/:token/accept` | POST | Accept invite via token |

### Domain Restriction Logic

Currently in ClientProposalSection.tsx (line 56-63):
```typescript
if (!shareEmail.endsWith("@neverlandcreative.com")) {
  toast({ title: "Invalid email", description: "You can only share with people at Neverland Creative" });
  return;
}
```

**Needs**: Server-side validation of email domain against hub's allowed domain.

---

## 3. Hub List Page

### Current State

| Feature | Status | Notes |
|---------|--------|-------|
| Display hub cards | **Placeholder** | Static mockHubs array |
| Create new hub | **Placeholder** | Button exists, no functionality |
| Click hub to view | **Working** | Uses window.location.href (should use navigate) |
| Search hubs | **Placeholder** | Input renders but doesn't filter |
| Filter by status | **Placeholder** | Dropdown renders but doesn't filter |
| User avatar/name | **Placeholder** | Shows "JD" / "John Doe" |

### Mock Data (HubList.tsx lines 15-51)

```typescript
const mockHubs = [
  { id: 1, companyName: "Client Example123", contactName: "Sarah Mitchell", status: "Active", lastActivity: "2 days ago" },
  // ... 5 total mock hubs
];
```

### Required API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/hubs` | GET | List hubs (supports `?page`, `?pageSize`, `?sort`, `?filter`, `?search`) |
| `/api/v1/hubs` | POST | Create new hub |

### Hub Object Schema (for Stephen)

```typescript
interface Hub {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  status: "Active" | "Won" | "Lost" | "Draft";
  createdAt: string;
  lastActivity: string;
  clientsInvited: number;
  lastVisit?: string;
}

interface HubListResponse {
  data: Hub[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
```

---

## 4. Staff View Sections

### 4.1 Overview (OverviewSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Hub status cards | **Placeholder** | Static hubStatus array |
| Quick actions | **Placeholder** | Buttons exist, no handlers |
| Activity feed | **Placeholder** | Static recentActivity array |
| Alerts/To-dos | **Placeholder** | Static alerts array |
| Internal notes | **Placeholder** | Static text, edit button no-op |
| Engagement stats | **Placeholder** | Static engagementStats array |
| "See what Sarah sees" | **Placeholder** | No navigation |

**API Required**:
- `GET /api/v1/hubs/:hubId` - Hub details
- `GET /api/v1/hubs/:hubId/activity` - Activity feed (supports pagination)
- `GET /api/v1/hubs/:hubId/alerts` - Action items/alerts
- `GET /api/v1/hubs/:hubId/engagement` - Engagement statistics
- `PATCH /api/v1/hubs/:hubId/notes` - Update internal notes

### 4.2 Client Portal (ClientPortalSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Portal status (draft/live) | **Working (Local)** | useState |
| Welcome headline/message | **Placeholder** | Input fields, no save |
| Hero content selection | **Working (Local)** | RadioGroup with useState |
| Section toggles | **Working (Local)** | Switch components |
| Publishing checklist | **Placeholder** | Static checklistItems |
| Invite client | **Placeholder** | Button with no handler |
| Share link | **Placeholder** | Static URL |
| Preview as client | **Placeholder** | Button with no handler |

**API Required**:
- `GET /api/v1/hubs/:hubId/portal-config` - Portal settings
- `PATCH /api/v1/hubs/:hubId/portal-config` - Update settings
- `POST /api/v1/hubs/:hubId/publish` - Publish portal

### 4.3 Proposal (ProposalSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Upload proposal | **Placeholder** | Drag-drop area, no handler |
| Document viewer | **Placeholder** | Shows placeholder icon |
| Slide navigation | **Working (Local)** | useState for currentSlide |
| Replace/Delete | **Placeholder** | Buttons exist, no handlers |
| Client access toggle | **Placeholder** | Switch, no persistence |
| Download enabled toggle | **Placeholder** | Checkbox, no persistence |
| Engagement stats | **Placeholder** | Static data |
| Slide engagement | **Placeholder** | Static data |
| Version history | **Placeholder** | Static versions |

**API Required**:
- `GET /api/v1/hubs/:hubId/proposal` - Proposal metadata + presigned URL
- `POST /api/v1/hubs/:hubId/proposal` - Upload new proposal (chunked/resumable)
- `DELETE /api/v1/hubs/:hubId/proposal` - Delete proposal
- `GET /api/v1/hubs/:hubId/proposal/engagement` - View analytics
- `PATCH /api/v1/hubs/:hubId/proposal/settings` - Visibility/download settings

### 4.4 Videos (VideosSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Video grid/list | **Placeholder** | Static mockVideos array |
| Record video | **Placeholder** | Modal opens, no recording |
| Upload video | **Placeholder** | Drag-drop, no handler |
| Add link | **Placeholder** | Input, no validation |
| Edit video details | **Working (Local)** | Modal with form fields |
| Visibility toggle | **Placeholder** | Switch, no persistence |
| Bulk actions | **Placeholder** | Bar appears, actions no-op |
| View counts | **Placeholder** | Static data |

**API Required**:
- `GET /api/v1/hubs/:hubId/videos` - List videos (supports pagination)
- `POST /api/v1/hubs/:hubId/videos` - Upload video (chunked/resumable)
- `POST /api/v1/hubs/:hubId/videos/link` - Add external video link
- `PATCH /api/v1/hubs/:hubId/videos/:id` - Update video metadata
- `DELETE /api/v1/hubs/:hubId/videos/:id` - Delete video
- `GET /api/v1/hubs/:hubId/videos/:id/engagement` - View analytics

### 4.5 Documents (DocumentsSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Client/Internal tabs | **Working (Local)** | useState activeTab |
| Document table | **Placeholder** | Static clientDocuments/internalDocuments |
| Upload document | **Placeholder** | Modal, no handler |
| Category filters | **Placeholder** | Buttons render, filter doesn't work |
| Search | **Placeholder** | Input renders, no filtering |
| Document detail panel | **Placeholder** | Sheet opens with static data |
| Version history | **Placeholder** | Static versions |
| Move between tabs | **Placeholder** | Menu item, no handler |
| Bulk actions | **Placeholder** | Bar appears, actions no-op |

**API Required**:
- `GET /api/v1/hubs/:hubId/documents` - List documents (supports `?visibility=client|internal`, pagination)
- `POST /api/v1/hubs/:hubId/documents` - Upload document (chunked/resumable)
- `PATCH /api/v1/hubs/:hubId/documents/:id` - Update metadata/visibility
- `DELETE /api/v1/hubs/:hubId/documents/:id` - Delete document
- `GET /api/v1/hubs/:hubId/documents/:id/engagement` - View analytics

### 4.6 Messages (MessagesSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Thread list | **Placeholder** | Static threads array |
| Thread view | **Working (Local)** | selectedThread state |
| Compose message | **Placeholder** | Modal, no send handler |
| Reply to thread | **Placeholder** | Textarea, no send handler |
| Attachments | **Placeholder** | Button exists, no handler |
| Team notes | **Placeholder** | Textarea toggle, no persistence |
| Search | **Placeholder** | Input renders, no filtering |
| Archive | **Placeholder** | Button exists, no handler |

#### Hub-to-Email Scoping Model

Messages are scoped to a hub using **email category labels**. The middleware:
1. Adds a category label `AgentFlow-Hub:{hubId}` to all emails sent via the hub
2. Filters inbox/sent by this category when fetching threads
3. This allows per-hub message isolation without separate mailboxes

**API Required**:
- `GET /api/v1/hubs/:hubId/messages` - List email threads (via OBO to Graph, filtered by category)
- `POST /api/v1/hubs/:hubId/messages` - Send message (via OBO to Graph, applies category)
- `GET /api/v1/hubs/:hubId/messages/:threadId` - Get thread messages
- `PATCH /api/v1/hubs/:hubId/messages/:threadId/notes` - Update team notes (stored in backend, not Graph)

### 4.7 Meetings (MeetingsSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Upcoming/Past tabs | **Working (Local)** | Tabs component |
| Meeting cards | **Placeholder** | Static inline data |
| Schedule meeting | **Placeholder** | Modal, no handler |
| Join meeting | **Placeholder** | Button, no handler |
| Agenda edit | **Placeholder** | Modal, no persistence |
| Recording | **Placeholder** | Placeholder video area |
| Transcript | **Placeholder** | Static text |
| AI summary | **Placeholder** | Static summary |
| Meeting notes | **Placeholder** | Textarea, no persistence |

#### Licensing Caveat

> **Note**: Meeting recordings and transcripts require **Teams Premium** licensing. The middleware should:
> - Check if recording/transcript is available before returning URLs
> - Return `null` gracefully if unavailable
> - UI should show "Recording not available" rather than error

**API Required**:
- `GET /api/v1/hubs/:hubId/meetings` - List meetings (via OBO to Graph Calendar, supports pagination)
- `POST /api/v1/hubs/:hubId/meetings` - Schedule meeting (via OBO)
- `PATCH /api/v1/hubs/:hubId/meetings/:id/agenda` - Update agenda
- `PATCH /api/v1/hubs/:hubId/meetings/:id/notes` - Update team notes
- `GET /api/v1/hubs/:hubId/meetings/:id/recording` - Get recording URL (best effort, may return null)
- `GET /api/v1/hubs/:hubId/meetings/:id/transcript` - Get transcript (best effort, may return null)

### 4.8 Questionnaire (QuestionnaireSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Questionnaire list | **Placeholder** | Static questionnaires array |
| Add questionnaire | **Placeholder** | Modal, form fields |
| View responses | **Placeholder** | Chart visualizations |
| Individual responses | **Placeholder** | Static table |
| Share questionnaire | **Placeholder** | Copy link, email send |
| QR code | **Placeholder** | Icon placeholder |

#### Microsoft Forms API Limitations

> **Note**: Microsoft Forms API has limited response retrieval capabilities. For v0.1:
> - Link questionnaire by URL
> - Track completion status (completed/not completed per user)
> - Detailed response analytics are **optional/best-effort**
> - Consider embedding the form directly rather than pulling data

**API Required**:
- `GET /api/v1/hubs/:hubId/questionnaires` - List linked questionnaires
- `POST /api/v1/hubs/:hubId/questionnaires` - Link Microsoft Forms questionnaire
- `GET /api/v1/hubs/:hubId/questionnaires/:id` - Get questionnaire details + completion status
- `GET /api/v1/hubs/:hubId/questionnaires/:id/responses` - Fetch responses (**optional**, via Graph, may be limited)
- `DELETE /api/v1/hubs/:hubId/questionnaires/:id` - Unlink questionnaire

---

## 5. Client View Sections

**Important**: All client portal endpoints are hub-scoped to avoid ambiguity when a user has access to multiple hubs.

### 5.1 Client Overview (ClientOverviewSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Welcome modal | **Working (Local)** | useState showWelcomeModal |
| Welcome message | **Placeholder** | Static text "Welcome, Sarah" |
| Hero content | **Placeholder** | Static heroContent state |
| Quick links grid | **Placeholder** | Static quickLinks array |
| Recent activity | **Placeholder** | Static recentActivity array |
| "Getting Started" CTA | **Working** | Opens modal |

**API Required**:
- `GET /api/v1/hubs/:hubId/portal/config` - Portal welcome config
- `GET /api/v1/hubs/:hubId/portal/activity` - Recent activity feed

### 5.2 Client Proposal (ClientProposalSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| Slide viewer | **Placeholder** | Shows slide number only |
| Navigation | **Working (Local)** | currentSlide state |
| Thumbnail strip | **Working (Local)** | Clickable slide indicators |
| Download PDF | **Placeholder** | Shows toast, no download |
| Share with colleague | **Placeholder** | Modal with domain validation |
| Comment on slide | **Placeholder** | Form, shows confirmation |
| Sidebar info | **Placeholder** | Static data |

**API Required**:
- `GET /api/v1/hubs/:hubId/portal/proposal` - Get proposal for viewing
- `POST /api/v1/hubs/:hubId/portal/proposal/comment` - Submit comment (creates message thread with SlideRef)
- `POST /api/v1/hubs/:hubId/portal/share` - Share with colleague (domain-restricted)

### 5.3 Client Videos

**API Required**:
- `GET /api/v1/hubs/:hubId/portal/videos` - List visible videos

### 5.4 Client Documents

**API Required**:
- `GET /api/v1/hubs/:hubId/portal/documents` - List visible documents

### 5.5 Client Messages

**API Required**:
- `GET /api/v1/hubs/:hubId/portal/messages` - List messages
- `POST /api/v1/hubs/:hubId/portal/messages` - Send message

### 5.6 Client Meetings

**API Required**:
- `GET /api/v1/hubs/:hubId/portal/meetings` - List upcoming meetings

### 5.7 Client Questionnaire

**API Required**:
- `GET /api/v1/hubs/:hubId/portal/questionnaires` - List questionnaires to complete

### 5.8 Client People (ClientPeopleSection.tsx)

| Feature | Status | Data Source |
|---------|--------|-------------|
| People list | **Placeholder** | Static mockPeople array |
| Invite someone | **Placeholder** | Modal with form |
| Manage access | **Placeholder** | Modal with dropdown |
| Resend invite | **Placeholder** | Button, no handler |
| Remove access | **Placeholder** | Button, no handler |
| Recent activity | **Placeholder** | Static recentActivity |

**API Required**:
- `GET /api/v1/hubs/:hubId/portal/members` - List hub members
- `POST /api/v1/hubs/:hubId/portal/invite` - Invite colleague (domain-restricted)
- `PATCH /api/v1/hubs/:hubId/portal/members/:id` - Update access level
- `DELETE /api/v1/hubs/:hubId/portal/members/:id` - Remove access

---

## 6. Shared Components

### HubLayout.tsx

| Feature | Status | Notes |
|---------|--------|-------|
| Header | **Working** | AgentFlow logo, hub name, view badge |
| User avatar | **Working** | Shows initials from email |
| Sign out | **Working** | Clears localStorage, redirects |
| Sidebar | **Working** | Uses HubSidebar component |
| Footer | **Working** | Static copyright |

### ClientHubLayout.tsx

| Feature | Status | Notes |
|---------|--------|-------|
| Header | **Working** | Same as HubLayout |
| Sidebar | **Working** | 8 nav items with badges |
| Navigation | **Working** | NavLink component |
| Footer | **Working** | "Send a Message" link |

### HubSidebar.tsx

| Feature | Status | Notes |
|---------|--------|-------|
| 8 nav items | **Working** | Overview through Questionnaire |
| Active state | **Working** | Visual highlight on current route |
| Collapsible | **Working** | Icon-only mode |

### Navigation Issues

- HubList uses `window.location.href` instead of React Router's `navigate()` - causes full page reload
- Some buttons use `window.location.href` instead of proper navigation

---

## 7. Engagement Tracking

### Event Type Enum

All events use a strict enum type to prevent typos and enable reliable analytics:

```typescript
enum EventType {
  HUB_VIEWED = "hub.viewed",
  PROPOSAL_VIEWED = "proposal.viewed",
  PROPOSAL_SLIDE_TIME = "proposal.slide_time",
  VIDEO_WATCHED = "video.watched",
  VIDEO_COMPLETED = "video.completed",
  DOCUMENT_VIEWED = "document.viewed",
  DOCUMENT_DOWNLOADED = "document.downloaded",
  MEETING_JOINED = "meeting.joined",
  MESSAGE_SENT = "message.sent",
  MESSAGE_READ = "message.read",
  QUESTIONNAIRE_STARTED = "questionnaire.started",
  QUESTIONNAIRE_COMPLETED = "questionnaire.completed",
  SHARE_SENT = "share.sent",
  SHARE_ACCEPTED = "share.accepted",
}
```

### Events to Track

| Event | Location | Metadata |
|-------|----------|----------|
| `hub.viewed` | Hub sections | `{ section: string }` |
| `proposal.viewed` | ProposalSection | `{ slideNum: number }` |
| `proposal.slide_time` | ProposalSection | `{ slideNum: number, seconds: number }` |
| `video.watched` | VideosSection | `{ videoId: string, watchTime: number, percentComplete: number }` |
| `video.completed` | VideosSection | `{ videoId: string }` |
| `document.viewed` | DocumentsSection | `{ documentId: string }` |
| `document.downloaded` | DocumentsSection | `{ documentId: string }` |
| `meeting.joined` | MeetingsSection | `{ meetingId: string }` |
| `message.sent` | MessagesSection | `{ threadId: string }` |
| `questionnaire.completed` | QuestionnaireSection | `{ questionnaireId: string }` |
| `share.sent` | Various | `{ recipientEmail: string, resourceType: string }` |

### Event Schema

```typescript
interface ActivityEvent {
  eventType: EventType;  // Enum, not free-text string
  hubId: string;
  userId: string;
  timestamp: string;     // ISO 8601
  metadata: Record<string, any>;
}
```

**API Required**:
- `POST /api/v1/hubs/:hubId/events` - Log engagement event (hub-scoped)

---

## 8. Summary: What Works vs What Needs Implementation

### Working (Local State Only)
- Login form submission (demo credentials)
- Sign out
- Navigation between sections
- Tab switching
- Modal open/close
- Local form state
- Slide navigation
- View mode toggles

### Placeholder (UI Exists, No Backend)
- All data displays (using static mock data)
- All "Save", "Create", "Upload" buttons
- Search and filter inputs
- Share/invite flows
- Engagement statistics
- Activity feeds
- Version history
- Bulk actions

### Missing
- MSAL authentication
- Route guards
- Real API calls
- File upload handlers
- Real-time updates (polling)
- Error handling
- Loading states
- TypeScript interfaces for API data

---

## 9. Next Steps

**Phase 2 will create**:
1. `src/types/*.ts` - TypeScript interfaces for all data (including EventType enum)
2. `src/services/*.ts` - API service layer with mock implementations
3. `src/hooks/*.ts` - React Query hooks for data fetching
4. `src/routes/guards.tsx` - Protected route components

Once Phase 2 is complete, Stephen will have a complete API contract to build the middleware.
