import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ApiListSchema, MissionSchema } from '../../lib/schemas';
import { queryKeys } from '../queryKeys';

export function useMissions() { return useQuery({ queryKey: queryKeys.missions, queryFn: () => api.get('/missions', ApiListSchema(MissionSchema)) }); }
export function useCreateMission() { const client = useQueryClient(); return useMutation({ mutationFn: (payload: Partial<ReturnType<typeof MissionSchema.parse>>) => api.post('/missions', payload, MissionSchema), onSuccess: () => { void client.invalidateQueries({ queryKey: queryKeys.missions }); } }); }
