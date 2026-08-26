import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getAllSkills, createSkill } from '../api/skills';
import { getUsersBySkill } from '../api/users';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Users, 
  School, 
  BookOpen, 
  ArrowRight, 
  Check 
} from 'lucide-react';

export default function SkillsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedSkillParam = searchParams.get('skill');

  const { isAuthenticated } = useAuth();

  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSkillName, setNewSkillName] = useState('');
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (selectedSkillParam && skills.length > 0) {
      const found = skills.find((s) => s.id === Number(selectedSkillParam));
      if (found) {
        handleSelectSkill(found);
      }
    }
  }, [selectedSkillParam, skills]);

  const fetchSkills = async () => {
    setLoadingSkills(true);
    setError('');
    try {
      const data = await getAllSkills();
      setSkills(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load skills.');
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleSelectSkill = async (skill) => {
    setSelectedSkill(skill);
    setSearchParams({ skill: skill.id });
    setLoadingStudents(true);
    try {
      const usersData = await getUsersBySkill(skill.id);
      setStudents(usersData);
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch students with skill ${skill.name}`);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setCreatingSkill(true);
    setError('');
    setSuccess('');
    try {
      const created = await createSkill(newSkillName.trim());
      setSuccess(`Skill "${created.name}" created successfully!`);
      setNewSkillName('');
      await fetchSkills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create skill.');
    } finally {
      setCreatingSkill(false);
    }
  };

  const filteredSkills = skills.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            Skills & Teammate Discovery
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse technical proficiencies and discover college peers by stack
          </p>
        </div>

        {/* Create Skill Input */}
        {isAuthenticated && (
          <form onSubmit={handleCreateSkill} className="flex items-center gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Suggest new skill..."
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none w-48"
            />
            <button
              type="submit"
              disabled={creatingSkill || !newSkillName.trim()}
              className="py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </form>
        )}
      </div>

      <ErrorMessage message={error} onClose={() => setError('')} />

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      {/* Skills Grid & Search */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills (e.g. React, Java, Docker)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>

        {loadingSkills ? (
          <LoadingSpinner message="Loading skills catalog..." />
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {filteredSkills.map((skill) => {
              const isSelected = selectedSkill?.id === skill.id;
              return (
                <button
                  key={skill.id}
                  onClick={() => handleSelectSkill(skill)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                  }`}
                >
                  <span>{skill.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Students with Selected Skill Section */}
      {selectedSkill && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">
                Students proficient in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                  {selectedSkill.name}
                </span>
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {students.length} {students.length === 1 ? 'student' : 'students'} found
            </span>
          </div>

          {loadingStudents ? (
            <LoadingSpinner message={`Searching students with ${selectedSkill.name}...`} />
          ) : students.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/50">
              No students currently list {selectedSkill.name} in their profile.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Link
                  key={student.id}
                  to={`/profile?id=${student.id}`}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 transition group hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {student.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                          {student.name}
                        </h4>
                        <p className="text-xs text-slate-400">{student.branch} • Year {student.year}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                      <School className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{student.college}</span>
                    </p>

                    {student.skills && student.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {student.skills.slice(0, 4).map((sName) => (
                          <span
                            key={sName}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              sName.toLowerCase() === selectedSkill.name.toLowerCase()
                                ? 'bg-indigo-900 text-indigo-200 border border-indigo-700'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {sName}
                          </span>
                        ))}
                        {student.skills.length > 4 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{student.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition pt-2 border-t border-slate-900">
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
