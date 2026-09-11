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
  Github,
  FileText,
  Layers,
  Trash2,
  RefreshCw,
  Calendar,
} from 'lucide-react';

import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import ErrorState from '../components/common/ErrorState';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
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
  const [myPendingInvitation, setMyPendingInvitation] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);

  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Extend Deadline Modal state (Leader only)
  const [isExtendDeadlineModalOpen, setIsExtendDeadlineModalOpen] = useState(false);
  const [extendDeadlineValue, setExtendDeadlineValue] = useState('');
  const [isExtendingDeadline, setIsExtendingDeadline] = useState(false);

  // Candidate Join Modal state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedJoinRole, setSelectedJoinRole] = useState('');
  const [joinCustomRole, setJoinCustomRole] = useState('');

  // Student "Accept as Another Role" Modal state (when invited role is full)
  const [isStudentAcceptAnotherModalOpen, setIsStudentAcceptAnotherModalOpen] = useState(false);
  const [selectedStudentAnotherRole, setSelectedStudentAnotherRole] = useState('');
  const [studentAnotherCustomRole, setStudentAnotherCustomRole] = useState('');

  // Leader "Accept as Another Role" Modal state
  const [reassignModalRequest, setReassignModalRequest] = useState(null);
  const [selectedReassignRole, setSelectedReassignRole] = useState('');
  const [reassignCustomRole, setReassignCustomRole] = useState('');

  // Leader "Replace Member / Free Slot" Modal state
  const [replaceModalRequest, setReplaceModalRequest] = useState(null);
  const [selectedMemberToReplace, setSelectedMemberToReplace] = useState(null);
  const [isConfirmReplaceModalOpen, setIsConfirmReplaceModalOpen] = useState(false);
  const [isReplacingMember, setIsReplacingMember] = useState(false);

  // Direct Remove Member Modal state (Leader only)
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [inviteSearchTerm, setInviteSearchTerm] = useState('');
  const [selectedInviteRole, setSelectedInviteRole] = useState('');
  const [inviteCustomRole, setInviteCustomRole] = useState('');
  const [invitingUserId, setInvitingUserId] = useState(null);

  /**
   * Helper to check if role is Other / Custom
   */
  const isOther = (roleStr) => {
    if (!roleStr) return false;
    const r = roleStr.toLowerCase().trim();
    return (
      r === 'other' ||
      r === 'other / custom' ||
      r === 'other/custom' ||
      r.includes('other')
    );
  };

  /**
   * Helper to check role matching
   */
  const roleMatches = (r1, r2) => {
    if (!r1 || !r2) return false;
    if (isOther(r1)) return isOther(r2);
    return r1.trim().toLowerCase() === r2.trim().toLowerCase();
  };

  const currentUserId = user?.id || user?.userId;

  /**
   * Fetch pending join requests (leader only)
   */
  const fetchJoinRequests = useCallback(async () => {
    const uid = user?.id || user?.userId;
    if (!id || !uid) return;
    try {
      const reqs = await teamApi.getJoinRequests(id, uid);
      setJoinRequests(Array.isArray(reqs) ? reqs : []);
    } catch (err) {
      console.warn('Failed to load join requests:', err);
    }
  }, [id, user?.id, user?.userId]);

  /**
   * Fetch sent invitations (leader only)
   */
  const fetchSentInvitations = useCallback(async () => {
    const uid = user?.id || user?.userId;
    if (!id || !uid) return;
    try {
      const invs = await teamApi.getTeamInvitations(id);
      setSentInvitations(Array.isArray(invs) ? invs : []);
    } catch (err) {
      console.warn('Failed to load sent invitations:', err);
    }
  }, [id, user?.id, user?.userId]);

  /**
   * Fetch student's own invitations to check pending invitation for this team
   */
  const fetchMyPendingInvitation = useCallback(async () => {
    const uid = user?.id || user?.userId;
    if (!id || !uid) return;
    try {
      const myInvs = await teamApi.getMyTeamInvitations('PENDING');
      if (Array.isArray(myInvs)) {
        const found = myInvs.find(
          (inv) => String(inv.teamId) === String(id) && inv.status === 'PENDING'
        );
        setMyPendingInvitation(found || null);
      }
    } catch (err) {
      console.warn('Failed to load my invitations:', err);
    }
  }, [id, user?.id, user?.userId]);

  /**
   * Fetch team details + members + user state safely
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
      // 1. Fetch core team details (MANDATORY)
      const teamData = await teamApi.getTeamById(id);
      if (!teamData || !teamData.id) {
        throw new Error('Team not found');
      }
      setTeam(teamData);

      const uid = user?.id || user?.userId;

      // 2. Fetch members and pending student invitations safely
      const [membersData, myInvs] = await Promise.all([
        teamApi.getTeamMembers(id).catch((err) => {
          console.warn('Failed to load team members:', err);
          return [];
        }),
        uid
          ? teamApi.getMyTeamInvitations('PENDING').catch((err) => {
              console.warn('Failed to load user invitations:', err);
              return [];
            })
          : Promise.resolve([]),
      ]);

      let resolvedMembers = Array.isArray(membersData) ? membersData : [];
      if (resolvedMembers.length === 0 && teamData.leaderId) {
        resolvedMembers = [
          {
            userId: teamData.leaderId,
            name: teamData.leaderName || 'Team Leader',
            role: 'LEADER',
            assignedRole: 'Leader',
          },
        ];
      }
      setMembers(resolvedMembers);

      const currentUserIsMember = resolvedMembers.some(
        (member) => String(member.userId) === String(uid)
      );

      if (currentUserIsMember) {
        setJoinRequestSent(false);
        setMyPendingInvitation(null);
      } else if (Array.isArray(myInvs)) {
        const found = myInvs.find(
          (inv) => String(inv.teamId) === String(id) && inv.status === 'PENDING'
        );
        setMyPendingInvitation(found || null);
      }

      // 3. If user is leader, safely load pending join requests and sent invitations
      const isCurrentLeader = Boolean(
        teamData.leaderId &&
        uid &&
        String(teamData.leaderId) === String(uid)
      );

      if (isCurrentLeader) {
        try {
          const [reqs, invs] = await Promise.all([
            teamApi.getJoinRequests(id, uid).catch((err) => {
              console.warn('Failed to load join requests:', err);
              return [];
            }),
            teamApi.getTeamInvitations(id).catch((err) => {
              console.warn('Failed to load team invitations:', err);
              return [];
            }),
          ]);
          setJoinRequests(Array.isArray(reqs) ? reqs : []);
          setSentInvitations(Array.isArray(invs) ? invs : []);
        } catch (leaderErr) {
          console.warn('Failed to load leader management data:', leaderErr);
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
  }, [id, user?.id, user?.userId]);

  useEffect(() => {
    fetchTeamDetails();
  }, [fetchTeamDetails]);

  /**
   * Check membership and leadership
   */
  const isMember = members.some(
    (member) => String(member.userId) === String(currentUserId)
  );

  const isLeader = Boolean(
    team?.leaderId &&
      currentUserId &&
      String(team.leaderId) === String(currentUserId)
  );

  const maxMembers = team?.maxMembers || 0;
  const isTeamFull = maxMembers > 0 && members.length >= maxMembers;
  const isAlmostFull = maxMembers > 0 && members.length === maxMembers - 1;
  const isExpired = Boolean(
    team?.isExpired ||
    team?.expired ||
    (team?.joinDeadline && new Date(team?.joinDeadline) < new Date())
  );

  // Available roles with openings
  const roleSlotsList = team?.roleSlots || [];
  const openRoles = roleSlotsList.filter((r) => r.availableSlots > 0);

  // Active pending invitations sent by leader
  const pendingSentInvitations = sentInvitations.filter(
    (inv) => inv?.status === 'PENDING'
  );

  /**
   * Candidate clicks "Join Request" -> opens role selection modal
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
    if (myPendingInvitation) {
      toastError('You have a pending invitation. Please accept or decline the invitation instead.');
      return;
    }
    if (isExpired) {
      toastError('The deadline to join this team has expired.');
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
    const uid = user?.id || user?.userId;
    if (!uid) return;

    setIsJoining(true);
    try {
      await teamApi.sendJoinRequest(
        id,
        uid,
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
   * Student handles "Accept Invitation"
   */
  const handleStudentAcceptInvitation = async () => {
    if (!myPendingInvitation) return;

    const invitedRole = myPendingInvitation.invitedRole;
    const matchingSlot = roleSlotsList.find((s) => roleMatches(s.roleName, invitedRole));
    const isInvitedRoleFull = matchingSlot && matchingSlot.availableSlots <= 0;

    if (isInvitedRoleFull) {
      // Invited role is full -> open alternative role selection
      if (openRoles.length > 0) {
        setSelectedStudentAnotherRole(openRoles[0].roleName);
      } else {
        setSelectedStudentAnotherRole('');
      }
      setStudentAnotherCustomRole('');
      setIsStudentAcceptAnotherModalOpen(true);
      return;
    }

    // Direct acceptance
    setActionLoading((prev) => ({ ...prev, 'my-invitation': 'accept' }));
    try {
      await teamApi.acceptTeamInvitation(myPendingInvitation.invitationId);
      success('Team invitation accepted! You are now a team member.');
      setMyPendingInvitation(null);
      await fetchTeamDetails();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to accept invitation.');
      toastError(msg);
      if (err.response?.status === 409) {
        // Role became full concurrently -> prompt alternative role selection
        if (openRoles.length > 0) {
          setSelectedStudentAnotherRole(openRoles[0].roleName);
        }
        setStudentAnotherCustomRole('');
        setIsStudentAcceptAnotherModalOpen(true);
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, 'my-invitation': null }));
    }
  };

  /**
   * Student confirms "Accept as Another Role" for full invited role
   */
  const handleConfirmStudentAcceptAnotherRole = async (e) => {
    e?.preventDefault();
    if (!myPendingInvitation || !selectedStudentAnotherRole) return;

    setActionLoading((prev) => ({ ...prev, 'my-invitation': 'accept-another' }));
    try {
      await teamApi.acceptTeamInvitation(
        myPendingInvitation.invitationId,
        selectedStudentAnotherRole,
        studentAnotherCustomRole.trim() || null
      );
      success(`Invitation accepted as ${selectedStudentAnotherRole}!`);
      setIsStudentAcceptAnotherModalOpen(false);
      setMyPendingInvitation(null);
      await fetchTeamDetails();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to accept invitation with selected role.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, 'my-invitation': null }));
    }
  };

  /**
   * Student declines invitation
   */
  const handleStudentDeclineInvitation = async () => {
    if (!myPendingInvitation) return;
    setActionLoading((prev) => ({ ...prev, 'my-invitation': 'decline' }));
    try {
      await teamApi.rejectTeamInvitation(myPendingInvitation.invitationId);
      success('Invitation declined.');
      setMyPendingInvitation(null);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to decline invitation.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, 'my-invitation': null }));
    }
  };

  /**
   * Leader directly accepts join request
   */
  const handleAcceptRequest = async (requestId) => {
    const uid = user?.id || user?.userId;
    if (!uid) return;
    setActionLoading((prev) => ({ ...prev, [requestId]: 'accept' }));

    try {
      await teamApi.acceptJoinRequest(id, requestId, uid);
      success('Join request accepted successfully!');
      await fetchTeamDetails();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to accept join request.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  /**
   * Open Leader "Accept as Another Role" Modal
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
   * Confirm Leader "Accept as Another Role"
   */
  const handleConfirmReassignAccept = async (e) => {
    e?.preventDefault();
    const uid = user?.id || user?.userId;
    if (!reassignModalRequest || !uid) return;

    const reqId = reassignModalRequest.requestId;
    setActionLoading((prev) => ({ ...prev, [reqId]: 'accept-reassign' }));

    try {
      await teamApi.acceptJoinRequest(
        id,
        reqId,
        uid,
        selectedReassignRole,
        reassignCustomRole.trim() || null
      );
      success('Join request accepted with assigned role!');
      setReassignModalRequest(null);
      await fetchTeamDetails();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to accept join request.');
      toastError(msg);
    } finally {
      setActionLoading((prev) => ({ ...prev, [reqId]: null }));
    }
  };

  /**
   * Open Leader "Replace Member / Free Slot" Modal
   */
  const handleOpenReplaceModal = (request) => {
    setReplaceModalRequest(request);
    const requestedRole = request.requestedRole;
    const uid = user?.id || user?.userId;
    // Find members occupying this requested role (excluding leader)
    const matching = members.filter((m) => {
      if (m.role === 'LEADER' || String(m.userId) === String(uid)) return false;
      return roleMatches(m.assignedRole, requestedRole);
    });

    if (matching.length > 0) {
      setSelectedMemberToReplace(matching[0]);
    } else {
      setSelectedMemberToReplace(null);
    }
  };

  /**
   * Leader proceeds to final Confirmation Modal for member replacement
   */
  const handleProceedToReplaceConfirm = (e) => {
    e?.preventDefault();
    if (!selectedMemberToReplace) {
      toastError('Please select a member to replace.');
      return;
    }
    setIsConfirmReplaceModalOpen(true);
  };

  /**
   * Leader confirms transactional Member Replacement + Acceptance
   */
  const handleConfirmReplaceMemberAndAccept = async () => {
    const uid = user?.id || user?.userId;
    if (!replaceModalRequest || !selectedMemberToReplace || !uid) return;

    setIsReplacingMember(true);
    const reqId = replaceModalRequest.requestId;

    try {
      await teamApi.acceptJoinRequest(
        id,
        reqId,
        uid,
        replaceModalRequest.requestedRole,
        replaceModalRequest.customRole,
        selectedMemberToReplace.userId
      );

      success(
        `Replaced ${selectedMemberToReplace.name} and accepted ${replaceModalRequest.userName} into ${replaceModalRequest.requestedRole}!`
      );
      setIsConfirmReplaceModalOpen(false);
      setReplaceModalRequest(null);
      setSelectedMemberToReplace(null);
      await fetchTeamDetails();
    } catch (err) {
      console.error('Failed to replace member and accept request:', err);
      const msg = extractErrorMessage(err, 'Failed to replace member.');
      toastError(msg);
    } finally {
      setIsReplacingMember(false);
    }
  };

  /**
   * Leader rejects join request
   */
  const handleRejectRequest = async (requestId) => {
    const uid = user?.id || user?.userId;
    if (!uid) return;
    setActionLoading((prev) => ({ ...prev, [requestId]: 'reject' }));

    try {
      await teamApi.rejectJoinRequest(id, requestId, uid);
      success('Join request rejected.');
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
    if (isExpired) {
      toastError('The deadline to invite members has expired. Please extend the deadline first.');
      return;
    }
    if (isTeamFull) {
      toastError('Cannot invite students. The team is already full.');
      return;
    }
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
   * Leader deletes team
   */
  const handleDeleteTeam = async () => {
    const uid = user?.id || user?.userId;
    if (!id || !uid) return;
    setIsDeleting(true);
    try {
      await teamApi.deleteTeam(id);
      success('Team deleted successfully');
      navigate('/teams');
    } catch (err) {
      console.error('Failed to delete team:', err);
      const msg = extractErrorMessage(err, 'Failed to delete team. Please try again.');
      toastError(msg);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  /**
   * Open remove member confirm modal
   */
  const handleOpenRemoveMemberModal = (memberUserId, memberName) => {
    setMemberToRemove({ userId: memberUserId, name: memberName });
  };

  /**
   * Confirm remove member
   */
  const handleConfirmRemoveMember = async () => {
    const uid = user?.id || user?.userId;
    if (!memberToRemove || !uid) return;
    const memberUserId = memberToRemove.userId;
    setActionLoading((prev) => ({ ...prev, [`member-${memberUserId}`]: true }));

    try {
      await teamApi.removeMember(id, memberUserId, uid);
      success('Member removed successfully.');
      setMemberToRemove(null);
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
   * Confirm leave team
   */
  const handleConfirmLeaveTeam = async () => {
    const uid = user?.id || user?.userId;
    if (!uid) return;
    setIsLeaving(true);

    try {
      await teamApi.leaveTeam(id, uid);
      success('Left team successfully.');
      navigate('/teams');
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to leave team.');
      toastError(msg);
      setIsLeaving(false);
      setIsLeaveModalOpen(false);
    }
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

                {isExpired ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                    EXPIRED ({members.length}/{team.maxMembers})
                  </span>
                ) : isTeamFull ? (
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

            {/* Header Actions - Part 4, 16, 17, 20 State Resolution */}
            <div className="shrink-0 flex flex-wrap items-center gap-2">
              {isLeader ? (
                <>
                  {isExpired && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={Calendar}
                      onClick={() => {
                        setExtendDeadlineValue('');
                        setIsExtendDeadlineModalOpen(true);
                      }}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Extend Deadline
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Edit3}
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Team
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={Trash2}
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 border-rose-200 dark:border-rose-800"
                  >
                    Delete Team
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={UserPlus}
                    onClick={handleOpenInviteModal}
                    disabled={isTeamFull || isExpired}
                    title={isExpired ? 'Cannot invite while team is expired' : isTeamFull ? 'Team is full' : ''}
                  >
                    Invite Student
                  </Button>
                </>
              ) : isMember ? (
                <div className="flex items-center gap-2.5">
                  <Badge variant="brand" size="md">
                    Member
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLeaveModalOpen(true)}
                    isLoading={isLeaving}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 border-rose-200 dark:border-rose-800"
                    leftIcon={LogOut}
                  >
                    Leave Team
                  </Button>
                </div>
              ) : myPendingInvitation ? (
                /* Priority 2: Pending Invitation Exists -> Show Accept Invitation (Hide Join Request) */
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={Check}
                    onClick={handleStudentAcceptInvitation}
                    isLoading={actionLoading['my-invitation'] === 'accept'}
                  >
                    Accept Invitation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={X}
                    onClick={handleStudentDeclineInvitation}
                    isLoading={actionLoading['my-invitation'] === 'decline'}
                    className="text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:border-rose-200 dark:border-rose-800"
                  >
                    Decline
                  </Button>
                </div>
              ) : joinRequestSent ? (
                /* Priority 3: Join Request Pending */
                <Badge variant="neutral" size="md">
                  Request Pending
                </Badge>
              ) : isExpired ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  Join Deadline Expired
                </span>
              ) : isTeamFull ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Team is full
                </span>
              ) : (
                /* Priority 4: No invitation/request -> Show Join Request */
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={UserPlus}
                  onClick={handleOpenJoinModal}
                  isLoading={isJoining}
                >
                  Join Request
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Priority 2: Student Invitation Banner */}
        {!isMember && !isLeader && myPendingInvitation && (
          <div className="mx-6 md:mx-8 mt-6 p-4 rounded-xl bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-brand-900 dark:text-brand-200">
                  You have been invited to join this squad!
                </span>
              </div>
              <p className="text-xs text-brand-800 dark:text-brand-300">
                Invited for role:{' '}
                <span className="font-semibold underline">
                  {myPendingInvitation.invitedRole || 'General Member'}
                </span>
                {myPendingInvitation.customRole && (
                  <span className="ml-1 font-medium">
                    ({myPendingInvitation.customRole})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <Button
                variant="primary"
                size="sm"
                leftIcon={Check}
                onClick={handleStudentAcceptInvitation}
                isLoading={actionLoading['my-invitation'] === 'accept'}
              >
                Accept Invitation
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={X}
                onClick={handleStudentDeclineInvitation}
                isLoading={actionLoading['my-invitation'] === 'decline'}
              >
                Decline
              </Button>
            </div>
          </div>
        )}

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

          {/* Section: Role Distribution Breakdown - Part 18 Display */}
          {roleSlotsList.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-500" />
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ROLE DISTRIBUTION ({members.length}/{team.maxMembers || 4} Filled)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {roleSlotsList.map((slot, index) => {
                  const isFull = slot.filledSlots >= slot.slotCount;
                  const matchingMembers = members.filter((m) => {
                    return roleMatches(slot.roleName, m.assignedRole);
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
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 inline-flex items-center gap-1.5 ${
                              isFull
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            <span>
                              {slot.filledSlots} / {slot.slotCount}
                            </span>
                            <span>•</span>
                            <span>
                              {isFull
                                ? 'FULL'
                                : `${slot.availableSlots} opening${
                                    slot.availableSlots > 1 ? 's' : ''
                                  }`}
                            </span>
                          </span>
                        </div>

                        {/* Members assigned to this role */}
                        <div className="space-y-1.5 mt-2.5">
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
                              handleOpenRemoveMemberModal(member.userId, member.name)
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
                        pendingSentInvitations.length > 0
                          ? 'brand'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {pendingSentInvitations.length} pending
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

                {pendingSentInvitations.length === 0 ? (
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No pending invitations
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingSentInvitations.map((inv) => (
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
                              <span>Role: {inv.invitedRole || 'Not specified'}</span>
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
                            variant="brand"
                            size="sm"
                          >
                            Pending Response
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Pending Join Requests Section - Part 9, 10, 14 */}
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
                        return roleMatches(s.roleName, req.requestedRole);
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

                          <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                            {!isRoleFull ? (
                              <>
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
                                {openRoles.length > 1 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleOpenReassignModal(req)
                                    }
                                    disabled={Boolean(actionLoading[req.requestId]) || isTeamFull}
                                    className="text-brand-600 dark:text-brand-400 border-brand-300 dark:border-brand-700"
                                  >
                                    Accept as Another Role
                                  </Button>
                                )}
                              </>
                            ) : (
                              /* Role is FULL: Leader gets Option A (Another Role) and Option B (Replace Member) */
                              <>
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

                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={RefreshCw}
                                  onClick={() =>
                                    handleOpenReplaceModal(req)
                                  }
                                  disabled={Boolean(actionLoading[req.requestId])}
                                  className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                >
                                  Replace Member / Free Slot
                                </Button>
                              </>
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

      {/* Candidate Join Request Modal - Part 8 */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        title={`Join Request for ${team?.name}`}
        description="Select the position/role you would like to join as in this squad."
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
              Send Join Request
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmJoinRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Role
            </label>
            <select
              value={selectedJoinRole}
              onChange={(e) => setSelectedJoinRole(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            >
              {roleSlotsList.map((slot, i) => (
                <option
                  key={`${slot.roleName}-${i}`}
                  value={slot.roleName}
                  disabled={slot.availableSlots <= 0}
                >
                  {slot.roleName} (
                  {slot.availableSlots > 0
                    ? `${slot.availableSlots} opening${
                        slot.availableSlots > 1 ? 's' : ''
                      }`
                    : 'FULL - Slot Closed'}
                  )
                </option>
              ))}
            </select>
          </div>

          {roleSlotsList.find((r) => r.roleName === selectedJoinRole)?.availableSlots <= 0 && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              This role slot is already full. Please select an available role.
            </div>
          )}

          {isOther(selectedJoinRole) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Role:
              </label>
              <input
                type="text"
                placeholder="e.g. ML Engineer, Prompt Engineer"
                value={joinCustomRole}
                onChange={(e) => setJoinCustomRole(e.target.value)}
                required
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Student "Accept as Another Role" Modal (Part 5, 6) */}
      <Modal
        isOpen={isStudentAcceptAnotherModalOpen}
        onClose={() => setIsStudentAcceptAnotherModalOpen(false)}
        title="Accept as Another Role"
        description={`The role you were invited for (${
          myPendingInvitation?.invitedRole || 'your invited role'
        }) is currently full. Choose another available role with open slots:`}
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStudentAcceptAnotherModalOpen(false)}
              disabled={actionLoading['my-invitation'] === 'accept-another'}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmStudentAcceptAnotherRole}
              isLoading={actionLoading['my-invitation'] === 'accept-another'}
              disabled={!selectedStudentAnotherRole || openRoles.length === 0}
            >
              Accept Invitation
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmStudentAcceptAnotherRole} className="space-y-4">
          {openRoles.length === 0 ? (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              There are no available open role slots remaining on this team at this time.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Available Open Roles
              </label>
              <select
                value={selectedStudentAnotherRole}
                onChange={(e) => setSelectedStudentAnotherRole(e.target.value)}
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
          )}

          {isOther(selectedStudentAnotherRole) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Role:
              </label>
              <input
                type="text"
                placeholder="e.g. ML Engineer"
                value={studentAnotherCustomRole}
                onChange={(e) => setStudentAnotherCustomRole(e.target.value)}
                required
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Leader "Accept as Another Role" Modal - Part 9, 12 */}
      <Modal
        isOpen={Boolean(reassignModalRequest)}
        onClose={() => setReassignModalRequest(null)}
        title="Accept Join Request"
        description={`${
          reassignModalRequest?.userName || 'This student'
        } requested "${reassignModalRequest?.requestedRole || 'a role'}". Choose another available role:`}
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
              disabled={!selectedReassignRole || openRoles.length === 0}
            >
              Accept
            </Button>
          </>
        }
      >
        <form onSubmit={handleConfirmReassignAccept} className="space-y-4">
          {openRoles.length === 0 ? (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
              No other role slots are currently available.
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Choose another available role:
              </label>
              <div className="space-y-2">
                {openRoles.map((slot, i) => (
                  <label
                    key={`${slot.roleName}-${i}`}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReassignRole === slot.roleName
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="reassignRole"
                        value={slot.roleName}
                        checked={selectedReassignRole === slot.roleName}
                        onChange={() => setSelectedReassignRole(slot.roleName)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {slot.roleName}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {slot.availableSlots} opening{slot.availableSlots > 1 ? 's' : ''}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {isOther(selectedReassignRole) && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Role:
              </label>
              <input
                type="text"
                placeholder="e.g. ML Engineer"
                value={reassignCustomRole}
                onChange={(e) => setReassignCustomRole(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
            </div>
          )}
        </form>
      </Modal>

      {/* Leader "Replace Member / Free Slot" Selection Modal - Part 10 */}
      <Modal
        isOpen={Boolean(replaceModalRequest && !isConfirmReplaceModalOpen)}
        onClose={() => setReplaceModalRequest(null)}
        title="Replace Member / Free Slot"
        description={`Select which member in "${replaceModalRequest?.requestedRole}" to replace for ${replaceModalRequest?.userName}:`}
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReplaceModalRequest(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleProceedToReplaceConfirm}
              disabled={!selectedMemberToReplace}
            >
              Proceed to Confirmation
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current members occupying <strong className="text-slate-700 dark:text-slate-200">{replaceModalRequest?.requestedRole}</strong>:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {members
              .filter((m) => {
                if (m.role === 'LEADER' || String(m.userId) === String(user?.id)) return false;
                return roleMatches(m.assignedRole, replaceModalRequest?.requestedRole);
              })
              .map((member) => (
                <label
                  key={member.userId}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMemberToReplace?.userId === member.userId
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="memberToReplace"
                      checked={selectedMemberToReplace?.userId === member.userId}
                      onChange={() => setSelectedMemberToReplace(member)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <Avatar name={member.name} size="sm" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {member.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        {member.assignedRole}
                        {member.customRole ? ` (${member.customRole})` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                    Select to remove
                  </span>
                </label>
              ))}
          </div>
        </div>
      </Modal>

      {/* Leader Explicit Member Replacement Confirmation Modal - Part 11 */}
      <ConfirmModal
        isOpen={isConfirmReplaceModalOpen}
        onClose={() => setIsConfirmReplaceModalOpen(false)}
        onConfirm={handleConfirmReplaceMemberAndAccept}
        title="Remove Member and Accept Request?"
        message={`You are about to remove "${selectedMemberToReplace?.name}" from "${replaceModalRequest?.requestedRole}" and accept "${replaceModalRequest?.userName}" for "${replaceModalRequest?.requestedRole}". This cannot be undone automatically.`}
        confirmLabel="Remove & Accept"
        confirmVariant="danger"
        isLoading={isReplacingMember}
      />

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

      {/* Delete Team Confirmation Modal (Leader only) - Part 23 */}
      {isLeader && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteTeam}
          title="Delete Team?"
          message={`Are you sure you want to delete "${team?.name}"? This action cannot be undone.`}
          confirmLabel="Delete Team"
          confirmVariant="danger"
          isLoading={isDeleting}
        />
      )}

      {/* Remove Member Confirmation Modal (Leader only) - Part 24 */}
      {isLeader && (
        <ConfirmModal
          isOpen={Boolean(memberToRemove)}
          onClose={() => setMemberToRemove(null)}
          onConfirm={handleConfirmRemoveMember}
          title="Remove Member?"
          message={`Are you sure you want to remove ${
            memberToRemove?.name || 'this member'
          } from the team?`}
          confirmLabel="Remove Member"
          confirmVariant="danger"
          isLoading={Boolean(
            memberToRemove && actionLoading[`member-${memberToRemove.userId}`]
          )}
        />
      )}

      {/* Extend Deadline Modal (Leader only) */}
      {isLeader && (
        <Modal
          isOpen={isExtendDeadlineModalOpen}
          onClose={() => setIsExtendDeadlineModalOpen(false)}
          title="Extend Join / Invite Deadline"
          description="Set a new future deadline to reactivate join requests and student invitations for your team."
          maxWidth="max-w-md"
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsExtendDeadlineModalOpen(false)}
                disabled={isExtendingDeadline}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={async (e) => {
                  e?.preventDefault();
                  if (!extendDeadlineValue) {
                    toastError('Please select a valid new deadline.');
                    return;
                  }
                  setIsExtendingDeadline(true);
                  try {
                    await teamApi.extendDeadline(id, extendDeadlineValue);
                    success('Team join deadline extended successfully!');
                    setIsExtendDeadlineModalOpen(false);
                    await fetchTeamDetails();
                  } catch (err) {
                    console.error('Failed to extend deadline:', err);
                    const msg = extractErrorMessage(err, 'Failed to extend deadline.');
                    toastError(msg);
                  } finally {
                    setIsExtendingDeadline(false);
                  }
                }}
                isLoading={isExtendingDeadline}
                disabled={!extendDeadlineValue}
              >
                Save & Reactivate Team
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Join Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={extendDeadlineValue}
                onChange={(e) => setExtendDeadlineValue(e.target.value)}
                required
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Must be a future date/time. Once set, students can send join requests again.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Leave Team Confirmation Modal (Members only) */}
      <ConfirmModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onConfirm={handleConfirmLeaveTeam}
        title="Leave Team?"
        message="Are you sure you want to leave this team? You will no longer be a member of this squad."
        confirmLabel="Leave Team"
        confirmVariant="danger"
        isLoading={isLeaving}
      />
    </div>
  );
};

export default TeamDetailsPage;