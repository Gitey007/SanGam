import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Code2,
  Plus,
  Trash2,
  Edit2,
  FolderGit2,
  Trophy,
  ExternalLink,
  Github,
  Globe,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import userApi from '../services/userApi';
import ProfileHeader from '../components/profile/ProfileHeader';
import EditProfileModal from '../components/profile/EditProfileModal';
import AddEditAchievementModal from '../components/profile/AddEditAchievementModal';
import AchievementDetailsModal from '../components/profile/AchievementDetailsModal';
import AddEditProjectModal from '../components/profile/AddEditProjectModal';
import { ProfileSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ConfirmModal from '../components/common/ConfirmModal';
import { POPULAR_SKILLS, getAchievementCategoryBadgeClass } from '../utils/constants';
import { extractErrorMessage } from '../utils/helpers';

export const ProfilePage = () => {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const { success, error: toastError } = useToast();

  const isOwnProfile = !id || (authUser?.id && String(authUser.id) === String(id));
  const targetId = id || authUser?.id;

  const [profile, setProfile] = useState(isOwnProfile ? authUser : null);
  const [isLoading, setIsLoading] = useState(!profile);
  const [error, setError] = useState(null);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [selectedAchievementDetails, setSelectedAchievementDetails] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Skill management inline state
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!targetId) {
      if (authUser) {
        setProfile(authUser);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await userApi.getUser(targetId);
      setProfile(data);
    } catch (err) {
      console.warn('Real API GET /api/users/:id error:', err);
      const errorMsg = extractErrorMessage(err, 'Unable to load student profile.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  // Skill Actions
  const handleAddSkill = async (skillToAdd) => {
    const skillName = (skillToAdd || newSkillInput).trim();
    if (!skillName) return;

    const currentSkills = Array.isArray(profile.skills)
      ? profile.skills
      : typeof profile.skills === 'string'
      ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (currentSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      toastError(`Skill "${skillName}" is already added.`);
      return;
    }

    setIsAddingSkill(true);
    try {
      const updatedProfile = await userApi.addSkill(targetId, skillName);
      setProfile(updatedProfile);
      setNewSkillInput('');
      success(`Added skill "${skillName}"`);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to add skill.');
      toastError(msg);
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = async (skillName) => {
    try {
      const updatedProfile = await userApi.removeSkill(targetId, skillName);
      setProfile(updatedProfile);
      success(`Removed skill "${skillName}"`);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to remove skill.');
      toastError(msg);
    }
  };

  // Achievement Actions
  const handleDeleteAchievementClick = (achievement) => {
    setDeleteConfirmItem({
      type: 'achievement',
      id: achievement.id,
      title: achievement.title || 'this achievement',
    });
  };

  // Project Actions
  const handleDeleteProjectClick = (project) => {
    setDeleteConfirmItem({
      type: 'project',
      id: project.id,
      title: project.name || 'this project',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setIsDeletingItem(true);
    try {
      if (deleteConfirmItem.type === 'achievement') {
        await userApi.deleteAchievement(targetId, deleteConfirmItem.id);
        success('Achievement deleted');
        setProfile((prev) => ({
          ...prev,
          achievements: (prev.achievements || []).filter(
            (a) => a.id !== deleteConfirmItem.id
          ),
        }));
      } else if (deleteConfirmItem.type === 'project') {
        await userApi.deleteProject(targetId, deleteConfirmItem.id);
        success('Project deleted');
        setProfile((prev) => ({
          ...prev,
          projects: (prev.projects || []).filter(
            (p) => p.id !== deleteConfirmItem.id
          ),
        }));
      }
      setDeleteConfirmItem(null);
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        `Failed to delete ${deleteConfirmItem.type}.`
      );
      toastError(msg);
    } finally {
      setIsDeletingItem(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Student not found"
          message={error}
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Profile unavailable"
          message="We could not load this student profile."
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  const skillsList = Array.isArray(profile.skills)
    ? profile.skills
    : typeof profile.skills === 'string'
    ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const achievementsList = Array.isArray(profile.achievements)
    ? profile.achievements
    : [];

  const projectsList = Array.isArray(profile.projects)
    ? profile.projects
    : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Profile Header (Basic info, bio, social links, looking for) */}
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* Skills Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-subtle transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Technical Skills & Expertise
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {skillsList.length} {skillsList.length === 1 ? 'skill' : 'skills'}
          </span>
        </div>

        {/* Existing skills badges */}
        <div className="pt-4">
          {skillsList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition-colors"
                >
                  <span>{skill}</span>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="p-0.5 rounded-full hover:bg-slate-300/80 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      title={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">No skills added yet.</p>
          )}
        </div>

        {/* Add Skill Form (Owner only) */}
        {isOwnProfile && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Add New Skill
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddSkill();
              }}
              className="flex gap-2 max-w-md"
            >
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="e.g. Next.js, Kubernetes, PyTorch..."
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isAddingSkill}
                leftIcon={Plus}
              >
                Add
              </Button>
            </form>

            {/* Quick-add popular skills suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span className="text-xs text-slate-400 dark:text-slate-500">Suggestions:</span>
              {POPULAR_SKILLS.filter(
                (ps) => !skillsList.some((s) => s.toLowerCase() === ps.toLowerCase())
              )
                .slice(0, 6)
                .map((ps) => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => handleAddSkill(ps)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-slate-700 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-800 transition-colors"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{ps}</span>
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects Showcase Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-subtle transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-brand-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Featured Projects
            </h2>
          </div>

          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingProject(null);
                setIsProjectModalOpen(true);
              }}
              leftIcon={Plus}
            >
              Add Project
            </Button>
          )}
        </div>

        <div className="pt-5">
          {projectsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectsList.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {project.name}
                      </h3>

                      {isOwnProfile && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProject(project);
                              setIsProjectModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                            title="Edit project"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProjectClick(project)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-3">
                      {project.description}
                    </p>

                    {project.techStack && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.split(',').map((tech, i) => (
                          <span
                            key={`${tech}-${i}`}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl.startsWith('http') ? project.githubUrl : `https://${project.githubUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors border border-transparent dark:border-slate-700"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl.startsWith('http') ? project.liveUrl : `https://${project.liveUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-medium transition-colors border border-brand-200/60 dark:border-brand-800/60"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <FolderGit2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No projects showcased yet.</p>
              {isOwnProfile && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Add projects to showcase your technical skills and experience to team leaders.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-subtle transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Achievements & Recognition
            </h2>
          </div>

          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingAchievement(null);
                setIsAchievementModalOpen(true);
              }}
              leftIcon={Plus}
            >
              Add Achievement
            </Button>
          )}
        </div>

        <div className="pt-5">
          {achievementsList.length > 0 ? (
            <div className="space-y-3">
              {achievementsList.map((ach) => (
                <div
                  key={ach.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3.5 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Category & Title */}
                  <div className="flex flex-wrap items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border transition-colors duration-150 shrink-0 ${getAchievementCategoryBadgeClass(
                        ach.category
                      )}`}
                    >
                      {ach.category || 'Other'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {ach.title}
                    </h3>
                  </div>

                  {/* Actions: View Details, Edit, Delete */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedAchievementDetails(ach)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <span>View Details</span>
                    </button>

                    {isOwnProfile && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAchievement(ach);
                            setIsAchievementModalOpen(true);
                          }}
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Edit achievement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAchievementClick(ach)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete achievement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <Trophy className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No achievements added yet.</p>
              {isOwnProfile && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Highlight your hackathon awards, certifications, and contest milestones.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userProfile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Add / Edit Achievement Modal */}
      {isOwnProfile && (
        <AddEditAchievementModal
          isOpen={isAchievementModalOpen}
          onClose={() => setIsAchievementModalOpen(false)}
          userId={targetId}
          achievement={editingAchievement}
          onSaved={fetchProfile}
        />
      )}

      {/* View Achievement Details Modal */}
      <AchievementDetailsModal
        isOpen={Boolean(selectedAchievementDetails)}
        onClose={() => setSelectedAchievementDetails(null)}
        achievement={selectedAchievementDetails}
      />

      {/* Add / Edit Project Modal */}
      {isOwnProfile && (
        <AddEditProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          userId={targetId}
          project={editingProject}
          onSaved={fetchProfile}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmItem)}
        onClose={() => setDeleteConfirmItem(null)}
        onConfirm={handleConfirmDelete}
        title={
          deleteConfirmItem?.type === 'achievement'
            ? 'Delete Achievement'
            : 'Delete Project'
        }
        message={`Are you sure you want to permanently delete "${deleteConfirmItem?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeletingItem}
      />
    </div>
  );
};

export default ProfilePage;

