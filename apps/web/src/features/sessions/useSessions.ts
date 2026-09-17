import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ApiListSchema, CareSessionSchema } from '../../lib/schemas';
import { queryKeys } from '../queryKeys';

export function useSessions() { return useQuery({ queryKey: queryKeys.sessions, queryFn: () => api.get('/sessions', ApiListSchema(CareSessionSchema)) }); }
