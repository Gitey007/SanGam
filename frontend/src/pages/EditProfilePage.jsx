import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentUserProfile, updateUserProfile } from '../api/users';
import { getAllSkills, addSkillToUser, removeSkillFromUser } from '../api/skills';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  User, 
  School, 
  BookOpen, 
  Calendar, 
  FileText, 
  Sparkles, 
  Plus, 
  X, 
  Check, 
  ArrowLeft 
} from 'lucide-react';

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    college: '',
    branch: '',
    year: 1,
    bio: '',
  });

  const [userSkills, setUserSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillLoading, setSkillLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileData, skillsData] = await Promise.all([
        getCurrentUserProfile(),
        getAllSkills(),
      ]);

      setFormData({
        name: profileData.name || '',
        college: profileData.college || '',
        branch: profileData.branch || '',
        year: profileData.year || 1,
        bio: profileData.bio || '',
      });

      setUserSkills(profileData.skills || []);
      setAllSkills(skillsData || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateUserProfile(user.id, formData);
      await refreshUser();
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkillId) return;
    setSkillLoading(true);
    setError('');
    try {
      await addSkillToUser(user.id, selectedSkillId);
      const skillToAdd = allSkills.find((s) => s.id === Number(selectedSkillId));
      if (skillToAdd && !userSkills.includes(skillToAdd.name)) {
        setUserSkills((prev) => [...prev, skillToAdd.name]);
      }
      setSelectedSkillId('');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill.');
    } finally {
      setSkillLoading(false);
    }
  };

  const handleRemoveSkill = async (skillName) => {
    const skillObj = allSkills.find((s) => s.name === skillName);
    if (!skillObj) return;

    setSkillLoading(true);
    setError('');
    try {
      await removeSkillFromUser(user.id, skillObj.id);
      setUserSkills((prev) => prev.filter((s) => s !== skillName));
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove skill.');
    } finally {
      setSkillLoading(false);
    }
  };

  // Available skills to add (skills not already in user's profile)
  const availableSkills = allSkills.filter((s) => !userSkills.includes(s.name));

  if (loading) {
    return <LoadingSpinner message="Loading profile editor..." />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Edit Profile</h1>
          <p className="text-sm text-slate-400 mt-1">Keep your details and skills up to date</p>
        </div>
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white transition outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                College / University *
              </label>
              <input
                type="text"
                name="college"
                required
                value={formData.college}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white transition outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Branch / Major *
              </label>
              <input
                type="text"
                name="branch"
                required
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white transition outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Year of Study *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white transition outline-none"
              >
                <option value={1}>1st Year (Freshman)</option>
                <option value={2}>2nd Year (Sophomore)</option>
                <option value={3}>3rd Year (Junior)</option>
                <option value={4}>4th Year (Senior)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Share your interests, hackathon goals, or tech passions..."
              className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white transition outline-none resize-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-6 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Skills Management Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Manage Your Skills
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Skills help other students find you when assembling project teams
          </p>
        </div>

        {/* Current skills */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Current Skills ({userSkills.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {userSkills.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No skills added yet.</p>
            ) : (
              userSkills.map((skillName) => (
                <span
                  key={skillName}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/80 text-indigo-300 text-xs font-bold border border-indigo-800/80"
                >
                  <span>{skillName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skillName)}
                    disabled={skillLoading}
                    title="Remove skill"
                    className="text-indigo-400 hover:text-rose-400 transition ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Add new skill */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Add a Skill
          </p>
          <div className="flex items-center gap-3">
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white outline-none"
            >
              <option value="">-- Choose a skill to add --</option>
              {availableSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddSkill}
              disabled={!selectedSkillId || skillLoading}
              className="py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
