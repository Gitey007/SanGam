import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, ShieldCheck } from 'lucide-react';
import Badge from '../common/Badge';

export const TeamCard = ({ team }) => {
  const leaderName = team.leaderName || team.leader?.name;
  const maxMembers = team.maxMembers || 4;
  const skills = team.requiredSkills || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-card-hover transition-all duration-150 group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
            {team.name}
          </h3>
          <Badge
            variant="neutral"
            size="sm"
          >
            Max {maxMembers}
          </Badge>
        </div>

        {/* Leader subtitle if available */}
        {leaderName && (
          <p className="text-[11px] text-slate-500 mb-2.5 flex items-center gap-1 truncate">
            <span className="text-slate-400">Led by</span>
            <span className="font-medium text-slate-700">{leaderName}</span>
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {team.description || 'No description provided.'}
        </p>

        {/* Required Skills if provided */}
        {skills.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Looking for:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <Badge key={`${skill}-${idx}`} variant="neutral" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {team.members?.length ? `${team.members.length} / ${maxMembers} members` : `Up to ${maxMembers} members`}
          </span>
        </div>

        <Link
          to={`/teams/${team.id}`}
          className="inline-flex items-center gap-1 font-medium text-slate-900 group-hover:text-brand-600 transition-colors"
        >
          <span>View Team</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;

