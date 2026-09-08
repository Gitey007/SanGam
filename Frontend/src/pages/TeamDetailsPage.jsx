import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  UserPlus,
  Users,
  ShieldCheck,
  Check,
  X,
  UserMinus,
  LogOut,
  Clock,
  UserCheck,
  Search,
  Send,
  Mail,
  AlertCircle,
  Trophy,
  Briefcase,
  Target,
  Edit3,
  ExternalLink,
  Code2,
  Sparkles,
  Github,
  FileText,
  Layers,
  ChevronRight,
} from 'lucide-react';

import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import EditTeamModal from '../components/teams/EditTeamModal';

import teamApi from '../services/teamApi';
import userApi from '../services/userApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  extractErrorMessage,
  formatBranchYear,
  formatCollege,
} from '../utils/helpers';

export const TeamDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);

  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Candidate Join Modal state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedJoinRole, setSelectedJoinRole] = useState('');
  const [joinCustomRole, setJoinCustomRole] = useState('');

  // Leader "Accept as Another Role" Modal state
  const [reassignModalRequest, setReassignModalRequest] = useState(null);
  const [selectedReassignRole, setSelectedReassignRole] = useState('');
  const [reassignCustomRole, setReassignCustomRole] = useState('');

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [inviteSearchTerm, setInviteSearchTerm] = useState('');
  const [selectedInviteRole, setSelectedInviteRole] = useState('');
  const [inviteCustomRole, setInviteCustomRole] = useState('');
  const [invitingUserId, setInvitingUserId] = useState(null);

  /**
   * Fetch pending join requests (leader only)
   */
  const fetchJoinRequests = useCallback(async () => {
    if (!id || !user?.id) return;
    try {
      const reqs = await teamApi.getJoinRequests(id, user.id);
      setJoinRequests(Array.isArray(reqs) ? reqs : []);
    } catch (err) {
      console.error('Failed to load join requests:', err);
    }
  }, [id, user?.id]);

  /**
   * Fetch sent invitations (leader only)
   */
  const fetchSentInvitations = useCallback(async () => {
    if (!id || !user?.id) return;
    try {
      const invs = await teamApi.getTeamInvitations(id);
      setSentInvitations(Array.isArray(invs) ? invs : []);
    } catch (err) {
      console.error('Failed to load sent invitations:', err);
    }
  }, [id, user?.id]);

  /**
   * Fetch team details + members
   */
  const fetchTeamDetails = useCallback(async () => {
    if (!id) {
      setError('Invalid team ID.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [teamData, membersData] = await Promise.all([
        teamApi.getTeamById(id),
        teamApi.getTeamMembers(id),
      ]);

      setTeam(teamData);
      setMembers(Array.isArray(membersData) ? membersData : []);

      const currentUserIsMember = membersData?.some(
        (member) => String(member.userId) === String(user?.id)
      );

      if (currentUserIsMember) {
        setJoinRequestSent(false);
      }

      // If user is leader, also fetch pending join requests and sent invitations
      if (
        teamData?.leaderId &&
        user?.id &&
        String(teamData.leaderId) === String(user.id)
      ) {
        try {
          const [reqs, invs] = await Promise.all([
            teamApi.getJoinRequests(id, user.id).catch(() => []),
            teamApi.getTeamInvitations(id).catch(() => []),
          ]);
          setJoinRequests(Array.isArray(reqs) ? reqs : []);
          setSentInvitations(Array.isArray(invs) ? invs : []);
        } catch (leaderErr) {
          console.error('Failed to load leader management data:', leaderErr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch team details:', err);
      setError(
        extractErrorMessage(
          err,
          'Unable to load team details. Please try again.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, user?.id]);

  useEffect(() => {
    fetchTeamDetails();
  }, [fetchTeamDetails]);

  /**
   * Check membership and leadership
   */
  const isMember = members.some(
    (member) => String(member.userId) === String(user?.id)
  );

  const isLeader = Boolean(
    team?.leaderId && user?.id && String(team.leaderId) === String(user.id)
  );

  const maxMembers = team?.maxMembers || 0;
  const isTeamFull = maxMembers > 0 && members.length >= maxMembers;
  const isAlmostFull = maxMembers > 0 && members.length === maxMembers - 1;

  // Available roles with openings
  const roleSlotsList = team?.roleSlots || [];
  const openRoles = roleSlotsList.filter((r) => r.availableSlots > 0);

  /**
   * Candidate clicks "Join Team" -> opens role selection modal
   */
  const handleOpenJoinModal = () => {
    if (!user?.id) {
      toastError('Unable to identify your account. Please log in again.');
      return;
    }
    if (isMember) {
      toastError('You are already a member of this team.');
      return;
    }
    if (isTeamFull) {
      toastError('This team is already full.');
      return;
    }

    if (openRoles.length > 0) {
      setSelectedJoinRole(openRoles[0].roleName);
    } else if (roleSlotsList.length > 0) {
      setSelectedJoinRole(roleSlotsList[0].roleName);
    } else {
      setSelectedJoinRole('Member');
    }
    setJoinCustomRole('');
    setIsJoinModalOpen(true);
  };

  /**
   * Submit Join Request with role
   */
  const handleConfirmJoinRequest = async (e) => {
    e?.preventDefault();
    if (!user?.id) return;

    setIsJoining(true);
    try {
      await teamApi.sendJoinRequest(
        id,
        user.id,
        selectedJoinRole,
        joinCustomRole.trim() || null
      );
      setJoinRequestSent(true);
      setIsJoinModalOpen(false);
      success('Join request sent successfully!');
    } catch (err) {
      console.error('Failed to send join request:', err);
      const message = extractErrorMessage(
        err,
        'Failed to send join request. Please try again.'
      );
      toastError(message);
      if (err.response?.status === 409) {
        setJoinRequestSent(true);
      }
    } finally {
      setIsJoining(false);
    }
  };

  /**
   * Leader directly accepts join request
   */
  const handleAcceptRequest = async (requestId) => {
    if (!user?.id) return;
    setActionLoading((prev) => ({ ...prev, [requestId]: 'accept' }));

    try {
      await teamApi.acceptJoinRequest(id, requestId, user.id);
      success('Join request accepted successfully!');
      await Promise.all([fetchTeamDetails(), fetchJoinRequests()]);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to accept join request.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  /**
   * Open "Accept as Another Role" Modal
   */
  const handleOpenReassignModal = (request) => {
    setReassignModalRequest(request);
    if (openRoles.length > 0) {
      setSelectedReassignRole(openRoles[0].roleName);
    } else {
      setSelectedReassignRole('');
    }
    setReassignCustomRole('');
  };

  /**
   * Confirm "Accept as Another Role"
   */
  const handleConfirmReassignAccept = async (e) => {
    e?.preventDefault();
    if (!reassignModalRequest || !user?.id) return;

    const reqId = reassignModalRequest.requestId;
    setActionLoading((prev) => ({ ...prev, [reqId]: 'accept-reassign' }));

    try {
      await teamApi.acceptJoinRequest(
        id,
        reqId,
        user.id,
        selectedReassignRole,
        reassignCustomRole.trim() || null
      );
      success('Join request accepted with assigned role!');
      setReassignModalRequest(null);
      await Promise.all([fetchTeamDetails(), fetchJoinRequests()]);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to accept join request.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [reqId]: null }));
    }
  };

  /**
   * Leader rejects join request
   */
  const handleRejectRequest = async (requestId) => {
    if (!user?.id) return;
    setActionLoading((prev) => ({ ...prev, [requestId]: 'reject' }));

    try {
      await teamApi.rejectJoinRequest(id, requestId, user.id);
      success('Join request rejected successfully.');
      await fetchJoinRequests();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to reject join request.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  /**
   * Open invite student modal
   */
  const handleOpenInviteModal = async () => {
    setIsInviteModalOpen(true);
    if (openRoles.length > 0) {
      setSelectedInviteRole(openRoles[0].roleName);
    } else if (roleSlotsList.length > 0) {
      setSelectedInviteRole(roleSlotsList[0].roleName);
    } else {
      setSelectedInviteRole('Member');
    }
    setInviteCustomRole('');

    if (studentsList.length === 0) {
      setIsLoadingStudents(true);
      try {
        const data = await userApi.getUsers();
        setStudentsList(Array.isArray(data) ? data : data?.content || []);
      } catch (err) {
        console.error('Failed to load students for invitation:', err);
      } finally {
        setIsLoadingStudents(false);
      }
    }
  };

  /**
   * Send team invitation to student
   */
  const handleSendInvitation = async (targetUserId) => {
    if (!id || !targetUserId) return;
    setInvitingUserId(targetUserId);
    try {
      await teamApi.inviteStudentToTeam(
        id,
        targetUserId,
        selectedInviteRole,
        inviteCustomRole.trim() || null
      );
      success('Invitation sent successfully!');
      await fetchSentInvitations();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to send invitation.');
      toastError(msg);
    } finally {
      setInvitingUserId(null);
    }
  };

  /**
   * Leader removes a team member
   */
  const handleRemoveMember = async (memberUserId, memberName) => {
    if (!user?.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to remove ${
        memberName || 'this member'
      } from the team?`
    );
    if (!confirmed) return;

    setActionLoading((prev) => ({ ...prev, [`member-${memberUserId}`]: true }));

    try {
      await teamApi.removeMember(id, memberUserId, user.id);
      success('Member removed successfully.');
      await fetchTeamDetails();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to remove member.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`member-${memberUserId}`]: false,
      }));
    }
  };

  /**
   * Member leaves team
   */
  const handleLeaveTeam = async () => {
    if (!user?.id) return;
    const confirmed = window.confirm('Are you sure you want to leave this team?');
    if (!confirmed) return;

    setIsLeaving(true);

    try {
      await teamApi.leaveTeam(id, user.id);
      success('Left team successfully.');
      navigate('/teams');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to leave team.');
      toastError(msg);
      setIsLeaving(false);
    }
  };

  /**
   * Helper to check if role is Other/Custom
   */
  const isOther = (roleStr) => {
    if (!roleStr) return false;
    const r = roleStr.toLowerCase();
    return (
      r === 'other' ||
      r === 'other / custom' ||
      r === 'other/custom' ||
      r.includes('other')
    );
  };

  /**
   * Loading skeleton
   */
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 animate-pulse space-y-5">
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-80 bg-slate-100 dark:bg-slate-700 rounded" />
          <div className="h-24 bg-slate-50 dark:bg-slate-700/50 rounded-lg mt-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
            <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error || !team) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Team not found"
          message={
            error ||
            'The requested team does not exist or may have been deleted.'
          }
          onRetry={fetchTeamDetails}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/teams')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Teams</span>
      </button>

      {/* Main Team Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-subtle">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white break-words">
                  {team.name}
                </h1>

                {isTeamFull ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                    FULL ({members.length}/{team.maxMembers})
                  </span>
                ) : isAlmostFull ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    ALMOST FULL (1 slot left)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    OPEN ({members.length}/{team.maxMembers} Members)
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Led by{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {team.leaderName || 'Team Leader'}
                </span>
                {team.createdAt && (
                  <span className="ml-2 text-slate-400 dark:text-slate-500">
                    • Created {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>

            {/* Header Actions */}
            <div className="shrink-0 flex flex-wrap items-center gap-2">
              {isLeader ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Edit3}
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Team
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={UserPlus}
                    onClick={handleOpenInviteModal}
                    disabled={isTeamFull}
                  >
                    Invite Student
                  </Button>
                </>
              ) : isMember ? (
                <div className="flex items-center gap-2.5">
                  <Badge variant="brand" size="md">
                    You are a member
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLeaveTeam}
                    isLoading={isLeaving}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 border-rose-200 dark:border-rose-800"
                    leftIcon={LogOut}
                  >
                    Leave Team
                  </Button>
                </div>
              ) : joinRequestSent ? (
                <Badge variant="neutral" size="md">
                  Request Pending
                </Badge>
              ) : isTeamFull ? (
                <Badge variant="neutral" size="md">
                  Team is full
                </Badge>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={UserPlus}
                  onClick={handleOpenJoinModal}
                  isLoading={isJoining}
                >
                  Join Team
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Details Body */}
        <div className="p-6 md:p-8 space-y-7">
          {/* Section: Project Resources (GitHub & Documentation URLs) */}
          {(team.githubRepositoryUrl || team.documentationUrl) && (
            <section className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Github className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Project Resources
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {team.githubRepositoryUrl && (
                  <a
                    href={
                      team.githubRepositoryUrl.startsWith('http')
                        ? team.githubRepositoryUrl
                        : `https://${team.githubRepositoryUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 shadow-xs transition-all"
                  >
                    <Github className="w-4 h-4" />
                    <span>View Repository</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </a>
                )}

                {team.documentationUrl && (
                  <a
                    href={
                      team.documentationUrl.startsWith('http')
                        ? team.documentationUrl
                        : `https://${team.documentationUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 shadow-xs transition-all"
                  >
                    <FileText className="w-4 h-4 text-brand-500" />
                    <span>View Documentation</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Section: Project Overview */}
          {(team.projectName || team.description) && (
            <section className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    {team.projectName || 'Project Details'}
                  </h2>
                </div>
                {team.projectType && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                    {team.projectType}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {team.projectDescription || team.description}
              </p>
            </section>
          )}

          {/* Section: Team Vision */}
          {team.teamVision && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-brand-500" />
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Team Vision & Ambition
                </h2>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                {team.teamVision}
              </p>
            </section>
          )}

          {/* Section: Hackathon Details */}
          {(team.hackathonName || team.projectType === 'Hackathon') &&
            team.hackathonName && (
              <section className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/60 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                      Target Hackathon: {team.hackathonName}
                    </h3>
                  </div>
                  {team.hackathonUrl && (
                    <a
                      href={
                        team.hackathonUrl.startsWith('http')
                          ? team.hackathonUrl
                          : `https://${team.hackathonUrl}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-900 dark:text-amber-300 hover:text-amber-700 dark:hover:text-amber-200 underline"
                    >
                      <span>Event Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {team.hackathonDeadline && (
                  <p className="text-xs text-amber-800 dark:text-amber-400">
                    <span className="font-semibold">
                      Submission Deadline / Date:
                    </span>{' '}
                    {team.hackathonDeadline}
                  </p>
                )}
              </section>
            )}

          {/* Section: Role Distribution Breakdown */}
          {roleSlotsList.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role Distribution ({members.length}/{team.maxMembers || 4} Filled)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {roleSlotsList.map((slot, index) => {
                  const isFull = slot.filledSlots >= slot.slotCount;
                  const matchingMembers = members.filter((m) => {
                    if (isOther(slot.roleName)) {
                      return isOther(m.assignedRole);
                    }
                    return (
                      m.assignedRole?.toLowerCase() ===
                      slot.roleName?.toLowerCase()
                    );
                  });

                  return (
                    <div
                      key={`${slot.roleName}-${index}`}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {slot.roleName}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isFull
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {slot.filledSlots} / {slot.slotCount}{' '}
                            {isFull
                              ? 'FULL'
                              : `${slot.availableSlots} opening${
                                  slot.availableSlots > 1 ? 's' : ''
                                }`}
                          </span>
                        </div>

                        {/* Members assigned to this role */}
                        <div className="space-y-1 mt-2">
                          {matchingMembers.length === 0 ? (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 italic block">
                              No members assigned yet
                            </span>
                          ) : (
                            matchingMembers.map((m) => (
                              <div
                                key={m.userId}
                                className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                                <span className="truncate">{m.name}</span>
                                {m.customRole && (
                                  <span className="text-[10px] text-brand-600 dark:text-brand-400 font-normal truncate">
                                    — {m.customRole}
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section: Required Skills */}
          {team.requiredSkills && team.requiredSkills.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <Code2 className="w-4 h-4 text-brand-500" />
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Required Technical Skills
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(team.requiredSkills)
                  ? team.requiredSkills
                  : Array.from(team.requiredSkills)
                ).map((skill, idx) => (
                  <span
                    key={`${skill}-${idx}`}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Team Members List */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  All Team Members ({members.length} / {team.maxMembers || 4})
                </h2>
              </div>
            </div>

            {members.length === 0 ? (
              <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No team members found.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((member) => {
                  const isMemberLeader = member.role === 'LEADER';
                  const canLeaderRemove =
                    isLeader &&
                    !isMemberLeader &&
                    String(member.userId) !== String(user?.id);

                  return (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar name={member.name} size="sm" />

                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                            {member.name}
                          </span>

                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                            {isMemberLeader
                              ? 'Team Leader'
                              : member.assignedRole || 'Member'}
                            {member.customRole
                              ? ` (${member.customRole})`
                              : ''}
                          </span>

                          {member.branch && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate mt-0.5">
                              {member.branch}
                              {member.year ? ` • Year ${member.year}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isMemberLeader && (
                          <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        )}

                        {canLeaderRemove && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(member.userId, member.name)
                            }
                            disabled={actionLoading[`member-${member.userId}`]}
                            title="Remove member"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Sent Invitations & Pending Join Requests (Visible to Leader Only) */}
          {isLeader && (
            <>
              {/* Sent Invitations Section */}
              <section className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Sent Invitations
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        sentInvitations.filter((i) => i.status === 'PENDING')
                          .length > 0
                          ? 'brand'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {
                        sentInvitations.filter((i) => i.status === 'PENDING')
                          .length
                      }{' '}
                      pending
                    </Badge>
                    <Button
                      variant="outline"
                      size="xs"
                      leftIcon={UserPlus}
                      onClick={handleOpenInviteModal}
                      disabled={isTeamFull}
                    >
                      + Invite More
                    </Button>
                  </div>
                </div>

                {sentInvitations.length === 0 ? (
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No invitations sent yet. Click "Invite Student" to invite
                      teammates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {sentInvitations.map((inv) => (
                      <div
                        key={inv.invitationId}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={inv.invitedUserName} size="sm" />
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                              {inv.invitedUserName}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>Role: {inv.invitedRole || 'General'}</span>
                              {inv.customRole && (
                                <span>({inv.customRole})</span>
                              )}
                              <span>•</span>
                              <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              <span>
                                {inv.createdAt
                                  ? new Date(
                                      inv.createdAt
                                    ).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'recently'}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Badge
                            variant={
                              inv.status === 'ACCEPTED'
                                ? 'success'
                                : inv.status === 'REJECTED'
                                ? 'neutral'
                                : 'brand'
                            }
                            size="sm"
                          >
                            {inv.status === 'PENDING'
                              ? 'Pending Response'
                              : inv.status === 'ACCEPTED'
                              ? 'Accepted'
                              : 'Declined'}
                          </Badge>
                          {inv.status === 'REJECTED' && (
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() =>
                                handleSendInvitation(inv.invitedUserId)
                              }
                              isLoading={invitingUserId === inv.invitedUserId}
                              disabled={isTeamFull}
                            >
                              Re-invite
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Pending Join Requests Section */}
              <section className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Pending Join Requests
                    </h2>
                  </div>

                  <Badge
                    variant={joinRequests.length > 0 ? 'brand' : 'neutral'}
                    size="sm"
                  >
                    {joinRequests.length}{' '}
                    {joinRequests.length === 1 ? 'request' : 'requests'}
                  </Badge>
                </div>

                {joinRequests.length === 0 ? (
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No pending join requests at this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {joinRequests.map((req) => {
                      // Check if requested role has open slots
                      const reqRoleSlot = roleSlotsList.find((s) => {
                        if (isOther(req.requestedRole)) {
                          return isOther(s.roleName);
                        }
                        return (
                          s.roleName?.toLowerCase() ===
                          req.requestedRole?.toLowerCase()
                        );
                      });

                      const isRoleFull =
                        reqRoleSlot && reqRoleSlot.availableSlots <= 0;

                      return (
                        <div
                          key={req.requestId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={req.userName} size="sm" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                                  {req.userName}
                                </span>
                                {req.requestedRole && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                                    Requesting: {req.requestedRole}
                                    {req.customRole
                                      ? ` (${req.customRole})`
                                      : ''}
                                  </span>
                                )}
                              </div>

                              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                {req.createdAt
                                  ? new Date(
                                      req.createdAt
                                    ).toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                    })
                                  : 'Pending review'}
                                {isRoleFull && (
                                  <span className="text-rose-500 font-semibold ml-1">
                                    • Requested role is FULL
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {!isRoleFull ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                  handleAcceptRequest(req.requestId)
                                }
                                isLoading={
                                  actionLoading[req.requestId] === 'accept'
                                }
                                disabled={
                                  Boolean(actionLoading[req.requestId]) ||
                                  isTeamFull
                                }
                                leftIcon={Check}
                              >
                                Accept
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleOpenReassignModal(req)
                                }
                                disabled={
                                  Boolean(actionLoading[req.requestId]) ||
                                  isTeamFull ||
                                  openRoles.length === 0
                                }
                                className="text-brand-600 dark:text-brand-400 border-brand-300 dark:border-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/50"
                              >
                                Accept as Another Role
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleRejectRequest(req.requestId)
                              }
                              isLoading={
                                actionLoading[req.requestId] === 'reject'
                              }
                              disabled={Boolean(actionLoading[req.requestId])}
                              leftIcon={X}
                              className="text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* Candidate Join Request Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title={`Join ${team?.name}`}
        description="Select the role you would like to contribute in this squad."
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsJoinModalOpen(false)}
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmJoinRequest}
              isLoading={isJoining}
              disabled={!selectedJoinRole}
            >
              Send Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmJoinRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Your Role / Position
            </label>
            <select
              value={selectedJoinRole}
              onChange={(e) => setSelectedJoinRole(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            >
              {roleSlotsList.map((slot, i) => (
                <option key={`${slot.roleName}-${i}`} value={slot.roleName}>
                  {slot.roleName} (
                  {slot.availableSlots > 0
                    ? `${slot.availableSlots} opening${
                        slot.availableSlots > 1 ? 's' : ''
                      }`
                    : 'FULL'}
                  )
                </option>
              ))}
            </select>
          </div>

          {isOther(selectedJoinRole) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                What role would you like to contribute as?
              </label>
              <Input
                name="customRole"
                placeholder="e.g. Prompt Engineer, ML Engineer"
                value={joinCustomRole}
                onChange={(e) => setJoinCustomRole(e.target.value)}
                required
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Leader "Accept as Another Role" Modal */}
      <Modal
        isOpen={Boolean(reassignModalRequest)}
        onClose={() => setReassignModalRequest(null)}
        title="Accept as Another Role"
        description={`The role requested by ${
          reassignModalRequest?.userName || 'this student'
        } is full. Select an available open role for them.`}
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReassignModalRequest(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmReassignAccept}
              disabled={!selectedReassignRole}
            >
              Confirm Acceptance
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmReassignAccept} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Available Open Roles
            </label>
            <select
              value={selectedReassignRole}
              onChange={(e) => setSelectedReassignRole(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            >
              {openRoles.map((slot, i) => (
                <option key={`${slot.roleName}-${i}`} value={slot.roleName}>
                  {slot.roleName} ({slot.availableSlots} opening
                  {slot.availableSlots > 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </div>

          {isOther(selectedReassignRole) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Assign Custom Role Name
              </label>
              <Input
                name="reassignCustomRole"
                placeholder="e.g. Prompt Engineer, Cloud Engineer"
                value={reassignCustomRole}
                onChange={(e) => setReassignCustomRole(e.target.value)}
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Invite Student Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title={`Invite Student to ${team.name}`}
        description="Search for student collaborators and specify their target role."
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          {/* Role selector for invitation */}
          {roleSlotsList.length > 0 && (
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Assign Invitation Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedInviteRole}
                  onChange={(e) => setSelectedInviteRole(e.target.value)}
                  className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                >
                  {roleSlotsList.map((slot, i) => (
                    <option
                      key={`${slot.roleName}-${i}`}
                      value={slot.roleName}
                    >
                      {slot.roleName} (
                      {slot.availableSlots > 0
                        ? `${slot.availableSlots} opening${
                            slot.availableSlots > 1 ? 's' : ''
                          }`
                        : 'FULL'}
                      )
                    </option>
                  ))}
                </select>

                {isOther(selectedInviteRole) && (
                  <input
                    type="text"
                    placeholder="Custom role (e.g. ML Engineer)"
                    value={inviteCustomRole}
                    onChange={(e) => setInviteCustomRole(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                )}
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, skill, college, or branch..."
              value={inviteSearchTerm}
              onChange={(e) => setInviteSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Warning if full */}
          {isTeamFull && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                This team is currently full ({members.length}/
                {team.maxMembers}). You cannot invite more members.
              </span>
            </div>
          )}

          {/* Student list */}
          <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-700 pr-1">
            {isLoadingStudents ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                Loading students...
              </div>
            ) : (() => {
              const eligibleStudents = studentsList.filter((s) => {
                if (String(s.id) === String(user?.id)) return false;
                if (members.some((m) => String(m.userId) === String(s.id)))
                  return false;

                if (!inviteSearchTerm.trim()) return true;
                const term = inviteSearchTerm.toLowerCase();
                const nameMatch = s.name?.toLowerCase().includes(term);
                const branchMatch = s.branch?.toLowerCase().includes(term);
                const collegeMatch = s.college?.toLowerCase().includes(term);
                const skillMatch = Array.isArray(s.skills)
                  ? s.skills.some((sk) => sk.toLowerCase().includes(term))
                  : false;
                return nameMatch || branchMatch || collegeMatch || skillMatch;
              });

              if (eligibleStudents.length === 0) {
                return (
                  <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    {inviteSearchTerm
                      ? 'No students matching your search query.'
                      : 'No other students available to invite.'}
                  </div>
                );
              }

              return eligibleStudents.map((student) => {
                const pendingInvitation = sentInvitations.find(
                  (i) =>
                    String(i.invitedUserId) === String(student.id) &&
                    i.status === 'PENDING'
                );

                const skillsList = Array.isArray(student.skills)
                  ? student.skills
                  : typeof student.skills === 'string'
                  ? student.skills
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [];

                return (
                  <div
                    key={student.id}
                    className="pt-2.5 pb-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar name={student.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {student.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {formatBranchYear(student.branch, student.year)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {formatCollege(student.college)}
                        </p>
                        {skillsList.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skillsList.slice(0, 3).map((sk) => (
                              <span
                                key={sk}
                                className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part 27: Fixed sizing for Invite button / Invited badge */}
                    <div className="shrink-0 flex items-center justify-end min-w-[76px]">
                      {pendingInvitation ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap min-w-[68px] text-center">
                          Invited
                        </span>
                      ) : (
                        <Button
                          variant="primary"
                          size="xs"
                          leftIcon={Send}
                          onClick={() => handleSendInvitation(student.id)}
                          isLoading={invitingUserId === student.id}
                          disabled={isTeamFull || Boolean(invitingUserId)}
                          className="min-w-[68px] whitespace-nowrap"
                        >
                          Invite
                        </Button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </Modal>

      {/* Edit Team Modal (Leader only) */}
      {isLeader && (
        <EditTeamModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          team={team}
          onTeamUpdated={(updated) => {
            setTeam(updated);
            fetchTeamDetails();
          }}
        />
      )}
    </div>
  );
};

export default TeamDetailsPage;