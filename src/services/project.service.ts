/**
 * Project service
 *
 * CRUD operations for projects within client hubs.
 * Includes milestone management and project-filtered artifact queries.
 */

import type {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  ProjectMilestone,
  PaginatedList,
  PaginationParams,
  ProjectFilterParams,
} from "@/types";
import { api, isMockApiEnabled, simulateDelay } from "./api";
import { mockProjects } from "./mock-data-client-hub";

/**
 * Get projects for a hub
 */
export async function getProjects(
  hubId: string,
  params?: PaginationParams & ProjectFilterParams
): Promise<PaginatedList<Project>> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    let filtered = mockProjects.filter((p) => p.hubId === hubId);

    // Apply status filter
    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    return {
      items: filtered,
      pagination: {
        page,
        pageSize,
        totalItems: filtered.length,
        totalPages: Math.ceil(filtered.length / pageSize),
      },
    };
  }

  const queryParams: Record<string, string> = {};
  if (params?.page) queryParams.page = String(params.page);
  if (params?.pageSize) queryParams.pageSize = String(params.pageSize);
  if (params?.status) queryParams.status = params.status;

  return api.get<PaginatedList<Project>>(`/hubs/${hubId}/projects`, queryParams);
}

/**
 * Get single project by ID
 */
export async function getProject(hubId: string, projectId: string): Promise<Project> {
  if (isMockApiEnabled()) {
    await simulateDelay(200);
    const project = mockProjects.find((p) => p.id === projectId && p.hubId === hubId);
    if (!project) throw new Error("Project not found");
    return project;
  }

  return api.get<Project>(`/hubs/${hubId}/projects/${projectId}`);
}

/**
 * Create a new project
 */
export async function createProject(
  hubId: string,
  data: CreateProjectRequest
): Promise<Project> {
  if (isMockApiEnabled()) {
    await simulateDelay(500);

    const newProject: Project = {
      id: `project-${Date.now()}`,
      hubId,
      name: data.name,
      description: data.description || null,
      status: data.status || "active",
      startDate: data.startDate || new Date().toISOString(),
      targetEndDate: data.targetEndDate || null,
      lead: data.lead || null,
      leadName: data.lead ? "Hamish Nicklin" : null, // Mock name lookup
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockProjects.push(newProject);
    return newProject;
  }

  return api.post<Project>(`/hubs/${hubId}/projects`, data);
}

/**
 * Update project
 */
export async function updateProject(
  hubId: string,
  projectId: string,
  data: UpdateProjectRequest
): Promise<Project> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const index = mockProjects.findIndex((p) => p.id === projectId && p.hubId === hubId);
    if (index === -1) throw new Error("Project not found");

    mockProjects[index] = {
      ...mockProjects[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return mockProjects[index];
  }

  return api.patch<Project>(`/hubs/${hubId}/projects/${projectId}`, data);
}

/**
 * Delete project (soft delete - marks as cancelled)
 */
export async function deleteProject(hubId: string, projectId: string): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const index = mockProjects.findIndex((p) => p.id === projectId && p.hubId === hubId);
    if (index !== -1) {
      mockProjects[index].status = "cancelled";
      mockProjects[index].updatedAt = new Date().toISOString();
    }
    return;
  }

  return api.delete(`/hubs/${hubId}/projects/${projectId}`);
}

/**
 * Create milestone for a project
 */
export async function createMilestone(
  hubId: string,
  projectId: string,
  data: CreateMilestoneRequest
): Promise<ProjectMilestone> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const project = mockProjects.find((p) => p.id === projectId && p.hubId === hubId);
    if (!project) throw new Error("Project not found");

    const newMilestone: ProjectMilestone = {
      id: `ms-${Date.now()}`,
      name: data.name,
      targetDate: data.targetDate,
      status: data.status || "not_started",
      description: data.description || null,
    };

    project.milestones.push(newMilestone);
    project.updatedAt = new Date().toISOString();

    return newMilestone;
  }

  return api.post<ProjectMilestone>(
    `/hubs/${hubId}/projects/${projectId}/milestones`,
    data
  );
}

/**
 * Update milestone
 */
export async function updateMilestone(
  hubId: string,
  projectId: string,
  milestoneId: string,
  data: UpdateMilestoneRequest
): Promise<ProjectMilestone> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const project = mockProjects.find((p) => p.id === projectId && p.hubId === hubId);
    if (!project) throw new Error("Project not found");

    const msIndex = project.milestones.findIndex((m) => m.id === milestoneId);
    if (msIndex === -1) throw new Error("Milestone not found");

    project.milestones[msIndex] = {
      ...project.milestones[msIndex],
      ...data,
    };
    project.updatedAt = new Date().toISOString();

    return project.milestones[msIndex];
  }

  return api.patch<ProjectMilestone>(
    `/hubs/${hubId}/projects/${projectId}/milestones/${milestoneId}`,
    data
  );
}

/**
 * Delete milestone
 */
export async function deleteMilestone(
  hubId: string,
  projectId: string,
  milestoneId: string
): Promise<void> {
  if (isMockApiEnabled()) {
    await simulateDelay(300);

    const project = mockProjects.find((p) => p.id === projectId && p.hubId === hubId);
    if (!project) throw new Error("Project not found");

    const msIndex = project.milestones.findIndex((m) => m.id === milestoneId);
    if (msIndex !== -1) {
      project.milestones.splice(msIndex, 1);
      project.updatedAt = new Date().toISOString();
    }
    return;
  }

  return api.delete(`/hubs/${hubId}/projects/${projectId}/milestones/${milestoneId}`);
}
