import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Users, Trophy, Sparkles } from "lucide-react";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Button from "../components/common/Button";
import { POPULAR_SKILLS, POPULAR_ROLES, PROJECT_TYPES } from "../utils/constants";
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
    maxMembers: "4",
    projectName: "",
    projectDescription: "",
    teamVision: "",
    projectType: "Hackathon",
    hackathonName: "",
    hackathonUrl: "",
    hackathonDeadline: "",
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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

  const handleAddRole = (roleToAdd) => {
    const val = (roleToAdd || roleInput).trim();
    if (!val) return;
    if (!roles.includes(val)) {
      setRoles((prev) => [...prev, val]);
    }
    setRoleInput("");
  };

  const handleRemoveRole = (roleToRemove) => {
    setRoles((prev) => prev.filter((r) => r !== roleToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = "Team name is required";
    if (!formData.description.trim()) errs.description = "Team description is required";

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
        maxMembers: parseInt(formData.maxMembers, 10),
        leaderId: user.id,
        projectName: formData.projectName.trim() || undefined,
        projectDescription: formData.projectDescription.trim() || undefined,
        teamVision: formData.teamVision.trim() || undefined,
        projectType: formData.projectType || undefined,
        hackathonName: formData.hackathonName.trim() || undefined,
        hackathonUrl: formData.hackathonUrl.trim() || undefined,
        hackathonDeadline: formData.hackathonDeadline.trim() || undefined,
        requiredSkills: skills,
        requiredRoles: roles,
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
            Specify project requirements, required roles, and recruit student collaborators.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Team Basics */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                <select
                  id="team-maxMembers"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
                >
                  <option value="2">2 Members</option>
                  <option value="3">3 Members</option>
                  <option value="4">4 Members</option>
                  <option value="5">5 Members</option>
                  <option value="6">6 Members</option>
                  <option value="8">8 Members</option>
                </select>
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
                <p className="mt-1.5 text-xs text-rose-600 font-normal">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Project & Vision */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              2. Project Details & Vision
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

          {/* Section 3: Hackathon Details (Conditional) */}
          {formData.projectType === "Hackathon" && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200/70 dark:border-amber-800/60">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  3. Hackathon Details
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

          {/* Section 4: Required Roles / Positions */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {formData.projectType === "Hackathon" ? "4. Required Roles / Positions" : "3. Required Roles / Positions"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Specify what kind of teammates you are looking to recruit:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. ML Engineer, Backend Developer, UI Designer"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRole();
                  }
                }}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddRole()}
                leftIcon={Plus}
              >
                Add
              </Button>
            </div>

            {roles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-brand-50/50 dark:bg-brand-950/30 rounded-lg border border-brand-100 dark:border-brand-900">
                {roles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-800 dark:text-brand-300"
                  >
                    <span>{r}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(r)}
                      className="text-brand-400 hover:text-brand-700 dark:hover:text-brand-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Popular Roles:</span>
              {POPULAR_ROLES.filter((pr) => !roles.includes(pr))
                .slice(0, 5)
                .map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => handleAddRole(pr)}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-700 dark:hover:text-brand-300 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    +{pr}
                  </button>
                ))}
            </div>
          </div>

          {/* Section 5: Required Skills */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {formData.projectType === "Hackathon" ? "5. Required Technical Skills" : "4. Required Technical Skills"}
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

