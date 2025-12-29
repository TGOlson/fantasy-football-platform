/* eslint-disable */
import type { Prisma, User, League, Franchise, LeagueSeason, LeagueSettings, Team, Matchup, WeeklyLineup, Player, PlayerSeason, PlayerWeeklyStat, PlayerWeeklyProjection, NflGame, RosterTransaction } from "/Users/tyler/dev/fantasy-platform/node_modules/.pnpm/@prisma+client@6.19.1_prisma@6.19.1_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client/index.js";
import type { PothosPrismaDatamodel } from "@pothos/plugin-prisma";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "commissionedSeasons" | "teams";
        ListRelations: "commissionedSeasons" | "teams";
        Relations: {
            commissionedSeasons: {
                Shape: LeagueSeason[];
                Name: "LeagueSeason";
                Nullable: false;
            };
            teams: {
                Shape: Team[];
                Name: "Team";
                Nullable: false;
            };
        };
    };
    League: {
        Name: "League";
        Shape: League;
        Include: Prisma.LeagueInclude;
        Select: Prisma.LeagueSelect;
        OrderBy: Prisma.LeagueOrderByWithRelationInput;
        WhereUnique: Prisma.LeagueWhereUniqueInput;
        Where: Prisma.LeagueWhereInput;
        Create: {};
        Update: {};
        RelationName: "franchises" | "seasons";
        ListRelations: "franchises" | "seasons";
        Relations: {
            franchises: {
                Shape: Franchise[];
                Name: "Franchise";
                Nullable: false;
            };
            seasons: {
                Shape: LeagueSeason[];
                Name: "LeagueSeason";
                Nullable: false;
            };
        };
    };
    Franchise: {
        Name: "Franchise";
        Shape: Franchise;
        Include: Prisma.FranchiseInclude;
        Select: Prisma.FranchiseSelect;
        OrderBy: Prisma.FranchiseOrderByWithRelationInput;
        WhereUnique: Prisma.FranchiseWhereUniqueInput;
        Where: Prisma.FranchiseWhereInput;
        Create: {};
        Update: {};
        RelationName: "league" | "teams";
        ListRelations: "teams";
        Relations: {
            league: {
                Shape: League;
                Name: "League";
                Nullable: false;
            };
            teams: {
                Shape: Team[];
                Name: "Team";
                Nullable: false;
            };
        };
    };
    LeagueSeason: {
        Name: "LeagueSeason";
        Shape: LeagueSeason;
        Include: Prisma.LeagueSeasonInclude;
        Select: Prisma.LeagueSeasonSelect;
        OrderBy: Prisma.LeagueSeasonOrderByWithRelationInput;
        WhereUnique: Prisma.LeagueSeasonWhereUniqueInput;
        Where: Prisma.LeagueSeasonWhereInput;
        Create: {};
        Update: {};
        RelationName: "league" | "commissioner" | "settings" | "teams" | "matchups" | "transactions";
        ListRelations: "teams" | "matchups" | "transactions";
        Relations: {
            league: {
                Shape: League;
                Name: "League";
                Nullable: false;
            };
            commissioner: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            settings: {
                Shape: LeagueSettings;
                Name: "LeagueSettings";
                Nullable: false;
            };
            teams: {
                Shape: Team[];
                Name: "Team";
                Nullable: false;
            };
            matchups: {
                Shape: Matchup[];
                Name: "Matchup";
                Nullable: false;
            };
            transactions: {
                Shape: RosterTransaction[];
                Name: "RosterTransaction";
                Nullable: false;
            };
        };
    };
    LeagueSettings: {
        Name: "LeagueSettings";
        Shape: LeagueSettings;
        Include: Prisma.LeagueSettingsInclude;
        Select: Prisma.LeagueSettingsSelect;
        OrderBy: Prisma.LeagueSettingsOrderByWithRelationInput;
        WhereUnique: Prisma.LeagueSettingsWhereUniqueInput;
        Where: Prisma.LeagueSettingsWhereInput;
        Create: {};
        Update: {};
        RelationName: "leagueSeason";
        ListRelations: never;
        Relations: {
            leagueSeason: {
                Shape: LeagueSeason | null;
                Name: "LeagueSeason";
                Nullable: true;
            };
        };
    };
    Team: {
        Name: "Team";
        Shape: Team;
        Include: Prisma.TeamInclude;
        Select: Prisma.TeamSelect;
        OrderBy: Prisma.TeamOrderByWithRelationInput;
        WhereUnique: Prisma.TeamWhereUniqueInput;
        Where: Prisma.TeamWhereInput;
        Create: {};
        Update: {};
        RelationName: "franchise" | "leagueSeason" | "owner" | "weeklyLineups" | "homeMatchups" | "awayMatchups" | "transactions";
        ListRelations: "weeklyLineups" | "homeMatchups" | "awayMatchups" | "transactions";
        Relations: {
            franchise: {
                Shape: Franchise;
                Name: "Franchise";
                Nullable: false;
            };
            leagueSeason: {
                Shape: LeagueSeason;
                Name: "LeagueSeason";
                Nullable: false;
            };
            owner: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            weeklyLineups: {
                Shape: WeeklyLineup[];
                Name: "WeeklyLineup";
                Nullable: false;
            };
            homeMatchups: {
                Shape: Matchup[];
                Name: "Matchup";
                Nullable: false;
            };
            awayMatchups: {
                Shape: Matchup[];
                Name: "Matchup";
                Nullable: false;
            };
            transactions: {
                Shape: RosterTransaction[];
                Name: "RosterTransaction";
                Nullable: false;
            };
        };
    };
    Matchup: {
        Name: "Matchup";
        Shape: Matchup;
        Include: Prisma.MatchupInclude;
        Select: Prisma.MatchupSelect;
        OrderBy: Prisma.MatchupOrderByWithRelationInput;
        WhereUnique: Prisma.MatchupWhereUniqueInput;
        Where: Prisma.MatchupWhereInput;
        Create: {};
        Update: {};
        RelationName: "leagueSeason" | "homeTeam" | "awayTeam";
        ListRelations: never;
        Relations: {
            leagueSeason: {
                Shape: LeagueSeason;
                Name: "LeagueSeason";
                Nullable: false;
            };
            homeTeam: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            awayTeam: {
                Shape: Team | null;
                Name: "Team";
                Nullable: true;
            };
        };
    };
    WeeklyLineup: {
        Name: "WeeklyLineup";
        Shape: WeeklyLineup;
        Include: Prisma.WeeklyLineupInclude;
        Select: Prisma.WeeklyLineupSelect;
        OrderBy: Prisma.WeeklyLineupOrderByWithRelationInput;
        WhereUnique: Prisma.WeeklyLineupWhereUniqueInput;
        Where: Prisma.WeeklyLineupWhereInput;
        Create: {};
        Update: {};
        RelationName: "team" | "player";
        ListRelations: never;
        Relations: {
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            player: {
                Shape: Player;
                Name: "Player";
                Nullable: false;
            };
        };
    };
    Player: {
        Name: "Player";
        Shape: Player;
        Include: Prisma.PlayerInclude;
        Select: Prisma.PlayerSelect;
        OrderBy: Prisma.PlayerOrderByWithRelationInput;
        WhereUnique: Prisma.PlayerWhereUniqueInput;
        Where: Prisma.PlayerWhereInput;
        Create: {};
        Update: {};
        RelationName: "seasons" | "weeklyStats" | "weeklyProjections" | "weeklyLineups" | "transactions";
        ListRelations: "seasons" | "weeklyStats" | "weeklyProjections" | "weeklyLineups" | "transactions";
        Relations: {
            seasons: {
                Shape: PlayerSeason[];
                Name: "PlayerSeason";
                Nullable: false;
            };
            weeklyStats: {
                Shape: PlayerWeeklyStat[];
                Name: "PlayerWeeklyStat";
                Nullable: false;
            };
            weeklyProjections: {
                Shape: PlayerWeeklyProjection[];
                Name: "PlayerWeeklyProjection";
                Nullable: false;
            };
            weeklyLineups: {
                Shape: WeeklyLineup[];
                Name: "WeeklyLineup";
                Nullable: false;
            };
            transactions: {
                Shape: RosterTransaction[];
                Name: "RosterTransaction";
                Nullable: false;
            };
        };
    };
    PlayerSeason: {
        Name: "PlayerSeason";
        Shape: PlayerSeason;
        Include: Prisma.PlayerSeasonInclude;
        Select: Prisma.PlayerSeasonSelect;
        OrderBy: Prisma.PlayerSeasonOrderByWithRelationInput;
        WhereUnique: Prisma.PlayerSeasonWhereUniqueInput;
        Where: Prisma.PlayerSeasonWhereInput;
        Create: {};
        Update: {};
        RelationName: "player";
        ListRelations: never;
        Relations: {
            player: {
                Shape: Player;
                Name: "Player";
                Nullable: false;
            };
        };
    };
    PlayerWeeklyStat: {
        Name: "PlayerWeeklyStat";
        Shape: PlayerWeeklyStat;
        Include: Prisma.PlayerWeeklyStatInclude;
        Select: Prisma.PlayerWeeklyStatSelect;
        OrderBy: Prisma.PlayerWeeklyStatOrderByWithRelationInput;
        WhereUnique: Prisma.PlayerWeeklyStatWhereUniqueInput;
        Where: Prisma.PlayerWeeklyStatWhereInput;
        Create: {};
        Update: {};
        RelationName: "player";
        ListRelations: never;
        Relations: {
            player: {
                Shape: Player;
                Name: "Player";
                Nullable: false;
            };
        };
    };
    PlayerWeeklyProjection: {
        Name: "PlayerWeeklyProjection";
        Shape: PlayerWeeklyProjection;
        Include: Prisma.PlayerWeeklyProjectionInclude;
        Select: Prisma.PlayerWeeklyProjectionSelect;
        OrderBy: Prisma.PlayerWeeklyProjectionOrderByWithRelationInput;
        WhereUnique: Prisma.PlayerWeeklyProjectionWhereUniqueInput;
        Where: Prisma.PlayerWeeklyProjectionWhereInput;
        Create: {};
        Update: {};
        RelationName: "player";
        ListRelations: never;
        Relations: {
            player: {
                Shape: Player;
                Name: "Player";
                Nullable: false;
            };
        };
    };
    NflGame: {
        Name: "NflGame";
        Shape: NflGame;
        Include: never;
        Select: Prisma.NflGameSelect;
        OrderBy: Prisma.NflGameOrderByWithRelationInput;
        WhereUnique: Prisma.NflGameWhereUniqueInput;
        Where: Prisma.NflGameWhereInput;
        Create: {};
        Update: {};
        RelationName: never;
        ListRelations: never;
        Relations: {};
    };
    RosterTransaction: {
        Name: "RosterTransaction";
        Shape: RosterTransaction;
        Include: Prisma.RosterTransactionInclude;
        Select: Prisma.RosterTransactionSelect;
        OrderBy: Prisma.RosterTransactionOrderByWithRelationInput;
        WhereUnique: Prisma.RosterTransactionWhereUniqueInput;
        Where: Prisma.RosterTransactionWhereInput;
        Create: {};
        Update: {};
        RelationName: "leagueSeason" | "team" | "player";
        ListRelations: never;
        Relations: {
            leagueSeason: {
                Shape: LeagueSeason;
                Name: "LeagueSeason";
                Nullable: false;
            };
            team: {
                Shape: Team;
                Name: "Team";
                Nullable: false;
            };
            player: {
                Shape: Player;
                Name: "Player";
                Nullable: false;
            };
        };
    };
}
export function getDatamodel(): PothosPrismaDatamodel;