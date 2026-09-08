import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  X,
  Users,
  Trophy,
  Github,
  FileText,
  Sparkles,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Button from "../components/common/Button";
import {
  POPULAR_SKILLS,
  POPULAR_ROLES,
  SUGGESTED_ROLES_CATEGORIES,
  PROJECT_TYPES,
} from "../utils/constants";
import teamApi from "../services/teamApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { extractErrorMessage } from "../utils/helpers";

export const CreateTeamPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: 5,
    projectName: "",
    projectDescription: "",
    teamVision: "",
    projectType: "Hackathon",
    hackathonName: "",
    hackathonUrl: "",
    hackathonDeadline: "",
    githubRepositoryUrl: "",
    documentationUrl: "",
    leaderRole: "",
    leaderCustomRole: "",
  });

  // Role distribution state: list of { roleName: string, slotCount: number }
  const [roleSlots, setRoleSlots] = useState([
    { roleName: "Backend Developer", slotCount: 2 },
    { roleName: "Frontend Developer", slotCount: 2 },
    { roleName: "Other / Custom", slotCount: 1 },
  ]);

  const [customRoleInput, setCustomRoleInput] = useState("");
  const [customRoleSlots, setCustomRoleSlots] = useState(1);
  const [showAddCustomRole, setShowAddCustomRole] = useState(false);

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const totalRoleSlots = roleSlots.reduce((sum, r) => sum + (Number(r.slotCount) || 1), 0);
  const maxMembersNum = Number(formData.maxMembers) || 5;
  const isSlotSumValid = totalRoleSlots === maxMembersNum;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMaxMembersChange = (newMax) => {
    const val = Math.max(2, Math.min(12, Number(newMax) || 2));
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
      setRoleSlots((prev) => [...prev, { roleName: roleName.trim(), slotCount: 1 }]);
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
      setRoleSlots((prev) => [...prev, { roleName: trimmed, slotCount: slots }]);
    }
    setCustomRoleInput("");
    setCustomRoleSlots(1);
    setShowAddCustomRole(false);
  };

  const handleAddSkill = (skillToAdd) => {
    const val = (skillToAdd || skillInput).trim();
    if (!val) return;
    if (!skills.includes(val)) {
      setSkills((prev) => [...prev, val]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = "Team name is required";
    if (!formData.description.trim()) errs.description = "Team description is required";

    if (totalRoleSlots !== maxMembersNum) {
      errs.roleSlots = `The sum of all role slots (${totalRoleSlots}) must equal the max team size (${maxMembersNum}).`;
    }

    if (formData.githubRepositoryUrl?.trim()) {
      const url = formData.githubRepositoryUrl.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        errs.githubRepositoryUrl = "GitHub URL must start with https:// or http://";
      }
    }

    if (formData.documentationUrl?.trim()) {
      const url = formData.documentationUrl.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        errs.documentationUrl = "Documentation URL must start with https:// or http://";
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (!user?.id) {
      toastError("You must be signed in to create a team.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        maxMembers: maxMembersNum,
        leaderId: user.id,
        leaderRole: formData.leaderRole.trim() || undefined,
        leaderCustomRole: formData.leaderCustomRole.trim() || undefined,
        projectName: formData.projectName.trim() || undefined,
        projectDescription: formData.projectDescription.trim() || undefined,
        teamVision: formData.teamVision.trim() || undefined,
        projectType: formData.projectType || undefined,
        hackathonName: formData.hackathonName.trim() || undefined,
        hackathonUrl: formData.hackathonUrl.trim() || undefined,
        hackathonDeadline: formData.hackathonDeadline.trim() || undefined,
        githubRepositoryUrl: formData.githubRepositoryUrl.trim() || undefined,
        documentationUrl: formData.documentationUrl.trim() || undefined,
        requiredSkills: skills,
        roleSlots: roleSlots.map((r) => ({
          roleName: r.roleName.trim(),
          slotCount: Number(r.slotCount) || 1,
        })),
        requiredRoles: roleSlots.map((r) => r.roleName.trim()),
      };

      const newTeam = await teamApi.createTeam(payload);

      success("Team created successfully!");
      navigate(`/teams/${newTeam.id}`);
    } catch (err) {
      const msg = extractErrorMessage(err, "Failed to create team. Please try again.");
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate("/teams")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Teams</span>
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-subtle">
        <div className="border-b border-slate-100 dark:border-slate-700 pb-5 mb-6">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Create a New Team
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Specify team size, role distribution with slots, project resources, and recruit collaborators.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Team Basics */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              1. Team Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Team Name"
                  name="name"
                  placeholder="e.g. Algoverse / Quantum Builders"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="team-maxMembers"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Max Team Size
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMaxMembersChange(maxMembersNum - 1)}
                    disabled={maxMembersNum <= 2}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    id="team-maxMembers"
                    name="maxMembers"
                    min="2"
                    max="12"
                    value={formData.maxMembers}
                    onChange={(e) => handleMaxMembersChange(e.target.value)}
                    className="flex-1 h-9 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleMaxMembersChange(maxMembersNum + 1)}
                    disabled={maxMembersNum >= 12}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="team-description"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Team Summary / Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="team-description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your team's objective, work style, and environment..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 font-normal">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Role Distribution (Multiple Slots) */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  2. Role Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Allocate exact member capacity across roles. Total slots must equal team size.
                </p>
              </div>

              {/* Live Slot Counter */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  isSlotSumValid
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {isSlotSumValid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                )}
                <span>
                  Total Slots: {totalRoleSlots} / {maxMembersNum} {isSlotSumValid ? "✓" : ""}
                </span>
              </div>
            </div>

            {errors.roleSlots && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.roleSlots}</span>
              </div>
            )}

            {/* Configured Role Slots List */}
            <div className="space-y-2">
              {roleSlots.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
                  No roles added yet. Click suggested roles or add a custom role below.
                </div>
              ) : (
                <div className="space-y-2">
                  {roleSlots.map((slot, index) => (
                    <div
                      key={`${slot.roleName}-${index}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white truncate block">
                          {slot.roleName}
                        </span>
                      </div>

                      {/* Stepper for slot count */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Slots:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSlotCountChange(index, -1)}
                            disabled={slot.slotCount <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">
                            {slot.slotCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSlotCountChange(index, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveRoleSlot(index)}
                          className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ml-1"
                          title="Remove role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Suggested Roles */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Suggested Roles (Click to add/increment):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleAddPredefinedRole(role)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-700 dark:hover:text-brand-300 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    + {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom Role Section */}
            {!showAddCustomRole ? (
              <button
                type="button"
                onClick={() => setShowAddCustomRole(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors pt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Role</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50/40 dark:bg-brand-950/30 space-y-3">
                <span className="text-xs font-bold text-brand-900 dark:text-brand-200">
                  Add Custom Role
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="e.g. Blockchain Developer, IoT Specialist"
                      value={customRoleInput}
                      onChange={(e) => setCustomRoleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomRole();
                        }
                      }}
                      className="w-full h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Slots:</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={customRoleSlots}
                      onChange={(e) => setCustomRoleSlots(Math.max(1, Number(e.target.value) || 1))}
                      className="w-14 h-8 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
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
                      setCustomRoleInput("");
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

            {/* Leader Assigned Role Picker */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Your Role as Leader (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  name="leaderRole"
                  value={formData.leaderRole}
                  onChange={handleChange}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                >
                  <option value="">Select your role...</option>
                  {roleSlots.map((r, i) => (
                    <option key={`${r.roleName}-${i}`} value={r.roleName}>
                      {r.roleName}
                    </option>
                  ))}
                </select>

                {(formData.leaderRole === "Other / Custom" || formData.leaderRole.toLowerCase() === "other") && (
                  <Input
                    name="leaderCustomRole"
                    placeholder="Specific role (e.g. ML Engineer)"
                    value={formData.leaderCustomRole}
                    onChange={handleChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Project Links & Resources */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              3. Project Resources & Links (Team-Level)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide project development repositories or documentation for your team.
            </p>

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
                placeholder="https://docs.google.com/... or Notion / Figma"
                value={formData.documentationUrl}
                onChange={handleChange}
                error={errors.documentationUrl}
                leftIcon={FileText}
              />
            </div>
          </div>

          {/* Section 4: Project Details & Vision */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              4. Project Details & Vision
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Project / Idea Name"
                name="projectName"
                placeholder="e.g. AI Waste Management System"
                value={formData.projectName}
                onChange={handleChange}
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
                htmlFor="project-description"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Project Description
              </label>
              <textarea
                id="project-description"
                name="projectDescription"
                rows={3}
                value={formData.projectDescription}
                onChange={handleChange}
                placeholder="What problem does this project solve? What is the core architecture or idea?"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="team-vision"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Team Vision
              </label>
              <textarea
                id="team-vision"
                name="teamVision"
                rows={2}
                value={formData.teamVision}
                onChange={handleChange}
                placeholder="What do you want to accomplish together (e.g. win SIH 2026, submit research paper, launch beta)?"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
              />
            </div>
          </div>

          {/* Section 5: Hackathon Details (Conditional) */}
          {formData.projectType === "Hackathon" && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200/70 dark:border-amber-800/60">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  5. Hackathon Details
                </h2>
              </div>

              <Input
                label="Hackathon Name"
                name="hackathonName"
                placeholder="e.g. Smart India Hackathon 2026"
                value={formData.hackathonName}
                onChange={handleChange}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Hackathon Website / Link"
                  name="hackathonUrl"
                  placeholder="https://sih.gov.in"
                  value={formData.hackathonUrl}
                  onChange={handleChange}
                />
                <Input
                  label="Deadline / Date"
                  name="hackathonDeadline"
                  placeholder="e.g. 15 Oct 2026"
                  value={formData.hackathonDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Section 6: Required Skills */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              6. Required Technical Skills
            </h2>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. React, Spring Boot, Python, PyTorch"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddSkill()}
                leftIcon={Plus}
              >
                Add
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Suggestions:</span>
              {POPULAR_SKILLS.filter((ps) => !skills.includes(ps))
                .slice(0, 6)
                .map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    +{s}
                  </button>
                ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate("/teams")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              disabled={!isSlotSumValid}
            >
              Create Team
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamPage;
