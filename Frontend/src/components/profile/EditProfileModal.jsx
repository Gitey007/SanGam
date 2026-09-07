import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { YEAR_OPTIONS, COLLABORATION_OPTIONS } from '../../utils/constants';
import { userApi } from '../../services/userApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/helpers';

export const EditProfileModal = ({ isOpen, onClose, userProfile, onProfileUpdated }) => {
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    college: '',
    branch: '',
    year: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    leetcodeUrl: '',
    otherUrl: '',
    lookingFor: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        college: userProfile.college || '',
        branch: userProfile.branch || '',
        year: userProfile.year ? String(userProfile.year) : '',
        bio: userProfile.bio || '',
        githubUrl: userProfile.githubUrl || '',
        linkedinUrl: userProfile.linkedinUrl || '',
        portfolioUrl: userProfile.portfolioUrl || '',
        leetcodeUrl: userProfile.leetcodeUrl || '',
        otherUrl: userProfile.otherUrl || '',
        lookingFor: Array.isArray(userProfile.lookingFor)
          ? userProfile.lookingFor
          : userProfile.lookingFor
          ? Array.from(userProfile.lookingFor)
          : [],
      });
    }
  }, [userProfile, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleLookingForToggle = (option) => {
    setFormData((prev) => {
      const current = prev.lookingFor || [];
      const exists = current.includes(option);
      return {
        ...prev,
        lookingFor: exists
          ? current.filter((item) => item !== option)
          : [...current, option],
      };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.college.trim()) errs.college = 'College is required';
    if (!formData.branch.trim()) errs.branch = 'Branch is required';
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
      const updated = await userApi.updateUser(user.id, formData);
      updateUser(updated || formData);
      success('Profile updated successfully');
      if (onProfileUpdated) {
        onProfileUpdated(updated || { ...userProfile, ...formData });
      }
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to update profile.');
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      description="Update your academic, links, and collaboration preferences."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Basic Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Basic Information
          </h3>
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="College / University"
              name="college"
              value={formData.college}
              onChange={handleChange}
              error={errors.college}
              placeholder="e.g. ABES Engineering College"
              required
            />

            <Input
              label="Branch / Major"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              error={errors.branch}
              placeholder="e.g. Computer Science"
              required
            />
          </div>

          <Select
            label="Year of Study"
            name="year"
            value={formData.year}
            onChange={handleChange}
            options={YEAR_OPTIONS.filter((o) => o.value !== '')}
            placeholder="Select academic year"
          />

          <div>
            <label
              htmlFor="profile-bio"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Bio / About You
            </label>
            <textarea
              id="profile-bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others what you love building, your background, and passions..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 resize-none"
            />
          </div>
        </div>

        {/* Looking For / Availability */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Interested In / Looking For
          </h3>
          <p className="text-xs text-slate-500">
            Select the types of collaborations you are open to:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {COLLABORATION_OPTIONS.map((option) => {
              const isSelected = formData.lookingFor?.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => handleLookingForToggle(option)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-left transition-all ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* External Profiles & Links */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            External Profiles & Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="GitHub Profile URL"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username"
            />
            <Input
              label="LinkedIn Profile URL"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
            <Input
              label="Portfolio / Website URL"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleChange}
              placeholder="https://yourportfolio.dev"
            />
            <Input
              label="LeetCode Profile URL"
              name="leetcodeUrl"
              value={formData.leetcodeUrl}
              onChange={handleChange}
              placeholder="https://leetcode.com/u/username"
            />
          </div>
          <Input
            label="Other Profile / Link"
            name="otherUrl"
            value={formData.otherUrl}
            onChange={handleChange}
            placeholder="https://twitter.com/username or blog"
          />
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

export default EditProfileModal;

