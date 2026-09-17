import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AnimatorProfileSchema, ApiListSchema, AvailabilitySchema, TensionIndicatorSchema } from '../../lib/schemas';

export const animatorKeys = { profile: ['animator', 'profile'] as const, availability: ['animator', 'availability'] as const, tension: ['tension-indicators'] as const, tensionCommunes: ['tension-indicators', 'communes'] as const };
export function useAnimatorProfile() { return useQuery({ queryKey: animatorKeys.profile, queryFn: () => api.get('/animators/profile', AnimatorProfileSchema) }); }
export function useAnimatorAvailability() { return useQuery({ queryKey: animatorKeys.availability, queryFn: () => api.get('/animators/availability', ApiListSchema(AvailabilitySchema)) }); }
export function useAnimatorTension() { return useQuery({ queryKey: animatorKeys.tension, queryFn: () => api.get('/tension-indicators', ApiListSchema(TensionIndicatorSchema)) }); }
export function useAnimatorTensionCommunes() { return useQuery({ queryKey: animatorKeys.tensionCommunes, queryFn: () => api.get('/tension-indicators/communes', ApiListSchema(TensionIndicatorSchema)) }); }
export function useAcceptAnimatorProposal() { return useMutation({ mutationFn: (id: string) => api.post(`/animator/proposals/${id}/accept`, {}, undefined) }); }
export function usePassAnimatorProposal() { return useMutation({ mutationFn: (id: string) => api.post(`/animator/proposals/${id}/pass`, {}, undefined) }); }
