import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Sparkles, Filter } from 'lucide-react';
import Button from '../components/common/Button';
import TeamCard from '../components/teams/TeamCard';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';
import teamApi from '../services/teamApi';

export const TeamsPage = () => {
  const [tab, setTab] = useState('all'); // 'all' | 'my'
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const data = await teamApi.getTeams();
        setTeams(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load teams:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeams();
  }, []);

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

  const displayedTeams = tab === 'my' ? myTeams : teams;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Teams
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Form collaborative squads for hackathons, capstones, and open-source projects.
          </p>
        </div>

        <Link to="/teams/create" className="self-start sm:self-auto">
          <Button variant="primary" size="md" leftIcon={Plus}>
            Create Team
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg w-fit border border-slate-200/60">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            tab === 'all'
              ? 'bg-white text-slate-900 shadow-subtle font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Teams ({teams.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('my')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            tab === 'my'
              ? 'bg-white text-slate-900 shadow-subtle font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          My Teams ({myTeams.length})
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
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
          {displayedTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
