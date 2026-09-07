import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { PROJECT_TYPES, POPULAR_ROLES, POPULAR_SKILLS } from '../../utils/constants';
import { teamApi } from '../../services/teamApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/helpers';
import { Plus, X, Trophy } from 'lucide-react';

export const EditTeamModal = ({ isOpen, onClose, team, onTeamUpdated }) => {
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: 4,
    projectName: '',
    projectDescription: '',
    teamVision: '',
    projectType: 'Hackathon',
    hackathonName: '',
    hackathonUrl: '',
    hackathonDeadline: '',
    requiredSkills: [],
    requiredRoles: [],
  });

  const [customSkill, setCustomSkill] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || '',
        description: team.description || '',
        maxMembers: team.maxMembers || 4,
        projectName: team.projectName || '',
        projectDescription: team.projectDescription || '',
        teamVision: team.teamVision || '',
        projectType: team.projectType || 'Hackathon',
        hackathonName: team.hackathonName || '',
        hackathonUrl: team.hackathonUrl || '',
        hackathonDeadline: team.hackathonDeadline || '',
        requiredSkills: Array.isArray(team.requiredSkills)
          ? team.requiredSkills
          : team.requiredSkills
          ? Array.from(team.requiredSkills)
          : [],
        requiredRoles: Array.isArray(team.requiredRoles)
          ? team.requiredRoles
          : team.requiredRoles
          ? Array.from(team.requiredRoles)
          : [],
      });
    }
    setErrors({});
  }, [team, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddSkill = (skillToAdd) => {
    const s = (skillToAdd || customSkill).trim();
    if (!s) return;
    if (!formData.requiredSkills.includes(s)) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, s],
      }));
    }
    setCustomSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleAddRole = (roleToAdd) => {
    const r = (roleToAdd || customRole).trim();
    if (!r) return;
    if (!formData.requiredRoles.includes(r)) {
      setFormData((prev) => ({
        ...prev,
        requiredRoles: [...prev.requiredRoles, r],
      }));
    }
    setCustomRole('');
  };

  const handleRemoveRole = (roleToRemove) => {
    setFormData((prev) => ({
      ...prev,
      requiredRoles: prev.requiredRoles.filter((r) => r !== roleToRemove),
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Team name is required';
    if (!formData.description.trim()) errs.description = 'Team description is required';
    if (formData.maxMembers < 2) errs.maxMembers = 'Minimum 2 members required';
    if (formData.maxMembers > 10) errs.maxMembers = 'Maximum 10 members allowed';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const updated = await teamApi.updateTeam(team.id, formData);
      success('Team updated successfully');
      if (onTeamUpdated) {
        onTeamUpdated(updated);
      }
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to update team.');
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const projectTypeOptions = PROJECT_TYPES.map((pt) => ({
    label: pt,
    value: pt,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Team Details"
      description="Update your project scope, vision, required skills, and open positions."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Team Basic Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Team Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Team Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
              />
            </div>
            <div>
              <Input
                label="Max Members"
                name="maxMembers"
                type="number"
                min="2"
                max="10"
                value={formData.maxMembers}
                onChange={handleChange}
                error={errors.maxMembers}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="team-desc" className="block text-xs font-medium text-slate-700 mb-1.5">
              Team Summary / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="team-desc"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief overview of your team and its culture..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 resize-none"
              required
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Project & Vision */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Project & Vision
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Project / Idea Name"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="e.g. AI Drone Navigation"
            />

            <Select
              label="Project Type"
              name="projectType"
              value={formData.projectType}
              onChange={handleChange}
              options={projectTypeOptions}
            />
          </div>

          <div>
            <label htmlFor="project-desc" className="block text-xs font-medium text-slate-700 mb-1.5">
              Project Description
            </label>
            <textarea
              id="project-desc"
              name="projectDescription"
              rows={2}
              value={formData.projectDescription}
              onChange={handleChange}
              placeholder="What problem does your project solve and what are you building?"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 resize-none"
            />
          </div>

          <div>
            <label htmlFor="team-vision" className="block text-xs font-medium text-slate-700 mb-1.5">
              Team Vision & Goals
            </label>
            <textarea
              id="team-vision"
              name="teamVision"
              rows={2}
              value={formData.teamVision}
              onChange={handleChange}
              placeholder="What does the team want to accomplish together (e.g. Win Hackathon, publish paper, launch startup)?"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 resize-none"
            />
          </div>
        </div>

        {/* Hackathon Details (Conditional) */}
        {formData.projectType === 'Hackathon' && (
          <div className="space-y-3 pt-2 border-t border-slate-100 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Hackathon Information
              </h3>
            </div>
            <Input
              label="Hackathon Name"
              name="hackathonName"
              value={formData.hackathonName}
              onChange={handleChange}
              placeholder="e.g. Smart India Hackathon 2026"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Hackathon Website / Link"
                name="hackathonUrl"
                value={formData.hackathonUrl}
                onChange={handleChange}
                placeholder="https://sih.gov.in"
              />
              <Input
                label="Deadline / Date"
                name="hackathonDeadline"
                value={formData.hackathonDeadline}
                onChange={handleChange}
                placeholder="e.g. 15 Oct 2026"
              />
            </div>
          </div>
        )}

        {/* Required Roles / Positions */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Required Roles / Open Positions
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {formData.requiredRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200"
              >
                <span>{role}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role)}
                  className="p-0.5 hover:bg-brand-200/60 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Add position (e.g. ML Engineer, DevOps)..."
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddRole()}
              leftIcon={Plus}
            >
              Add Role
            </Button>
          </div>

          {/* Quick pick roles */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Popular:</span>
            {POPULAR_ROLES.filter((pr) => !formData.requiredRoles.includes(pr))
              .slice(0, 5)
              .map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleAddRole(role)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-50 border border-slate-200 hover:bg-brand-50 hover:text-brand-700 text-slate-600"
                >
                  + {role}
                </button>
              ))}
          </div>
        </div>

        {/* Required Skills */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Required Technical Skills
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {formData.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 hover:bg-slate-300 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="Add skill (e.g. React, Spring Boot, PyTorch)..."
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddSkill()}
              leftIcon={Plus}
            >
              Add Skill
            </Button>
          </div>

          {/* Quick pick skills */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="text-[11px] text-slate-400 mr-1">Popular:</span>
            {POPULAR_SKILLS.filter((ps) => !formData.requiredSkills.includes(ps))
              .slice(0, 6)
              .map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSkill(skill)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-50 border border-slate-200 hover:bg-brand-50 hover:text-brand-700 text-slate-600"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTeamModal;
