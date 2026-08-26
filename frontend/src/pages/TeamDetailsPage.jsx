import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getTeamById, 
  getTeamMembers, 
  joinTeam, 
  leaveTeam, 
  removeMember, 
  sendJoinRequest, 
  getJoinRequests, 
  acceptJoinRequest, 
  rejectJoinRequest 
} from '../api/teams';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { 
  Users, 
  Crown, 
  UserMinus, 
  LogOut, 
  UserPlus, 
  Send, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function TeamDetailsPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [removeMemberModal, setRemoveMemberModal] = useState({ open: false, member: null });

  useEffect(() => {
    loadTeamData();
  }, [id, user]);

  const loadTeamData = async () => {
    setLoading(true);
    setError('');
    try {
      const [teamData, membersData] = await Promise.all([
        getTeamById(id),
        getTeamMembers(id),
      ]);
      setTeam(teamData);
      setMembers(membersData);

      // If current user is leader, also fetch pending join requests
      if (user && teamData.leaderId === user.id) {
        try {
          const reqsData = await getJoinRequests(id);
          setRequests(reqsData);
        } catch (reqErr) {
          console.error('Failed to load join requests:', reqErr);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load team details.');
    } finally {
      setLoading(false);
    }
  };

  const isLeader = user && team && team.leaderId === user.id;
  const isMember = user && members.some((m) => m.userId === user.id);
  const isTeamFull = team && members.length >= team.maxMembers;

  const handleJoinDirect = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await joinTeam(id);
      setSuccessMessage('You have successfully joined the team!');
      await loadTeamData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join team.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendJoinRequest = async () => {
    setActionLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await sendJoinRequest(id);
      setSuccessMessage('Join request sent successfully! The team leader will review it.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send join request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    setActionLoading(true);
    setError('');
    try {
      await leaveTeam(id);
      setLeaveModalOpen(false);
      setSuccessMessage('You have left the team.');
      await loadTeamData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave team.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeMemberModal.member) return;
    setActionLoading(true);
    setError('');
    try {
      await removeMember(id, removeMemberModal.member.userId);
      setRemoveMemberModal({ open: false, member: null });
      setSuccessMessage(`Removed ${removeMemberModal.member.name} from team.`);
      await loadTeamData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading(true);
    setError('');
    try {
      await acceptJoinRequest(id, requestId);
      setSuccessMessage('Join request accepted! Member added.');
      await loadTeamData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActionLoading(true);
    setError('');
    try {
      await rejectJoinRequest(id, requestId);
      setSuccessMessage('Join request rejected.');
      await loadTeamData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading team details..." />;
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ErrorMessage message={error || 'Team not found.'} />
        <Link to="/teams" className="inline-flex items-center gap-2 mt-4 text-indigo-400 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Teams Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <Link
        to="/teams"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all teams
      </Link>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-400 hover:text-emerald-200 font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Main Team Card Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">{team.name}</h1>
              {isLeader && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  You are Leader
                </span>
              )}
              {!isLeader && isMember && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Team Member
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {team.description || 'No description provided.'}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <span className="font-semibold text-slate-300">Created by:</span>
              <span className="text-indigo-400 font-medium">{team.leaderName}</span>
            </div>
          </div>

          {/* Action Buttons Column */}
          <div className="shrink-0 flex flex-col gap-3 min-w-[200px]">
            {isAuthenticated ? (
              <>
                {/* Non-member action */}
                {!isMember && (
                  <>
                    <button
                      onClick={handleJoinDirect}
                      disabled={actionLoading || isTeamFull}
                      className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      {isTeamFull ? 'Team is Full' : 'Join Directly'}
                    </button>

                    <button
                      onClick={handleSendJoinRequest}
                      disabled={actionLoading || isTeamFull}
                      className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/60 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      Request to Join
                    </button>
                  </>
                )}

                {/* Regular Member Action */}
                {isMember && !isLeader && (
                  <button
                    onClick={() => setLeaveModalOpen(true)}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/60 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    Leave Team
                  </button>
                )}
              </>
            ) : (
              <Link
                to="/login"
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-center text-white bg-indigo-600 hover:bg-indigo-500 transition"
              >
                Sign in to Join
              </Link>
            )}
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-400">Team Capacity</span>
            <span className={isTeamFull ? 'text-rose-400' : 'text-indigo-400'}>
              {members.length} / {team.maxMembers} Members
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isTeamFull
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min((members.length / team.maxMembers) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Leader View: Pending Join Requests */}
      {isLeader && (
        <div className="bg-slate-900/70 border border-amber-500/20 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Pending Join Requests</h2>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {requests.length}
              </span>
            </div>
          </div>

          {requests.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No pending join requests for this team right now.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{req.userName}</p>
                      <span className="text-xs text-slate-400 font-mono">({req.userEmail})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {req.college} • {req.branch} (Year {req.year})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      disabled={actionLoading || isTeamFull}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      disabled={actionLoading}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Team Members Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Team Members ({members.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile?id=${member.userId}`}
                      className="text-sm font-bold text-white hover:text-indigo-300 transition"
                    >
                      {member.name}
                    </Link>
                    {member.role === 'LEADER' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Crown className="w-3 h-3 text-amber-400" />
                        LEADER
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        MEMBER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {member.branch} • Year {member.year} • {member.college}
                  </p>
                </div>
              </div>

              {/* Leader can remove other members */}
              {isLeader && member.role !== 'LEADER' && (
                <button
                  onClick={() => setRemoveMemberModal({ open: true, member })}
                  title="Remove Member"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave Team Confirmation Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Leave Team"
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to leave <span className="font-bold text-white">{team.name}</span>?
          You will need to request to join again if you change your mind.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setLeaveModalOpen(false)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleLeaveTeam}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition"
          >
            Yes, Leave Team
          </button>
        </div>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={removeMemberModal.open}
        onClose={() => setRemoveMemberModal({ open: false, member: null })}
        title="Remove Team Member"
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to remove{' '}
          <span className="font-bold text-white">{removeMemberModal.member?.name}</span> from the
          team?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setRemoveMemberModal({ open: false, member: null })}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRemoveMember}
            disabled={actionLoading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition"
          >
            Yes, Remove
          </button>
        </div>
      </Modal>
    </div>
  );
}
