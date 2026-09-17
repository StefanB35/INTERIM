import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { MatchRunSchema } from '../../lib/schemas';
import { queryKeys } from '../queryKeys';

export function useMatchRun(id: string) { return useQuery({ queryKey: queryKeys.matchRun(id), queryFn: () => api.get(`/match-runs/${id}`, MatchRunSchema), enabled: Boolean(id) }); }
