import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { ACHIEVEMENT_CATEGORIES } from '../../utils/constants';
import { userApi } from '../../services/userApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/helpers';

export const AddEditAchievementModal = ({
  isOpen,
  onClose,
  userId,
  achievement,
  onSaved,
}) => {
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(achievement?.id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hackathon',
    date: '',
    proofUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title || '',
        description: achievement.description || '',
        category: achievement.category || 'Hackathon',
        date: achievement.achievementDate || achievement.date || '',
        proofUrl: achievement.verificationUrl || achievement.proofUrl || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Hackathon',
        date: '',
        proofUrl: '',
      });
    }
    setErrors({});
  }, [achievement, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
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
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      achievementDate: formData.date ? formData.date.trim() : '',
      verificationUrl: formData.proofUrl ? formData.proofUrl.trim() : '',
      date: formData.date ? formData.date.trim() : '',
      proofUrl: formData.proofUrl ? formData.proofUrl.trim() : '',
    };

    try {
      if (isEditing) {
        const updated = await userApi.updateAchievement(userId, achievement.id, payload);
        success('Achievement updated successfully');
        if (onSaved) onSaved(updated);
      } else {
        const created = await userApi.addAchievement(userId, payload);
        success('Achievement added successfully');
        if (onSaved) onSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, `Failed to ${isEditing ? 'update' : 'add'} achievement.`);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = ACHIEVEMENT_CATEGORIES.map((cat) => ({
    label: cat,
    value: cat,
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
        form="achievement-form"
        variant="primary"
        size="sm"
        isLoading={isLoading}
        disabled={isLoading}
        className="shrink-0"
      >
        {isEditing ? 'Save Changes' : 'Add Achievement'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Achievement' : 'Add Achievement'}
      description="Showcase your hackathon wins, competitive ranks, certifications, and academic milestones."
      maxWidth="max-w-lg"
      footer={modalFooter}
    >
      <form id="achievement-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Achievement Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g. Winner - SIH 2024 / LeetCode Knight"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
          />

          <Input
            label="Date / Period (Optional)"
            name="date"
            value={formData.date}
            onChange={handleChange}
            placeholder="e.g. Oct 2024"
          />
        </div>

        <div>
          <label htmlFor="achievement-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="achievement-desc"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what you achieved, your contribution, or ranking..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
            required
          />
          {errors.description && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
          )}
        </div>

        <Input
          label="Verification / Proof URL (Optional)"
          name="proofUrl"
          value={formData.proofUrl}
          onChange={handleChange}
          placeholder="https://certificate-or-post-link.com"
        />
      </form>
    </Modal>
  );
};

export default AddEditAchievementModal;
