import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type Franchise = {
  __typename?: 'Franchise';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  league: League;
  teams: Array<Team>;
};

export type League = {
  __typename?: 'League';
  createdAt: Scalars['DateTime']['output'];
  currentSeason?: Maybe<LeagueSeason>;
  franchises: Array<Franchise>;
  id: Scalars['ID']['output'];
  matchup?: Maybe<Matchup>;
  myTeam?: Maybe<Team>;
  name: Scalars['String']['output'];
  season?: Maybe<LeagueSeason>;
  seasons: Array<LeagueSeason>;
  slug: Scalars['String']['output'];
  team?: Maybe<Team>;
  weeklyLineups: Array<WeeklyLineup>;
};


export type LeagueMatchupArgs = {
  teamId: Scalars['ID']['input'];
  weekNumber: Scalars['Int']['input'];
};


export type LeagueSeasonArgs = {
  year: Scalars['Int']['input'];
};


export type LeagueTeamArgs = {
  teamId: Scalars['ID']['input'];
};


export type LeagueWeeklyLineupsArgs = {
  teamId: Scalars['ID']['input'];
  weekNumber: Scalars['Int']['input'];
};

export type LeagueSeason = {
  __typename?: 'LeagueSeason';
  commissioner: User;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  league: League;
  status: SeasonStatus;
  teams: Array<Team>;
  year: Scalars['Int']['output'];
};

export type Matchup = {
  __typename?: 'Matchup';
  awayScore: Scalars['Float']['output'];
  awayTeam?: Maybe<Team>;
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  homeScore: Scalars['Float']['output'];
  homeTeam: Team;
  id: Scalars['ID']['output'];
  isPlayoff: Scalars['Boolean']['output'];
  weekNumber: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  login: AuthPayload;
  register: AuthPayload;
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type NflSeason = {
  __typename?: 'NFLSeason';
  currentWeek: Scalars['Int']['output'];
  year: Scalars['Int']['output'];
};

export type Player = {
  __typename?: 'Player';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  nflId: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  league?: Maybe<League>;
  me: User;
  myLeagues: Array<League>;
  nflSeason: NflSeason;
};


export type QueryLeagueArgs = {
  slug: Scalars['String']['input'];
};

export enum SeasonStatus {
  Active = 'ACTIVE',
  Archived = 'ARCHIVED',
  Completed = 'COMPLETED',
  Setup = 'SETUP'
}

export type Team = {
  __typename?: 'Team';
  createdAt: Scalars['DateTime']['output'];
  franchise: Franchise;
  id: Scalars['ID']['output'];
  leagueSeason: LeagueSeason;
  losses: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  owner: User;
  pointsAgainst: Scalars['Float']['output'];
  pointsFor: Scalars['Float']['output'];
  ties: Scalars['Int']['output'];
  wins: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isSiteAdmin: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type WeeklyLineup = {
  __typename?: 'WeeklyLineup';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  player: Player;
  pointsScored: Scalars['Float']['output'];
  rosterSlotIndex: Scalars['Int']['output'];
  team: Team;
  weekNumber: Scalars['Int']['output'];
};

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, name: string, isSiteAdmin: boolean } } };

