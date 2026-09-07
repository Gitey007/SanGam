import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  ArrowRight,
  Sparkles,
  Building2,
  BookOpen,
  Calendar,
  Plus,
  Code2,
  Mail,
  Check,
  X,
  Clock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { formatCollege, formatBranchYear, extractErrorMessage } from '../utils/helpers';
import { POPULAR_SKILLS } from '../utils/constants';
import teamApi from '../services/teamApi';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchDashboardData = useCallback(async () => {
    try {
      const [teamsData, invsData] = await Promise.all([
        teamApi.getTeams().catch(() => []),
        teamApi.getMyTeamInvitations('PENDING').catch(() => []),
      ]);
      setTeams(Array.isArray(teamsData) ? teamsData.slice(0, 3) : []);
      setPendingInvitations(Array.isArray(invsData) ? invsData : []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoadingTeams(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAcceptInvitation = async (invitationId) => {
    setActionLoading((prev) => ({ ...prev, [invitationId]: 'accept' }));
    try {
      await teamApi.acceptTeamInvitation(invitationId);
      success('Team invitation accepted! You joined the squad.');
      await fetchDashboardData();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to accept invitation.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [invitationId]: null }));
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    setActionLoading((prev) => ({ ...prev, [invitationId]: 'reject' }));
    try {
      await teamApi.rejectTeamInvitation(invitationId);
      success('Invitation declined.');
      setPendingInvitations((prev) => prev.filter((i) => i.invitationId !== invitationId));
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to decline invitation.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [invitationId]: null }));
    }
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Workspace Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-medium text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Session
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {firstName}.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Find students with the complementary skills you need to build project teams, hackathon squads, or research groups.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Link to="/discover" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              leftIcon={Compass}
              rightIcon={ArrowRight}
              className="w-full sm:w-auto"
            >
              Discover Students
            </Button>
          </Link>
          <Link to="/teams/create" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              leftIcon={Plus}
              className="w-full sm:w-auto"
            >
              Create Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Team Invitations Alert Banner */}
      {pendingInvitations.length > 0 && (
        <div className="bg-gradient-to-r from-brand-50 to-indigo-50/70 rounded-2xl border border-brand-200/80 p-5 md:p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Incoming Team Invitations ({pendingInvitations.length})
                </h2>
                <p className="text-xs text-slate-600">
                  You have been invited by team leaders to join their collaboration squads.
                </p>
              </div>
            </div>

            <Link
              to="/teams?tab=invitations"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View in Teams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingInvitations.slice(0, 2).map((inv) => (
              <div
                key={inv.invitationId}
                className="bg-white rounded-xl border border-brand-100 p-4 flex flex-col justify-between shadow-subtle space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      to={`/teams/${inv.teamId}`}
                      className="text-xs font-bold text-slate-900 hover:text-brand-600 truncate block"
                    >
                      {inv.teamName}
                    </Link>
                    <Badge variant="brand" size="sm">
                      Invited
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Leader: <span className="font-semibold text-slate-700">{inv.invitedByName}</span>
                  </p>
                  {inv.teamDescription && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                      {inv.teamDescription}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {inv.createdAt
                      ? new Date(inv.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Pending'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="xs"
                      leftIcon={Check}
                      onClick={() => handleAcceptInvitation(inv.invitationId)}
                      isLoading={actionLoading[inv.invitationId] === 'accept'}
                      disabled={Boolean(actionLoading[inv.invitationId])}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      leftIcon={X}
                      onClick={() => handleRejectInvitation(inv.invitationId)}
                      isLoading={actionLoading[inv.invitationId] === 'reject'}
                      disabled={Boolean(actionLoading[inv.invitationId])}
                      className="text-slate-600 hover:text-rose-600 hover:border-rose-200"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Profile Snapshot + Discovery Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                My Profile
              </span>
              <Link
                to="/profile"
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                View Full →
              </Link>
            </div>

            <div className="mt-4 flex items-start gap-3.5">
              <Avatar name={user?.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-slate-900 truncate">
                  {user?.name}
                </h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {formatBranchYear(user?.branch, user?.year)}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5" title={user?.college}>
                  {formatCollege(user?.college)}
                </p>
              </div>
            </div>

            {user?.bio && (
              <p className="text-xs text-slate-600 mt-4 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                "{user.bio}"
              </p>
            )}
          </div>

          <div className="pt-4 mt-5 border-t border-slate-100">
            <Link to="/profile">
              <Button variant="outline" size="sm" className="w-full">
                Edit Academic Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Skill Matcher */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Explore by Technical Skill
                </span>
              </div>
              <Link
                to="/discover"
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Filter All →
              </Link>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-600 mb-3">
                Click any skill to instantly filter collaborator profiles in Discovery:
              </p>

              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => navigate(`/discover?skill=${encodeURIComponent(skill)}`)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-900 hover:border-slate-900 hover:text-white transition-all shadow-xs"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl flex items-center justify-between text-xs text-slate-600">
            <span>Looking for students on your campus?</span>
            <Link
              to="/discover?scope=MY_COLLEGE"
              className="font-medium text-slate-900 hover:underline inline-flex items-center gap-1"
            >
              <span>View My College</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Teams Preview Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Open Collaboration Teams
            </h2>
            <p className="text-xs text-slate-500">
              Active projects currently recruiting teammates
            </p>
          </div>
          <Link
            to="/teams"
            className="text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>View all teams</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoadingTeams ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-slate-100/70 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-xl border border-slate-200 p-4.5 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-slate-900 truncate">
                      {team.name}
                    </h3>
                    <Badge variant="neutral" size="sm">
                      Max {team.maxMembers || 4}
                    </Badge>
                  </div>
                  {team.leaderName && (
                    <p className="text-[11px] text-slate-400 mb-2 truncate">
                      Led by <span className="text-slate-600 font-medium">{team.leaderName}</span>
                    </p>
                  )}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {team.description || 'No description provided.'}
                  </p>
                </div>
                <Link
                  to={`/teams/${team.id}`}
                  className="text-xs font-medium text-slate-900 hover:text-brand-600 inline-flex items-center gap-1 pt-2 border-t border-slate-100"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            No active teams created yet. <Link to="/teams/create" className="text-brand-600 font-medium">Create one now</Link>.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
