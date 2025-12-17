import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { LeagueDetailPage } from '@/pages/league-detail';
import { TeamDetailPage } from '@/pages/team-detail';
import { PlayersPage } from '@/pages/players';
import { PlayerDetailPage } from '@/pages/player-detail';
import { LeagueScoringSettingsPage } from '@/pages/league-scoring-settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes (public) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User home - list of leagues, settings */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* League routes - all require league membership */}
          {/* League home for a specific year */}
          <Route
            path="/:leagueSlug/:year"
            element={
              <ProtectedRoute>
                <LeagueDetailPage />
              </ProtectedRoute>
            }
          />

          {/* League settings (view for members, edit for admin) */}
          <Route
            path="/:leagueSlug/:year/settings"
            element={
              <ProtectedRoute>
                <LeagueScoringSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Team roster (view for anyone, edit for owner) */}
          <Route
            path="/:leagueSlug/:year/teams/:teamId"
            element={
              <ProtectedRoute>
                <TeamDetailPage />
              </ProtectedRoute>
            }
          />

          {/* League player list/search */}
          <Route
            path="/:leagueSlug/:year/players"
            element={
              <ProtectedRoute>
                <PlayersPage />
              </ProtectedRoute>
            }
          />

          {/* Player detail within league context */}
          <Route
            path="/:leagueSlug/:year/players/:playerId"
            element={
              <ProtectedRoute>
                <PlayerDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
