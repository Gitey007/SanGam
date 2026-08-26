import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllTeams } from '../api/teams';
import { getAllSkills } from '../api/skills';
import TeamCard from '../components/TeamCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  Sparkles, 
  Trophy, 
  ArrowRight, 
  PlusCircle, 
  Compass, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, skillsData] = await Promise.all([
          getAllTeams(),
          getAllSkills(),
        ]);
        setTeams(teamsData);
        setSkills(skillsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-14 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 bottom-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            College Student Collaboration Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Find the perfect team. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-teal-300">
              Build winning projects.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            SanGam connects college developers, designers, and innovators. Join active teams,
            manage join requests, showcase verified skills, and compete together.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/teams"
              className="py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <Compass className="w-4 h-4" />
              Explore Teams
            </Link>

            {isAuthenticated ? (
              <Link
                to="/teams/create"
                className="py-3.5 px-6 rounded-2xl text-sm font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                Create New Team
              </Link>
            ) : (
              <Link
                to="/register"
                className="py-3.5 px-6 rounded-2xl text-sm font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-2 transition"
              >
                Join SanGam
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-white">{teams.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Teams</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-white">{skills.length}</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tech Skills</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-white">100%</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Peers</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-white">Live</span>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hackathons</p>
        </div>
      </div>

      {/* Featured Teams Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Teams</h2>
            <p className="text-sm text-slate-400 mt-1">Discover teams looking for members</p>
          </div>
          <Link
            to="/teams"
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
          >
            View all ({teams.length})
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Fetching live teams..." />
        ) : teams.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400">No teams created yet.</p>
            {isAuthenticated && (
              <Link to="/teams/create" className="mt-3 inline-block text-sm text-indigo-400 font-semibold">
                Create the first team &rarr;
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.slice(0, 6).map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}
      </div>

      {/* Skills Showcase Section */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Popular Tech Skills</h2>
            <p className="text-sm text-slate-400 mt-0.5">Find peers with specific stack proficiencies</p>
          </div>
          <Link to="/skills" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
            Explore Skills &rarr;
          </Link>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {skills.slice(0, 14).map((s) => (
            <Link
              key={s.id}
              to={`/skills?skill=${s.id}`}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-950/80 text-slate-300 hover:text-indigo-300 text-xs font-semibold border border-slate-700/60 hover:border-indigo-800/60 transition"
            >
              #{s.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
