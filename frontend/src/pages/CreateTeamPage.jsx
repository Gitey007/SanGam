import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeam } from '../api/teams';
import { Users, PlusCircle, FileText, ArrowRight } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

export default function CreateTeamPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 4,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'maxMembers' ? parseInt(value, 10) || 4 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newTeam = await createTeam(formData);
      navigate(`/teams/${newTeam.id}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to create team. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-4">
          <PlusCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Create a New Team</h1>
        <p className="text-sm text-slate-400 mt-2">
          Start a team for an upcoming hackathon, course project, or research
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        <ErrorMessage message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Team Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Neural Ninjas, Byte Squad"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 transition outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Project Description / Goals
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project idea, desired tech stack, and what skills you are seeking in teammates..."
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white placeholder-slate-500 transition outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Maximum Team Capacity (including Leader) *
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                name="maxMembers"
                min={2}
                max={10}
                required
                value={formData.maxMembers}
                onChange={handleChange}
                className="w-28 px-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm text-white text-center font-bold outline-none"
              />
              <span className="text-xs text-slate-400">
                Recommended for hackathons: 4 members
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 leading-relaxed">
            <span className="font-bold">Note:</span> As creator, you will automatically become the
            Team Leader. You will be able to review join requests and manage members.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Launch Team</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
