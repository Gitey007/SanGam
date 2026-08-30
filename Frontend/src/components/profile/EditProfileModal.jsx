import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { YEAR_OPTIONS } from '../../utils/constants';
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
      description="Update your academic and basic student profile information."
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            Bio
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell other students about your interests, current projects, or what you are building..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 resize-none"
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
