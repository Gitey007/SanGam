import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import {
  PROJECT_TYPES,
  POPULAR_ROLES,
  POPULAR_SKILLS,
} from '../../utils/constants';
import { teamApi } from '../../services/teamApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/helpers';
import {
  Plus,
  Minus,
  Trash2,
  X,
  Trophy,
  Github,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

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
    joinDeadline: '',
    githubRepositoryUrl: '',
    documentationUrl: '',
  });

  const [roleSlots, setRoleSlots] = useState([]);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [customRoleSlots, setCustomRoleSlots] = useState(1);
  const [showAddCustomRole, setShowAddCustomRole] = useState(false);

  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
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
        joinDeadline: team.joinDeadline ? team.joinDeadline.slice(0, 16) : '',
        githubRepositoryUrl: team.githubRepositoryUrl || '',
        documentationUrl: team.documentationUrl || '',
      });

      if (team.roleSlots && team.roleSlots.length > 0) {
        setRoleSlots(
          team.roleSlots.map((r) => ({
            roleName: r.roleName,
            slotCount: r.slotCount || 1,
          }))
        );
      } else if (team.requiredRoles && team.requiredRoles.length > 0) {
        const rolesArr = Array.isArray(team.requiredRoles)
          ? team.requiredRoles
          : Array.from(team.requiredRoles);
        setRoleSlots(rolesArr.map((r) => ({ roleName: r, slotCount: 1 })));
      } else {
        setRoleSlots([]);
      }

      setSkills(
        Array.isArray(team.requiredSkills)
          ? team.requiredSkills
          : team.requiredSkills
          ? Array.from(team.requiredSkills)
          : []
      );
    }
    setErrors({});
    setShowAddCustomRole(false);
  }, [team, isOpen]);

  const totalRoleSlots = roleSlots.reduce(
    (sum, r) => sum + (Number(r.slotCount) || 1),
    0
  );
  const maxMembersNum = Number(formData.maxMembers) || 4;
  const isSlotSumValid =
    roleSlots.length === 0 || totalRoleSlots === maxMembersNum;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMaxMembersChange = (newMax) => {
    const minAllowed = team?.memberCount || 2;
    const val = Math.max(minAllowed, Math.min(12, Number(newMax) || 2));
    setFormData((prev) => ({ ...prev, maxMembers: val }));
  };

  const handleSlotCountChange = (index, delta) => {
    setRoleSlots((prev) => {
      const updated = [...prev];
      const newCount = Math.max(1, (updated[index].slotCount || 1) + delta);
      updated[index] = { ...updated[index], slotCount: newCount };
      return updated;
    });
  };

  const handleRemoveRoleSlot = (index) => {
    setRoleSlots((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddPredefinedRole = (roleName) => {
    if (!roleName) return;
    const existingIndex = roleSlots.findIndex(
      (r) => r.roleName.toLowerCase() === roleName.toLowerCase()
    );
    if (existingIndex >= 0) {
      handleSlotCountChange(existingIndex, 1);
    } else {
      setRoleSlots((prev) => [
        ...prev,
        { roleName: roleName.trim(), slotCount: 1 },
      ]);
    }
  };

  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim();
    if (!trimmed) return;
    const slots = Math.max(1, Number(customRoleSlots) || 1);
    const existingIndex = roleSlots.findIndex(
      (r) => r.roleName.toLowerCase() === trimmed.toLowerCase()
    );
    if (existingIndex >= 0) {
      setRoleSlots((prev) => {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          slotCount: updated[existingIndex].slotCount + slots,
        };
        return updated;
      });
    } else {
      setRoleSlots((prev) => [
        ...prev,
        { roleName: trimmed, slotCount: slots },
      ]);
    }
    setCustomRoleInput('');
    setCustomRoleSlots(1);
    setShowAddCustomRole(false);
  };

  const handleAddSkill = (skillToAdd) => {
    const s = (skillToAdd || customSkill).trim();
    if (!s) return;
    if (!skills.includes(s)) {
      setSkills((prev) => [...prev, s]);
    }
    setCustomSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Team name is required';
    if (!formData.description.trim())
      errs.description = 'Team description is required';

    if (roleSlots.length > 0 && totalRoleSlots !== maxMembersNum) {
      errs.roleSlots = `The sum of role slots (${totalRoleSlots}) must equal the max team size (${maxMembersNum}).`;
    }

    if (formData.githubRepositoryUrl?.trim()) {
      const url = formData.githubRepositoryUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        errs.githubRepositoryUrl =
          'GitHub URL must start with https:// or http://';
      }
    }

    if (formData.documentationUrl?.trim()) {
      const url = formData.documentationUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        errs.documentationUrl =
          'Documentation URL must start with https:// or http://';
      }
    }

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
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        maxMembers: maxMembersNum,
        projectName: formData.projectName.trim() || undefined,
        projectDescription: formData.projectDescription.trim() || undefined,
        teamVision: formData.teamVision.trim() || undefined,
        projectType: formData.projectType || undefined,
        hackathonName: formData.hackathonName.trim() || undefined,
        hackathonUrl: formData.hackathonUrl.trim() || undefined,
        hackathonDeadline: formData.hackathonDeadline.trim() || undefined,
        joinDeadline: formData.joinDeadline || undefined,
        githubRepositoryUrl:
          formData.githubRepositoryUrl.trim() || undefined,
        documentationUrl: formData.documentationUrl.trim() || undefined,
        requiredSkills: skills,
        roleSlots: roleSlots.map((r) => ({
          roleName: r.roleName.trim(),
          slotCount: Number(r.slotCount) || 1,
        })),
        requiredRoles: roleSlots.map((r) => r.roleName.trim()),
      };

      const updated = await teamApi.updateTeam(team.id, payload);
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

  const modalFooter = (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        disabled={isLoading}
        className="shrink-0"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="edit-team-form"
        variant="primary"
        size="sm"
        isLoading={isLoading}
        disabled={isLoading || (roleSlots.length > 0 && !isSlotSumValid)}
        className="shrink-0"
      >
        Save Changes
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Team Details"
      description="Update team size, role distribution, project resources, and technical requirements."
      maxWidth="max-w-2xl"
      footer={modalFooter}
    >
      <form id="edit-team-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Team Basic Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            1. Team Details
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
              <label
                htmlFor="team-maxMembers-edit"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Max Team Size
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    handleMaxMembersChange(maxMembersNum - 1)
                  }
                  disabled={
                    maxMembersNum <= (team?.memberCount || 2)
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  id="team-maxMembers-edit"
                  name="maxMembers"
                  min={team?.memberCount || 2}
                  max="12"
                  value={formData.maxMembers}
                  onChange={(e) =>
                    handleMaxMembersChange(e.target.value)
                  }
                  className="w-12 h-8 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleMaxMembersChange(maxMembersNum + 1)
                  }
                  disabled={maxMembersNum >= 12}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="team-desc-edit"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Team Summary / Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="team-desc-edit"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="A brief overview of your team and its culture..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
              required
            />
              {errors.description && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-normal">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Join / Invite Deadline (Optional)"
                name="joinDeadline"
                type="datetime-local"
                value={formData.joinDeadline}
                onChange={handleChange}
                helperText="New join requests and invitations will be accepted until this date/time."
              />
            </div>
          </div>

        {/* Section 2: Role Distribution (Multiple Slots) */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                2. Role Distribution
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total slot capacity must equal max team size ({maxMembersNum}).
              </p>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                isSlotSumValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {isSlotSumValid ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              )}
              <span>
                Total Slots: {totalRoleSlots} / {maxMembersNum}{' '}
                {isSlotSumValid ? '✓' : ''}
              </span>
            </div>
          </div>

          {errors.roleSlots && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.roleSlots}</span>
            </div>
          )}

          {/* Configured Role Slots List */}
          <div className="space-y-1.5">
            {roleSlots.map((slot, index) => (
              <div
                key={`${slot.roleName}-${index}`}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60"
              >
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {slot.roleName}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    Slots:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleSlotCountChange(index, -1)}
                      disabled={slot.slotCount <= 1}
                      className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {slot.slotCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSlotCountChange(index, 1)}
                      className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveRoleSlot(index)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Remove role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Suggested Roles */}
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1">
              Suggested:
            </span>
            {POPULAR_ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleAddPredefinedRole(role)}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-700 dark:hover:text-brand-300 text-slate-600 dark:text-slate-300 transition-colors"
              >
                + {role}
              </button>
            ))}
          </div>

          {/* Add Custom Role */}
          {!showAddCustomRole ? (
            <button
              type="button"
              onClick={() => setShowAddCustomRole(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors pt-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Custom Role</span>
            </button>
          ) : (
            <div className="p-3 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50/40 dark:bg-brand-950/30 space-y-2">
              <span className="text-xs font-bold text-brand-900 dark:text-brand-200">
                Add Custom Role
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="e.g. Blockchain Developer"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Slots:
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customRoleSlots}
                    onChange={(e) =>
                      setCustomRoleSlots(
                        Math.max(1, Number(e.target.value) || 1)
                      )
                    }
                    className="w-12 h-8 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setShowAddCustomRole(false);
                    setCustomRoleInput('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="xs"
                  onClick={handleAddCustomRole}
                  disabled={!customRoleInput.trim()}
                >
                  Add Role
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Project Resources & Links (Team-Level) */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            3. Project Resources & Links (Team-Level)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub Repository"
              name="githubRepositoryUrl"
              placeholder="https://github.com/team-org/project"
              value={formData.githubRepositoryUrl}
              onChange={handleChange}
              error={errors.githubRepositoryUrl}
              leftIcon={Github}
            />

            <Input
              label="Documentation / Resources (Optional)"
              name="documentationUrl"
              placeholder="https://docs.google.com/... or Notion"
              value={formData.documentationUrl}
              onChange={handleChange}
              error={errors.documentationUrl}
              leftIcon={FileText}
            />
          </div>
        </div>

        {/* Section 4: Project & Vision */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            4. Project & Vision
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
            <label
              htmlFor="project-desc-edit"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Project Description
            </label>
            <textarea
              id="project-desc-edit"
              name="projectDescription"
              rows={2}
              value={formData.projectDescription}
              onChange={handleChange}
              placeholder="What problem does your project solve and what are you building?"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="team-vision-edit"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Team Vision & Goals
            </label>
            <textarea
              id="team-vision-edit"
              name="teamVision"
              rows={2}
              value={formData.teamVision}
              onChange={handleChange}
              placeholder="What does the team want to accomplish together?"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
            />
          </div>
        </div>

        {/* Hackathon Details (Conditional) */}
        {formData.projectType === 'Hackathon' && (
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
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

        {/* Section 5: Required Skills */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            5. Required Technical Skills
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full"
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
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
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

          <div className="flex flex-wrap gap-1 mt-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1">
              Popular:
            </span>
            {POPULAR_SKILLS.filter((ps) => !skills.includes(ps))
              .slice(0, 6)
              .map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSkill(skill)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-700 dark:hover:text-brand-300 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  + {skill}
                </button>
              ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditTeamModal;
