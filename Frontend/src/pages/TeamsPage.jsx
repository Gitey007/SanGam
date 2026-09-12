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
import ConfirmModal from '../components/common/ConfirmModal';
import Modal from '../components/common/Modal';
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

  const [cancelRequestModal, setCancelRequestModal] = useState({
    isOpen: false,
    request: null,
    isLoading: false,
  });

  const [declineInvitationModal, setDeclineInvitationModal] = useState({
    isOpen: false,
    invitationId: null,
    isLoading: false,
  });

  const [requestAnotherModal, setRequestAnotherModal] = useState({
    isOpen: false,
    invitation: null,
    team: null,
    openRoles: [],
    selectedRole: '',
    customRole: '',
    isLoadingRoles: false,
    isSubmitting: false,
  });

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

  const handleConfirmDeclineInvitation = async () => {
    const invitationId = declineInvitationModal.invitationId;
    if (!invitationId) return;

    setDeclineInvitationModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await teamApi.rejectTeamInvitation(invitationId);
      success('Team invitation declined.');
      setDeclineInvitationModal({ isOpen: false, invitationId: null, isLoading: false });
      await fetchInvitations();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to decline invitation.');
      toastError(msg);
      setDeclineInvitationModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleOpenRequestAnotherModal = async (invitation) => {
    const cachedTeam = teams.find((t) => String(t.id) === String(invitation.teamId));
    let initialRoles = [];
    if (cachedTeam?.roleSlots) {
      initialRoles = cachedTeam.roleSlots.filter((r) => r.availableSlots > 0);
    }

    setRequestAnotherModal({
      isOpen: true,
      invitation,
      team: cachedTeam || null,
      openRoles: initialRoles,
      selectedRole: initialRoles.length > 0 ? initialRoles[0].roleName : '',
      customRole: '',
      isLoadingRoles: !cachedTeam || !cachedTeam.roleSlots,
      isSubmitting: false,
    });

    try {
      const freshTeam = await teamApi.getTeamById(invitation.teamId);
      const openSlots = Array.isArray(freshTeam?.roleSlots)
        ? freshTeam.roleSlots.filter((r) => r.availableSlots > 0)
        : [];

      setRequestAnotherModal((prev) => {
        if (!prev.isOpen || prev.invitation?.invitationId !== invitation.invitationId) return prev;
        return {
          ...prev,
          team: freshTeam,
          openRoles: openSlots,
          selectedRole:
            openSlots.length > 0
              ? openSlots.some((s) => s.roleName === prev.selectedRole)
                ? prev.selectedRole
                : openSlots[0].roleName
              : '',
          isLoadingRoles: false,
        };
      });
    } catch (err) {
      console.warn('Failed to load fresh team details for role request:', err);
      setRequestAnotherModal((prev) => ({ ...prev, isLoadingRoles: false }));
    }
  };

  const handleConfirmRequestAnotherRole = async (e) => {
    e?.preventDefault();
    const inv = requestAnotherModal.invitation;
    const role = requestAnotherModal.selectedRole;
    if (!inv || !role) return;

    setRequestAnotherModal((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await teamApi.requestAnotherRole(
        inv.invitationId,
        role,
        requestAnotherModal.customRole?.trim() || null
      );
      success(`Join request submitted as ${role}! The team leader will review your request.`);
      setRequestAnotherModal({
        isOpen: false,
        invitation: null,
        team: null,
        openRoles: [],
        selectedRole: '',
        customRole: '',
        isLoadingRoles: false,
        isSubmitting: false,
      });
      await Promise.all([fetchTeams(), fetchInvitations(), fetchMyRequests()]);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to submit join request.');
      toastError(msg);
      setRequestAnotherModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleConfirmCancelRequest = async () => {
    const req = cancelRequestModal.request;
    if (!req) return;

    setCancelRequestModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await teamApi.cancelJoinRequest(req.teamId, req.requestId);
      success('Join request cancelled.');
      setCancelRequestModal({ isOpen: false, request: null, isLoading: false });
      await fetchMyRequests();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to cancel join request.');
      toastError(msg);
      setCancelRequestModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const myTeams = teams.filter((t) => {
    const currentUserId = user?.id || user?.userId;
    const isLeader =
      (t.leaderId && currentUserId && String(t.leaderId) === String(currentUserId)) ||
      (t.leader?.id && currentUserId && String(t.leader.id) === String(currentUserId)) ||
      (t.leaderName && user?.name && t.leaderName === user.name);
    const isMember = t.members?.some(
      (m) =>
        (m.userId && currentUserId && String(m.userId) === String(currentUserId)) ||
        (m.id && currentUserId && String(m.id) === String(currentUserId)) ||
        (m.name && user?.name && m.name === user.name)
    );
    return Boolean(isLeader || isMember);
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
            {pendingInvitations.map((inv) => {
              const matchingTeam = teams.find((t) => String(t.id) === String(inv.teamId));
              const membersCount = matchingTeam?.currentMemberCount || matchingTeam?.members?.length || 0;
              const isTeamFull = Boolean(matchingTeam?.maxMembers > 0 && membersCount >= matchingTeam.maxMembers);
              const isExpired = Boolean(
                matchingTeam?.isExpired ||
                matchingTeam?.expired ||
                (matchingTeam?.joinDeadline && new Date(matchingTeam.joinDeadline) < new Date())
              );
              const roleSlotsList = matchingTeam?.roleSlots || [];
              const openRoles = roleSlotsList.filter((r) => r.availableSlots > 0);
              const isEligibleForRequestAnother = matchingTeam
                ? !isTeamFull && !isExpired && openRoles.length > 0
                : true;

              return (
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

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end sm:self-center">
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
                    {isEligibleForRequestAnother && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRequestAnotherModal(inv)}
                        disabled={Boolean(actionLoading[inv.invitationId])}
                      >
                        Request Another Role
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={X}
                      onClick={() => setDeclineInvitationModal({ isOpen: true, invitationId: inv.invitationId, isLoading: false })}
                      disabled={Boolean(actionLoading[inv.invitationId])}
                      className="text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-800"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelRequestModal({ isOpen: true, request: req, isLoading: false })}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                  >
                    Cancel Request
                  </Button>
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

      {/* Cancel Join Request ConfirmModal (Spec 7, 8, 9) */}
      <ConfirmModal
        isOpen={cancelRequestModal.isOpen}
        onClose={() => setCancelRequestModal({ isOpen: false, request: null, isLoading: false })}
        onConfirm={handleConfirmCancelRequest}
        title="Cancel Join Request"
        message="Cancel this join request? You can submit a new request later if the team is still accepting members."
        confirmLabel="Cancel Request"
        cancelLabel="Keep Request"
        confirmVariant="danger"
        isLoading={cancelRequestModal.isLoading}
      />

      {/* Decline Invitation ConfirmModal (Spec 13) */}
      <ConfirmModal
        isOpen={declineInvitationModal.isOpen}
        onClose={() => setDeclineInvitationModal({ isOpen: false, invitationId: null, isLoading: false })}
        onConfirm={handleConfirmDeclineInvitation}
        title="Decline Invitation"
        message="Are you sure you want to decline this invitation to join the team?"
        confirmLabel="Decline"
        cancelLabel="Keep"
        confirmVariant="danger"
        isLoading={declineInvitationModal.isLoading}
      />

      {/* Student "Request Another Role" Modal */}
      <Modal
        isOpen={requestAnotherModal.isOpen}
        onClose={() =>
          !requestAnotherModal.isSubmitting &&
          setRequestAnotherModal((prev) => ({ ...prev, isOpen: false }))
        }
        title="Request Another Role"
        description={`Submit a new join request for an available role on ${requestAnotherModal.team?.name || requestAnotherModal.invitation?.teamName || 'this team'}.`}
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRequestAnotherModal((prev) => ({ ...prev, isOpen: false }))}
              disabled={requestAnotherModal.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmRequestAnotherRole}
              isLoading={requestAnotherModal.isSubmitting}
              disabled={!requestAnotherModal.selectedRole || requestAnotherModal.openRoles.length === 0 || requestAnotherModal.isLoadingRoles}
            >
              Submit Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmRequestAnotherRole} className="space-y-4">
          {requestAnotherModal.isLoadingRoles ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Loading available roles...
            </div>
          ) : requestAnotherModal.openRoles.length === 0 ? (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              No alternate roles are currently available.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Available Open Roles
              </label>
              <select
                value={requestAnotherModal.selectedRole}
                onChange={(e) =>
                  setRequestAnotherModal((prev) => ({ ...prev, selectedRole: e.target.value }))
                }
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              >
                {requestAnotherModal.openRoles.map((slot, i) => (
                  <option key={`${slot.roleName}-${i}`} value={slot.roleName}>
                    {slot.roleName} ({slot.availableSlots} opening{slot.availableSlots > 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default TeamsPage;