export type RegisterMutationVariables = Exact<{
  name: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthPayload', token: string, user: { __typename?: 'User', id: string, email: string, name: string, isSiteAdmin: boolean } } };

export type MyLeaguesQueryVariables = Exact<{ [key: string]: never; }>;


export type MyLeaguesQuery = { __typename?: 'Query', myLeagues: Array<{ __typename?: 'League', id: string, name: string, slug: string, createdAt: string, currentSeason?: { __typename?: 'LeagueSeason', id: string, year: number, status: SeasonStatus } | null }> };

export type LeaguePageQueryVariables = Exact<{
  slug: Scalars['String']['input'];
  year: Scalars['Int']['input'];
}>;


export type LeaguePageQuery = { __typename?: 'Query', league?: { __typename?: 'League', id: string, name: string, slug: string, season?: { __typename?: 'LeagueSeason', id: string, year: number, status: SeasonStatus, teams: Array<{ __typename?: 'Team', id: string, name: string, wins: number, losses: number, ties: number, pointsFor: number, pointsAgainst: number, owner: { __typename?: 'User', id: string, name: string, email: string } }> } | null } | null };

export type MyTeamInLeagueQueryVariables = Exact<{
  leagueSlug: Scalars['String']['input'];
}>;


export type MyTeamInLeagueQuery = { __typename?: 'Query', league?: { __typename?: 'League', id: string, myTeam?: { __typename?: 'Team', id: string } | null } | null };

export type NflSeasonQueryVariables = Exact<{ [key: string]: never; }>;


export type NflSeasonQuery = { __typename?: 'Query', nflSeason: { __typename?: 'NFLSeason', year: number, currentWeek: number } };

export type TeamQueryVariables = Exact<{
  leagueSlug: Scalars['String']['input'];
  teamId: Scalars['ID']['input'];
}>;


export type TeamQuery = { __typename?: 'Query', league?: { __typename?: 'League', id: string, team?: { __typename?: 'Team', id: string, name: string, wins: number, losses: number, ties: number, pointsFor: number, pointsAgainst: number, owner: { __typename?: 'User', id: string, name: string, email: string } } | null } | null };

export type TeamWeekQueryVariables = Exact<{
  leagueSlug: Scalars['String']['input'];
  teamId: Scalars['ID']['input'];
  weekNumber: Scalars['Int']['input'];
}>;


export type TeamWeekQuery = { __typename?: 'Query', league?: { __typename?: 'League', id: string, matchup?: { __typename?: 'Matchup', id: string, weekNumber: number, homeScore: number, awayScore: number, completedAt?: string | null, homeTeam: { __typename?: 'Team', id: string, name: string }, awayTeam?: { __typename?: 'Team', id: string, name: string } | null } | null, weeklyLineups: Array<{ __typename?: 'WeeklyLineup', id: string, rosterSlotIndex: number, pointsScored: number, player: { __typename?: 'Player', id: string, name: string } }> } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, email: string, name: string, isSiteAdmin: boolean, createdAt: string } };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isSiteAdmin"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isSiteAdmin"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const MyLeaguesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyLeagues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myLeagues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"currentSeason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<MyLeaguesQuery, MyLeaguesQueryVariables>;
export const LeaguePageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LeaguePage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"year"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"league"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"season"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"year"},"value":{"kind":"Variable","name":{"kind":"Name","value":"year"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teams"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"wins"}},{"kind":"Field","name":{"kind":"Name","value":"losses"}},{"kind":"Field","name":{"kind":"Name","value":"ties"}},{"kind":"Field","name":{"kind":"Name","value":"pointsFor"}},{"kind":"Field","name":{"kind":"Name","value":"pointsAgainst"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<LeaguePageQuery, LeaguePageQueryVariables>;
export const MyTeamInLeagueDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyTeamInLeague"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leagueSlug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"league"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leagueSlug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"myTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<MyTeamInLeagueQuery, MyTeamInLeagueQueryVariables>;
export const NflSeasonDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NFLSeason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nflSeason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"year"}},{"kind":"Field","name":{"kind":"Name","value":"currentWeek"}}]}}]}}]} as unknown as DocumentNode<NflSeasonQuery, NflSeasonQueryVariables>;
export const TeamDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Team"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leagueSlug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"league"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leagueSlug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"team"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"wins"}},{"kind":"Field","name":{"kind":"Name","value":"losses"}},{"kind":"Field","name":{"kind":"Name","value":"ties"}},{"kind":"Field","name":{"kind":"Name","value":"pointsFor"}},{"kind":"Field","name":{"kind":"Name","value":"pointsAgainst"}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamQuery, TeamQueryVariables>;
export const TeamWeekDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TeamWeek"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"leagueSlug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"weekNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"league"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"leagueSlug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"matchup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"weekNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekNumber"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weekNumber"}},{"kind":"Field","name":{"kind":"Name","value":"homeScore"}},{"kind":"Field","name":{"kind":"Name","value":"awayScore"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}},{"kind":"Field","name":{"kind":"Name","value":"homeTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"awayTeam"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"weeklyLineups"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"teamId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"teamId"}}},{"kind":"Argument","name":{"kind":"Name","value":"weekNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"weekNumber"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rosterSlotIndex"}},{"kind":"Field","name":{"kind":"Name","value":"pointsScored"}},{"kind":"Field","name":{"kind":"Name","value":"player"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TeamWeekQuery, TeamWeekQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isSiteAdmin"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;