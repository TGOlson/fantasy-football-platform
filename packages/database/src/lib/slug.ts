import { leagues, eq } from '../index';
import type { DBClient } from '../index';

/**
 * Convert a string to a URL-friendly slug
 * "The Championship League" → "the-championship-league"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug for a league name
 * If slug exists, appends a number: "the-championship-league-2"
 */
export async function generateUniqueSlug(
  db: DBClient,
  leagueName: string
): Promise<string> {
  const baseSlug = slugify(leagueName);

  // Check if base slug is available
  const [existingLeague] = await db
    .select()
    .from(leagues)
    .where(eq(leagues.slug, baseSlug))
    .limit(1);

  if (!existingLeague) {
    return baseSlug;
  }

  // Base slug taken, try with numeric suffix
  let counter = 2;
  while (true) {
    const candidateSlug = `${baseSlug}-${counter}`;

    const [existing] = await db
      .select()
      .from(leagues)
      .where(eq(leagues.slug, candidateSlug))
      .limit(1);

    if (!existing) {
      return candidateSlug;
    }

    counter++;

    // Safety valve to prevent infinite loops
    if (counter > 1000) {
      throw new Error('Unable to generate unique slug after 1000 attempts');
    }
  }
}
