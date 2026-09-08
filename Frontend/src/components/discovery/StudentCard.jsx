import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Linkedin, Globe, Code2, Target } from 'lucide-react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { formatBranchYear, formatCollege } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

export const StudentCard = ({ student, onSkillClick }) => {
  const { user } = useAuth();
  const isSelf = user?.id && String(user.id) === String(student.id);
  const profileUrl = isSelf ? '/profile' : `/profile/${student.id}`;

  const skillsList = Array.isArray(student.skills)
    ? student.skills
    : typeof student.skills === 'string'
    ? student.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const lookingForList = Array.isArray(student.lookingFor)
    ? student.lookingFor
    : student.lookingFor
    ? Array.from(student.lookingFor)
    : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-card-hover transition-all duration-150 group">
      <div>
        {/* Top Info */}
        <div className="flex items-start gap-3.5 mb-3">
          <Avatar name={student.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={profileUrl}
                className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors truncate block"
              >
                {student.name}
              </Link>
              {isSelf && (
                <Badge variant="outline" size="sm">
                  You
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              {formatBranchYear(student.branch, student.year)}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5" title={student.college}>
              {formatCollege(student.college)}
            </p>
          </div>
        </div>

        {/* Bio */}
        {student.bio ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
            {student.bio}
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-3">
            No bio provided yet.
          </p>
        )}

        {/* Looking for tags */}
        {lookingForList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {lookingForList.slice(0, 3).map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800/60"
              >
                {item}
              </span>
            ))}
            {lookingForList.length > 3 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                +{lookingForList.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Skills Badges */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {skillsList.slice(0, 4).map((skill, index) => (
              <Badge
                key={`${skill}-${index}`}
                variant="neutral"
                size="sm"
                onClick={onSkillClick ? () => onSkillClick(skill) : undefined}
                className={onSkillClick ? 'hover:bg-slate-200 dark:hover:bg-slate-700' : ''}
              >
                {skill}
              </Badge>
            ))}
            {skillsList.length > 4 && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium self-center">
                +{skillsList.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Link & Social preview */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          {student.githubUrl && <Github className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
          {student.linkedinUrl && <Linkedin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          {student.leetcodeUrl && <Code2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          {student.portfolioUrl && <Globe className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
          {!student.githubUrl && !student.linkedinUrl && !student.leetcodeUrl && !student.portfolioUrl && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {student.year ? `Year ${student.year}` : 'Student'}
            </span>
          )}
        </div>

        <Link
          to={profileUrl}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default StudentCard;
