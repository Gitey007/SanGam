import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { userApi } from '../../services/userApi';
import { useToast } from '../../context/ToastContext';
import { extractErrorMessage } from '../../utils/helpers';

export const AddEditProjectModal = ({
  isOpen,
  onClose,
  userId,
  project,
  onSaved,
}) => {
  const { success, error: toastError } = useToast();
  const isEditing = Boolean(project?.id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        techStack: project.techStack || '',
        githubUrl: project.githubUrl || '',
        liveUrl: project.liveUrl || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        techStack: '',
        githubUrl: '',
        liveUrl: '',
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Project name is required';
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
    try {
      if (isEditing) {
        const updated = await userApi.updateProject(userId, project.id, formData);
        success('Project updated successfully');
        if (onSaved) onSaved(updated);
      } else {
        const created = await userApi.addProject(userId, formData);
        success('Project added successfully');
        if (onSaved) onSaved(created);
      }
      onClose();
    } catch (err) {
      const msg = extractErrorMessage(err, `Failed to ${isEditing ? 'update' : 'add'} project.`);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
        form="project-form"
        variant="primary"
        size="sm"
        isLoading={isLoading}
        disabled={isLoading}
        className="shrink-0"
      >
        {isEditing ? 'Save Changes' : 'Add Project'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Add Project'}
      description="Showcase what you've built, the tech stack used, and live demo links."
      maxWidth="max-w-lg"
      footer={modalFooter}
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="e.g. SanGam Peer Finder / Autonomous Drone"
          required
        />

        <div>
          <label htmlFor="project-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="project-desc"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            placeholder="What does this project do, what problem does it solve, and your contribution?"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 dark:hover:border-slate-600 resize-none"
            required
          />
          {errors.description && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.description}</p>
          )}
        </div>

        <Input
          label="Tech Stack"
          name="techStack"
          value={formData.techStack}
          onChange={handleChange}
          placeholder="e.g. React, Spring Boot, MySQL, Docker"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="GitHub Repository URL"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            placeholder="https://github.com/username/project"
          />

          <Input
            label="Live Demo URL (Optional)"
            name="liveUrl"
            value={formData.liveUrl}
            onChange={handleChange}
            placeholder="https://my-app.vercel.app"
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddEditProjectModal;
