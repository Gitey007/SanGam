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
} from 'lucide-react';

import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import ErrorState from '../components/common/ErrorState';

import teamApi from '../services/teamApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { extractErrorMessage } from '../utils/helpers';

export const TeamDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState(null);

  const [joinRequestSent, setJoinRequestSent] = useState(false);

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

      // If user is leader, also fetch pending join requests
      if (
        teamData?.leaderId &&
        user?.id &&
        String(teamData.leaderId) === String(user.id)
      ) {
        try {
          const reqs = await teamApi.getJoinRequests(id, user.id);
          setJoinRequests(Array.isArray(reqs) ? reqs : []);
        } catch (reqErr) {
          console.error('Failed to load join requests for leader:', reqErr);
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
   * Check whether logged-in user is already a team member
   */
  const isMember = members.some(
    (member) => String(member.userId) === String(user?.id)
  );

  /**
   * Check whether logged-in user is the team leader
   */
  const isLeader =
    Boolean(team?.leaderId &&
    user?.id &&
    String(team.leaderId) === String(user.id));

  /**
   * Check whether team is full
   */
  const maxMembers = team?.maxMembers || 0;
  const isTeamFull = maxMembers > 0 && members.length >= maxMembers;

  /**
   * Send join request
   */
  const handleJoinTeam = async () => {
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

    setIsJoining(true);

    try {
      await teamApi.sendJoinRequest(id, user.id);
      setJoinRequestSent(true);
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
   * Leader accepts join request
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
   * Leader removes a team member
   */
  const handleRemoveMember = async (memberUserId, memberName) => {
    if (!user?.id) return;
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName || 'this member'} from the team?`
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
      setActionLoading((prev) => ({ ...prev, [`member-${memberUserId}`]: false }));
    }
  };

  /**
   * Member leaves team (only for non-leaders)
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
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-xl border border-slate-200 p-8 animate-pulse space-y-5">
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-7 w-56 bg-slate-200 rounded" />
          <div className="h-4 w-80 bg-slate-100 rounded" />
          <div className="h-24 bg-slate-50 rounded-lg mt-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="h-16 bg-slate-100 rounded-lg" />
            <div className="h-16 bg-slate-100 rounded-lg" />
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/teams')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Teams</span>
      </button>

      {/* Main Team Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 break-words">
                  {team.name}
                </h1>

                {isTeamFull ? (
                  <Badge variant="neutral" size="md">
                    Full
                  </Badge>
                ) : (
                  <Badge variant="success" size="md">
                    Open
                  </Badge>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Created by{' '}
                <span className="font-semibold text-slate-800">
                  {team.leaderName || 'Team Leader'}
                </span>
              </p>
            </div>

            {/* Join / Member / Leader status & actions */}
            <div className="shrink-0">
              {isLeader ? (
                <Badge variant="brand" size="md">
                  You are the leader
                </Badge>
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
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
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
                  onClick={handleJoinTeam}
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
          {/* Description */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              About Project / Team
            </h2>

            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl whitespace-pre-line">
              {team.description || 'No description provided.'}
            </p>
          </section>

          {/* Team capacity */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Capacity
              </h2>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-sm font-semibold text-slate-900">
                {members.length}
              </span>

              <span className="text-xs text-slate-500">
                / {team.maxMembers || '—'} members
              </span>
            </div>
          </section>

          {/* Members */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Team Members
              </h2>

              <span className="text-xs text-slate-500">
                {members.length}
                {team.maxMembers ? ` / ${team.maxMembers}` : ''}
              </span>
            </div>

            {members.length === 0 ? (
              <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                <p className="text-xs text-slate-500">
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
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar name={member.name} size="sm" />

                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-900 block truncate">
                            {member.name}
                          </span>

                          <span className="text-[11px] text-slate-500 block truncate">
                            {isMemberLeader ? 'Team Leader' : 'Member'}
                          </span>

                          {member.branch && (
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              {member.branch}
                              {member.year ? ` • Year ${member.year}` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isMemberLeader && (
                          <ShieldCheck className="w-4 h-4 text-slate-500" />
                        )}

                        {canLeaderRemove && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(member.userId, member.name)
                            }
                            disabled={actionLoading[`member-${member.userId}`]}
                            title="Remove member"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
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

          {/* Pending Join Requests (Visible to Leader Only) */}
          {isLeader && (
            <section className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-slate-500" />
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
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <p className="text-xs text-slate-500">
                    No pending join requests at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {joinRequests.map((req) => (
                    <div
                      key={req.requestId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={req.userName} size="sm" />
                        <div>
                          <span className="text-xs font-semibold text-slate-900 block">
                            {req.userName}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleDateString(
                                  undefined,
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }
                                )
                              : 'Pending review'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptRequest(req.requestId)}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(req.requestId)}
                          isLoading={
                            actionLoading[req.requestId] === 'reject'
                          }
                          disabled={Boolean(actionLoading[req.requestId])}
                          leftIcon={X}
                          className="text-slate-600 hover:text-rose-600 hover:border-rose-200"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Pending request notice for applicant */}
      {joinRequestSent && !isMember && !isLeader && (
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
          <p className="text-xs font-medium text-slate-800">
            Your join request has been sent.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            The team leader must accept your request before you become a
            member of this team.
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamDetailsPage;