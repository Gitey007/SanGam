import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Plus,
  Mail,
  Check,
  X,
  Clock,
  ArrowRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import TeamCard from '../components/teams/TeamCard';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import teamApi from '../services/teamApi';
import { extractErrorMessage } from '../utils/helpers';

export const TeamsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';

  const [tab, setTab] = useState(initialTab); // 'all' | 'my' | 'invitations' | 'requests'
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const sortTeams = (teamList) => {
    return [...teamList].sort((a, b) => {
      const aExpired = Boolean(
        a.isExpired ||
          a.expired ||
          (a.joinDeadline && new Date(a.joinDeadline) < new Date())
      );
      const bExpired = Boolean(
        b.isExpired ||
          b.expired ||
          (b.joinDeadline && new Date(b.joinDeadline) < new Date())
      );

      if (aExpired !== bExpired) {
        return aExpired ? 1 : -1; // Active teams first, expired at bottom
      }

      // Among active or expired: availableCapacity descending
      const aMembersCount = a.currentMemberCount || a.members?.length || 0;
      const bMembersCount = b.currentMemberCount || b.members?.length || 0;
      const aCapacity = (a.maxMembers || 0) - aMembersCount;
      const bCapacity = (b.maxMembers || 0) - bMembersCount;
      return bCapacity - aCapacity;
    });
  };

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teamApi.getTeams();
      const rawList = Array.isArray(data) ? data : [];
      setTeams(sortTeams(rawList));
    } catch (err) {
      console.error('Failed to load teams:', err);
      setError(
        extractErrorMessage(err, 'Unable to load teams. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    setIsLoadingInvitations(true);
    try {
      const data = await teamApi.getMyTeamInvitations();
      setInvitations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load invitations:', err);
    } finally {
      setIsLoadingInvitations(false);
    }
  }, []);

  const fetchMyRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const data = await teamApi.getMyJoinRequests();
      setMyRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load my join requests:', err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
    fetchInvitations();
    fetchMyRequests();
  }, [fetchTeams, fetchInvitations, fetchMyRequests]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === 'all') {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ tab: newTab }, { replace: true });
    }
  };

  const handleAcceptInvitation = async (invitation) => {
    const invitationId = invitation.invitationId;
    setActionLoading((prev) => ({ ...prev, [invitationId]: 'accept' }));
    try {
      await teamApi.acceptTeamInvitation(invitationId);
      success('Team invitation accepted! You are now a member.');
      await Promise.all([fetchTeams(), fetchInvitations(), fetchMyRequests()]);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to accept invitation.');
      toastError(msg);
      if (err.response?.status === 409) {
        navigate(`/teams/${invitation.teamId}`);
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [invitationId]: null }));
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    setActionLoading((prev) => ({ ...prev, [invitationId]: 'reject' }));
    try {
      await teamApi.rejectTeamInvitation(invitationId);
      success('Team invitation declined.');
      await fetchInvitations();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to decline invitation.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [invitationId]: null }));
    }
  };

  const myTeams = teams.filter((t) => {
    const isLeader =
      (t.leaderId && user?.id && String(t.leaderId) === String(user.id)) ||
      (t.leader?.id && user?.id && String(t.leader.id) === String(user.id)) ||
      (t.leaderName && user?.name && t.leaderName === user.name);
    const isMember = t.members?.some(
      (m) =>
        String(m.userId || m.id) === String(user?.id) ||
        m.name === user?.name
    );
    return isLeader || isMember;
  });

  const [limit, setLimit] = useState(10); // 10 | 20 | 30 | 'ALL'
  const pendingInvitations = invitations.filter((i) => i.status === 'PENDING');
  const pendingRequests = myRequests.filter((r) => r.status === 'PENDING');

  const displayedTeams = tab === 'my' ? myTeams : teams;
  const limitedTeams =
    limit === 'ALL' ? displayedTeams : displayedTeams.slice(0, Number(limit));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-900 dark:text-white" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Teams
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Form collaborative squads for hackathons, capstones, and open-source projects.
          </p>
        </div>

        <Link to="/teams/create" className="self-start sm:self-auto">
          <Button variant="primary" size="md" leftIcon={Plus}>
            Create Team
          </Button>
        </Link>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-lg w-fit border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-subtle font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Teams ({teams.length})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('my')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'my'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-subtle font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            My Teams ({myTeams.length})
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('invitations')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'invitations'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-subtle font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Invitations</span>
            {pendingInvitations.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-brand-600 text-white">
                {pendingInvitations.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('requests')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'requests'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-subtle font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>My Requests</span>
            {pendingRequests.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-brand-600 text-white">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {(tab === 'all' || tab === 'my') && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 self-start sm:self-auto">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) =>
                setLimit(
                  e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                )
              }
              className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value="ALL">All</option>
            </select>
            {displayedTeams.length > 0 && (
              <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1">
                ({limitedTeams.length} of {displayedTeams.length})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {tab === 'invitations' ? (
        /* Invitations List (Pending only per Spec 26) */
        isLoadingInvitations ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : pendingInvitations.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No pending invitations"
            description="When team leaders invite you to join their squads, your pending invitations will appear here."
            actionLabel="Explore Teams"
            onAction={() => handleTabChange('all')}
          />
        ) : (
          <div className="space-y-3">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.invitationId}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/teams/${inv.teamId}`}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {inv.teamName}
                    </Link>
                    <Badge variant="brand" size="sm">
                      Pending Your Response
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invited by{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {inv.invitedByName}
                    </span>{' '}
                    (Team Leader) •{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Role: {inv.invitedRole || 'Not specified'}
                    </span>
                    {inv.customRole && (
                      <span className="ml-1 text-brand-600 dark:text-brand-400 font-medium">
                        ({inv.customRole})
                      </span>
                    )}
                  </p>

                  {inv.teamDescription && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-2xl pt-1">
                      {inv.teamDescription}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Received{' '}
                      {inv.createdAt
                        ? new Date(inv.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )
                        : 'recently'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={Check}
                    onClick={() => handleAcceptInvitation(inv)}
                    isLoading={actionLoading[inv.invitationId] === 'accept'}
                    disabled={Boolean(actionLoading[inv.invitationId])}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={X}
                    onClick={() => handleRejectInvitation(inv.invitationId)}
                    isLoading={actionLoading[inv.invitationId] === 'reject'}
                    disabled={Boolean(actionLoading[inv.invitationId])}
                    className="text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-800"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'requests' ? (
        /* My Join Requests Tab (Spec 25) */
        isLoadingRequests ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-36 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : pendingRequests.length === 0 ? (
          <EmptyState
            icon={Send}
            title="No active join requests"
            description="You don't have any pending requests to join squads at the moment."
            actionLabel="Discover Teams"
            onAction={() => handleTabChange('all')}
          />
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.requestId}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/teams/${req.teamId}`}
                      className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      {req.teamName || `Team #${req.teamId}`}
                    </Link>
                    <Badge variant="amber" size="sm">
                      Pending Review
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Requested Role:{' '}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {req.requestedRole || 'General Member'}
                    </span>
                    {req.customRole && (
                      <span className="ml-1 text-brand-600 dark:text-brand-400 font-medium">
                        ({req.customRole})
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      Submitted{' '}
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )
                        : 'recently'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <Link to={`/teams/${req.teamId}`}>
                    <Button variant="outline" size="sm" rightIcon={ArrowRight}>
                      View Squad
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Teams Grid */
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to load teams"
            message={error}
            onRetry={fetchTeams}
          />
        ) : displayedTeams.length === 0 ? (
          <EmptyState
            icon={Users}
            title={tab === 'my' ? 'No teams joined yet' : 'No teams found'}
            description={
              tab === 'my'
                ? 'You have not created or joined any teams yet. Create one to recruit collaborators.'
                : 'There are no active teams currently available.'
            }
            actionLabel="Create Team"
            onAction={() => window.location.assign('/teams/create')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {limitedTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default TeamsPage;
