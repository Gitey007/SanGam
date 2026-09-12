import React from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { getAchievementCategoryBadgeClass } from '../../utils/constants';

export const AchievementDetailsModal = ({
  isOpen,
  onClose,
  achievement,
}) => {
  if (!achievement) return null;

  const proofUrl = achievement.proofUrl
    ? achievement.proofUrl.startsWith('http')
      ? achievement.proofUrl
      : `https://${achievement.proofUrl}`
    : null;

  const modalFooter = (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        className="shrink-0"
      >
        Close
      </Button>
      {proofUrl && (
        <a
          href={proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-subtle transition-colors shrink-0"
        >
          <span>View Certificate</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Achievement Details"
      maxWidth="max-w-md"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* Category & Date Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getAchievementCategoryBadgeClass(
              achievement.category
            )}`}
          >
            {achievement.category || 'Other'}
          </span>
          {achievement.date && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{achievement.date}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {achievement.title}
          </h3>
        </div>

        {/* Description */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            Description
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {achievement.description || 'No description provided.'}
          </p>
        </div>

        {/* Verification / Proof link if available */}
        {proofUrl && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Verification Link
            </h4>
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline break-all"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>{achievement.proofUrl}</span>
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AchievementDetailsModal;
