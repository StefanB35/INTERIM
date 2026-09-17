import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ApiListSchema, CareSessionSchema, ContractSchema, EmployerProfileSchema, MatchRunSchema, MissionSchema, SchoolSchema } from '../../lib/schemas';
import { queryKeys } from '../queryKeys';

export const employerKeys = { school: (id: string) => ['schools', id] as const, contracts: ['contracts'] as const };
export function useEmployerSessions() { return useQuery({ queryKey: queryKeys.sessions, queryFn: () => api.get('/sessions', ApiListSchema(CareSessionSchema)) }); }
export function useEmployerProfile() { return useQuery({ queryKey: ['employer', 'profile'], queryFn: () => api.get('/employer/profile', EmployerProfileSchema) }); }
export function useEmployerMissions() { return useQuery({ queryKey: queryKeys.missions, queryFn: () => api.get('/missions', ApiListSchema(MissionSchema)) }); }
export function useEmployerSchool(id: string) { return useQuery({ queryKey: employerKeys.school(id), queryFn: async () => { const result = await api.get('/schools', ApiListSchema(SchoolSchema)); return result.data.find((school) => school.id === id) ?? null; }, enabled: Boolean(id) }); }
export function useEmployerMatchRun(id: string) { return useQuery({ queryKey: queryKeys.matchRun(id), queryFn: () => api.get(`/match-runs/${id}`, MatchRunSchema), enabled: Boolean(id) }); }
export function useEmployerContracts() { return useQuery({ queryKey: employerKeys.contracts, queryFn: () => api.get('/contracts', ApiListSchema(ContractSchema)) }); }
export function useRemoveAnimator() { return useMutation({ mutationFn: (sessionId: string) => api.post(`/sessions/${sessionId}/remove-animator`, {}, undefined) }); }
export function useAcceptCandidate() { return useMutation({ mutationFn: ({ missionId, candidateId }: { missionId: string; candidateId: string }) => api.post(`/missions/${missionId}/accept`, { candidateId }, undefined) }); }
