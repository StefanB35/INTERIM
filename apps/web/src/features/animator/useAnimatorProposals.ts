import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ApiListSchema, AnimatorProposalSchema } from '../../lib/schemas';
import { queryKeys } from '../queryKeys';

export function useAnimatorProposals() { return useQuery({ queryKey: queryKeys.animatorProposals, queryFn: () => api.get('/animator/proposals', ApiListSchema(AnimatorProposalSchema)) }); }
