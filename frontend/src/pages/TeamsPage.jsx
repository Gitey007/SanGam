import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllTeams } from '../api/teams';
import TeamCard from '../components/TeamCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Search, PlusCircle, Users, Filter } from 'lucide-react';

export default function TeamsPage() {
  const { isAuthenticated } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllTeams();
      setTeams(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load teams. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      team.leaderName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Teams Directory</h1>
          <p className="text-sm text-slate-400 mt-1">
            Discover and join student teams building hackathon and course projects
          </p>
        </div>

        {isAuthenticated && (
          <Link
            to="/teams/create"
            className="self-start sm:self-auto py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            <PlusCircle className="w-4 h-4" />
            Create Team
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams by project name, description, or leader..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 transition outline-none"
          />
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {/* Content */}
      {loading ? (
        <LoadingSpinner message="Loading all teams..." />
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No teams found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
            {searchTerm
              ? `No teams matched "${searchTerm}". Try a different keyword.`
              : 'There are no active teams right now.'}
          </p>
          {isAuthenticated && (
            <Link
              to="/teams/create"
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Create Team
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
