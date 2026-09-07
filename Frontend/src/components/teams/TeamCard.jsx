import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Trophy, Briefcase, Sparkles, Layers } from 'lucide-react';
import Badge from '../common/Badge';

export const TeamCard = ({ team }) => {
  const leaderName = team.leaderName || team.leader?.name;
  const maxMembers = team.maxMembers || 4;
  const memberCount = team.memberCount !== undefined ? team.memberCount : (team.members?.length || 1);
  const status = team.status || (memberCount >= maxMembers ? 'FULL' : memberCount === maxMembers - 1 ? 'ALMOST_FULL' : 'OPEN');

  const requiredSkills = Array.isArray(team.requiredSkills)
    ? team.requiredSkills
    : team.requiredSkills
    ? Array.from(team.requiredSkills)
    : [];

  const requiredRoles = Array.isArray(team.requiredRoles)
    ? team.requiredRoles
    : team.requiredRoles
    ? Array.from(team.requiredRoles)
    : [];

  const getStatusBadge = () => {
    if (status === 'FULL') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          FULL ({memberCount}/{maxMembers})
        </span>
      );
    }
    if (status === 'ALMOST_FULL') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
          ALMOST FULL ({memberCount}/{maxMembers})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        OPEN ({memberCount}/{maxMembers})
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-card-hover transition-all duration-150 group">
      <div>
        {/* Header with Name and Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
              {team.name}
            </h3>
            {leaderName && (
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                <span className="text-slate-400">Led by</span>
                <span className="font-medium text-slate-700">{leaderName}</span>
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Project Name & Type */}
        {team.projectName ? (
          <div className="mb-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-slate-800 truncate">
                {team.projectName}
              </span>
              {team.projectType && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
                  {team.projectType}
                </span>
              )}
            </div>
            {team.projectDescription && (
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {team.projectDescription}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {team.description || 'No description provided.'}
          </p>
        )}

        {/* Hackathon Badge if applicable */}
        {team.hackathonName && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/60 border border-amber-200/60 px-2 py-1 rounded-md mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-medium truncate">{team.hackathonName}</span>
          </div>
        )}

        {/* Open Roles / Looking For */}
        {requiredRoles.length > 0 && (
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Looking for:
            </span>
            <div className="flex flex-wrap gap-1">
              {requiredRoles.map((role, idx) => (
                <span
                  key={`${role}-${idx}`}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills */}
        {requiredSkills.length > 0 && (
          <div className="mb-4">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Required Skills:
            </span>
            <div className="flex flex-wrap gap-1">
              {requiredSkills.slice(0, 4).map((skill, idx) => (
                <span
                  key={`${skill}-${idx}`}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-50/60 text-brand-700 border border-brand-100"
                >
                  {skill}
                </span>
              ))}
              {requiredSkills.length > 4 && (
                <span className="text-[10px] text-slate-400 self-center">
                  +{requiredSkills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">
            {memberCount} / {maxMembers} members
          </span>
        </div>

        <Link
          to={`/teams/${team.id}`}
          className="inline-flex items-center gap-1 font-semibold text-slate-900 group-hover:text-brand-600 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;


