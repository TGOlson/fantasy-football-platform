import { Router } from 'express';
import { getDatabase, users, leagues } from '@fantasy-platform/database';

const router = Router();

// Test database connection
router.get('/db', async (req, res) => {
  try {
    const db = getDatabase();

    // Try to fetch users
    const allUsers = await db.select().from(users);
    const allLeagues = await db.select().from(leagues);

    res.json({
      status: 'ok',
      message: 'Database connection successful',
      data: {
        users: allUsers.length,
        leagues: allLeagues.length,
      },
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
