import { Navigate, useParams } from 'react-router-dom';
import { useNFLSeasonContext } from '@/providers/nfl-season-provider';

export function TeamRedirect() {
  const { leagueSlug, year, teamId } = useParams<{
    leagueSlug: string;
    year: string;
    teamId: string;
  }>();
  const { currentWeek } = useNFLSeasonContext();

  return (
    <Navigate
      to={`/${leagueSlug}/${year}/teams/${teamId}/w/${currentWeek}`}
      replace
    />
  );
}
