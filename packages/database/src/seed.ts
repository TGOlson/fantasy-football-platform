import dotenv from 'dotenv';
import { getDatabase, users, leagues, teams, scoringRules } from './index.js';

// Load environment variables
dotenv.config({ path: '../../.env' });

async function seed() {
  console.log('🌱 Seeding database...');

  const db = getDatabase();

  try {
    // Create sample users
    const [user1, user2] = await db
      .insert(users)
      .values([
        {
          email: 'alice@example.com',
          passwordHash: 'hashed_password_here', // Will use bcrypt in Milestone 3
          name: 'Alice Johnson',
        },
        {
          email: 'bob@example.com',
          passwordHash: 'hashed_password_here',
          name: 'Bob Smith',
        },
      ])
      .returning();

    console.log('✓ Created users:', user1.name, user2.name);

    // Create sample league
    const [league] = await db
      .insert(leagues)
      .values({
        name: 'Test League 2024',
        season: 2024,
      })
      .returning();

    console.log('✓ Created league:', league.name);

    // Create scoring rules for the league
    await db.insert(scoringRules).values({
      leagueId: league.id,
      rules: {
        passing: {
          yards: { value: 0.04, per: 1 },
          touchdowns: { value: 4 },
          interceptions: -2,
        },
        rushing: {
          yards: 0.1,
          touchdowns: 6,
          bonuses: [
            { condition: 'yards >= 100', value: 3 },
          ],
        },
        receiving: {
          receptions: {
            default: 1.0,
            byPosition: {
              TE: 1.5,
              RB: 0.5,
            },
          },
          yards: 0.1,
          touchdowns: 6,
        },
      },
    });

    console.log('✓ Created scoring rules (TE Premium)');

    // Create teams in the league
    const [team1, team2] = await db
      .insert(teams)
      .values([
        {
          name: "Alice's All-Stars",
          leagueId: league.id,
          ownerId: user1.id,
        },
        {
          name: "Bob's Ballers",
          leagueId: league.id,
          ownerId: user2.id,
        },
      ])
      .returning();

    console.log('✓ Created teams:', team1.name, team2.name);

    console.log('✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
