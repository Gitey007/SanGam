import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Sparkles } from 'lucide-react';
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-card-hover transition-all duration-150 group">
      <div>
        {/* Top Info */}
        <div className="flex items-start gap-3.5 mb-3">
          <Avatar name={student.name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={profileUrl}
                className="font-semibold text-sm text-slate-900 hover:text-brand-600 transition-colors truncate block"
              >
                {student.name}
              </Link>
              {isSelf && (
                <Badge variant="outline" size="sm">
                  You
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {formatBranchYear(student.branch, student.year)}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5" title={student.college}>
              {formatCollege(student.college)}
            </p>
          </div>
        </div>

        {/* Bio */}
        {student.bio ? (
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {student.bio}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic mb-4">
            No bio provided yet.
          </p>
        )}

        {/* Skills Badges */}
        {skillsList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {skillsList.slice(0, 5).map((skill, index) => (
              <Badge
                key={`${skill}-${index}`}
                variant="neutral"
                size="sm"
                onClick={onSkillClick ? () => onSkillClick(skill) : undefined}
                className={onSkillClick ? 'hover:bg-slate-200' : ''}
              >
                {skill}
              </Badge>
            ))}
            {skillsList.length > 5 && (
              <span className="text-[11px] text-slate-400 font-medium self-center">
                +{skillsList.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-[11px] text-slate-400">
          {student.year ? `Year ${student.year} Student` : 'Student Profile'}
        </span>
        <Link
          to={profileUrl}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 group-hover:text-brand-600 transition-colors"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default StudentCard;
