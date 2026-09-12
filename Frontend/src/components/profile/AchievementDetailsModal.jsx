import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { getAchievementCategoryBadgeClass } from '../../utils/constants';

export const AchievementDetailsModal = ({
  isOpen,
  onClose,
  achievement,
}) => {
  if (!achievement) return null;

  const rawUrl = achievement.verificationUrl || achievement.proofUrl || '';
  const trimmedUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
  const proofUrl = trimmedUrl
    ? trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
      ? trimmedUrl
      : `https://${trimmedUrl}`
    : null;

  const dateValue = (achievement.achievementDate || achievement.date || '').trim();
  const titleValue = (achievement.title || '').trim();
  const descriptionValue = (achievement.description || '').trim();
  const categoryValue = (achievement.category || 'Other').trim();

  const modalFooter = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClose}
      className="shrink-0"
    >
      Close
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Achievement Details"
      maxWidth="max-w-lg"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* Category Badge */}
        <div>
          <span
            className={`inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${getAchievementCategoryBadgeClass(
              categoryValue
            )}`}
          >
            {categoryValue}
          </span>
        </div>

        {/* Achievement Title */}
        {titleValue && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Achievement Title
            </h4>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {titleValue}
            </p>
          </div>
        )}

        {/* Date / Period */}
        {dateValue && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Date / Period
            </h4>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {dateValue}
            </p>
          </div>
        )}

        {/* Description */}
        {descriptionValue && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {descriptionValue}
            </p>
          </div>
        )}

        {/* Verification / Proof */}
        {proofUrl && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Verification / Proof
            </h4>
            <div className="space-y-2">
              <div>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold shadow-subtle transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Certificate</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div>
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span>{trimmedUrl}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AchievementDetailsModal;
