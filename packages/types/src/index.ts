// Shared types across frontend and backend

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface League {
  id: string;
  name: string;
  season: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  leagueId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

// More types will be added as we build features
