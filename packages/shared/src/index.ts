import { z } from 'zod';

/** pending：已送信、尚未决定；contracted：解开红线、契约成立；abandoned：放弃了 */
export const GRUDGE_STATUSES = ['pending', 'contracted', 'abandoned'] as const;

export type GrudgeStatus = (typeof GRUDGE_STATUSES)[number];

export const TARGET_NAME_MAX_LENGTH = 32;

export const createGrudgeSchema = z.object({
  targetName: z.string().trim().min(1).max(TARGET_NAME_MAX_LENGTH),
});

export type CreateGrudgeInput = z.infer<typeof createGrudgeSchema>;

export interface Grudge {
  id: string;
  targetName: string;
  status: GrudgeStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ApiErrorBody {
  error: 'not_found' | 'already_resolved' | 'invalid_input';
}
