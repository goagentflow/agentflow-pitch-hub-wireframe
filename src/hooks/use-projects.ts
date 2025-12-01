/**
 * Project hooks
 *
 * React Query hooks for project and milestone operations.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/services";
import { serializeParams } from "@/lib/query-keys";

// Query keys
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (hubId: string, params?: PaginationParams & ProjectFilterParams) =>
    [...projectKeys.lists(), hubId, serializeParams(params)] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (hubId: string, projectId: string) =>
    [...projectKeys.details(), hubId, projectId] as const,
};

/**
 * Hook to get projects for a hub
 */
export function useProjects(hubId: string, params?: PaginationParams & ProjectFilterParams) {
  return useQuery<PaginatedList<Project>>({
    queryKey: projectKeys.list(hubId, params),
    queryFn: () => getProjects(hubId, params),
    enabled: !!hubId,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook to get single project
 */
export function useProject(hubId: string, projectId: string) {
  return useQuery<Project>({
    queryKey: projectKeys.detail(hubId, projectId),
    queryFn: () => getProject(hubId, projectId),
    enabled: !!hubId && !!projectId,
  });
}

/**
 * Hook to create a project
 */
export function useCreateProject(hubId: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, CreateProjectRequest>({
    mutationFn: (data) => createProject(hubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject(hubId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, UpdateProjectRequest>({
    mutationFn: (data) => updateProject(hubId, projectId, data),
    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(hubId, projectId), project);
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to delete a project (soft delete)
 */
export function useDeleteProject(hubId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => deleteProject(hubId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.removeQueries({ queryKey: projectKeys.detail(hubId, projectId) });
    },
  });
}

/**
 * Hook to create a milestone
 */
export function useCreateMilestone(hubId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectMilestone, Error, CreateMilestoneRequest>({
    mutationFn: (data) => createMilestone(hubId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(hubId, projectId) });
    },
  });
}

/**
 * Hook to update a milestone
 */
export function useUpdateMilestone(hubId: string, projectId: string, milestoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectMilestone, Error, UpdateMilestoneRequest>({
    mutationFn: (data) => updateMilestone(hubId, projectId, milestoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(hubId, projectId) });
    },
  });
}

/**
 * Hook to delete a milestone
 */
export function useDeleteMilestone(hubId: string, projectId: string, milestoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: () => deleteMilestone(hubId, projectId, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(hubId, projectId) });
    },
  });
}
