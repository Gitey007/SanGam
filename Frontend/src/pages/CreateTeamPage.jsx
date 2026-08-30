import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Users } from "lucide-react";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import { POPULAR_SKILLS } from "../utils/constants";
import teamApi from "../services/teamApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const CreateTeamPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: "4",
  });

  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!formData.name.trim()) errs.name = "Team name is required";
    if (!formData.description.trim())
      errs.description = "Description is required";

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/teams")}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Teams</span>
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-subtle">
        <div className="border-b border-slate-100 pb-5 mb-6">
          <h1 className="text-xl font-bold text-slate-900">
            Create a New Team
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify project requirements and recruit student collaborators.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Team / Project Name"
            name="name"
            placeholder="e.g. Algoverse Engine"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <div>
            <label
              htmlFor="team-description"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Project Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="team-description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you are building, the problem it solves, and the team's objectives..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 resize-none"
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-600 font-normal">
                {errors.description}
              </p>
            )}
          </div>

          {/* Required Skills Tag Input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Required Skills
            </label>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. React, Spring Boot, Figma"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
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

            {/* Selected Skills Badges */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-xs text-slate-700"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Suggestion Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400">Suggestions:</span>
              {POPULAR_SKILLS.slice(0, 6).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  +{s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="team-maxMembers"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Maximum Team Size
            </label>
            <select
              id="team-maxMembers"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            >
              <option value="2">2 Members</option>
              <option value="3">3 Members</option>
              <option value="4">4 Members</option>
              <option value="5">5 Members</option>
              <option value="6">6 Members</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
