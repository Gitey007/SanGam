import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getCurrentUserProfile } from '../api/users';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  User, 
  Mail, 
  School, 
  BookOpen, 
  Calendar, 
  Edit3, 
  Sparkles, 
  FileText 
} from 'lucide-react';

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get('id');
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = !userIdParam || (currentUser && currentUser.id === Number(userIdParam));

  useEffect(() => {
    fetchProfile();
  }, [userIdParam, currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      if (userIdParam) {
        const data = await getUserProfile(userIdParam);
        setProfile(data);
      } else {
        const data = await getCurrentUserProfile();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <ErrorMessage message={error || 'Profile not found.'} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-500/20">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
              <p className="text-sm text-indigo-400 font-medium flex items-center gap-1.5 mt-1">
                <School className="w-4 h-4" />
                {profile.college}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {profile.branch} • Year {profile.year}
              </p>
            </div>
          </div>

          {isOwnProfile && (
            <Link
              to="/profile/edit"
              className="self-start sm:self-auto inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Link>
          )}
        </div>

        {/* Bio Section */}
        {profile.bio && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Me</h3>
            <p className="text-sm text-slate-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Academic Details */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white mb-4">Academic & Contact Info</h3>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Email:</span>
            <span className="font-medium text-white truncate">{profile.email}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <School className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Institution:</span>
            <span className="font-medium text-white truncate">{profile.college}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Branch:</span>
            <span className="font-medium text-white">{profile.branch}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-slate-400">Year of Study:</span>
            <span className="font-medium text-white">Year {profile.year}</span>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Verified Skills ({profile.skills?.length || 0})
            </h3>
            {isOwnProfile && (
              <Link to="/profile/edit" className="text-xs font-semibold text-indigo-400 hover:underline">
                Manage Skills
              </Link>
            )}
          </div>

          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.skills.map((skillName) => (
                <span
                  key={skillName}
                  className="px-3 py-1.5 rounded-xl bg-indigo-950/70 text-indigo-300 text-xs font-bold border border-indigo-800/60 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  {skillName}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">No skills added to this profile yet.</p>
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="inline-block mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Add skills now &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
