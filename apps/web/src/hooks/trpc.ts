import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../api/src/trpc/router';

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();
