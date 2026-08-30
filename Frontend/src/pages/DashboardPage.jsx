import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import { formatCollege, formatBranchYear } from '../utils/helpers';
import { POPULAR_SKILLS } from '../utils/constants';
import teamApi from '../services/teamApi';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamApi.getTeams();
        setTeams(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (err) {
        console.error('Error fetching dashboard teams:', err);
      } finally {
        setIsLoadingTeams(false);
      }
    };
    fetchTeams();
  }, []);

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
