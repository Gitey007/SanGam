import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  Trophy,
  Github,
  FileText,
  Clock,
} from 'lucide-react';

export const TeamCard = ({ team }) => {
  const leaderName = team.leaderName || team.leader?.name;
  const maxMembers = team.maxMembers || 4;
  const memberCount =
    team.memberCount !== undefined
      ? team.memberCount
      : team.members?.length || 1;
  const isExpired = Boolean(
    team.isExpired ||
    team.expired ||
    (team.joinDeadline && new Date(team.joinDeadline) < new Date())
  );
  const status =
    team.status ||
    (memberCount >= maxMembers
      ? 'FULL'
      : memberCount === maxMembers - 1
      ? 'ALMOST_FULL'
      : 'OPEN');

  const requiredSkills = Array.isArray(team.requiredSkills)
    ? team.requiredSkills
    : team.requiredSkills
    ? Array.from(team.requiredSkills)
    : [];

  const isTeamFull = memberCount >= maxMembers || status === 'FULL';

  // Calculate role openings strictly using role capacity: (role.maxSlots - role.filledMembers)
  // NEVER use (team.maxMembers - currentMemberCount) as the opening count for individual roles
  const aggregatedRoles = React.useMemo(() => {
    if (isTeamFull) {
      return [];
    }
    const roleMap = new Map();

    if (Array.isArray(team.roleSlots) && team.roleSlots.length > 0) {
      for (const slot of team.roleSlots) {
        if (!slot || !slot.roleName || !slot.roleName.trim()) continue;
        const roleName = slot.roleName.trim();
        const key = roleName.toLowerCase();

        // Use availableSlots strictly from role capacity (slotCount - filledSlots)
        let available = slot.availableSlots;
        if (available === undefined) {
          const total = slot.slotCount != null ? Number(slot.slotCount) : 1;
          const filled = slot.filledSlots != null ? Number(slot.filledSlots) : 0;
          available = Math.max(0, total - filled);
        }

        if (roleMap.has(key)) {
          const existing = roleMap.get(key);
          existing.availableSlots += available;
        } else {
          roleMap.set(key, {
            roleName,
            availableSlots: available,
          });
        }
      }
    } else if (Array.isArray(team.requiredRoles) && team.requiredRoles.length > 0) {
      for (const r of team.requiredRoles) {
        if (!r || !r.trim()) continue;
        const roleName = r.trim();
        const key = roleName.toLowerCase();
        if (!roleMap.has(key)) {
          const membersList = Array.isArray(team.members) ? team.members : [];
          const filled = membersList.filter((m) => {
            const assigned = m.assignedRole || m.role;
            return assigned && assigned.toLowerCase() === key;
          }).length;
          const available = Math.max(0, 1 - filled);
          if (available > 0) {
            roleMap.set(key, {
              roleName,
              availableSlots: available,
            });
          }
        }
      }
    }

    // Only return roles that actually have available capacity (> 0), omitting full roles
    return Array.from(roleMap.values()).filter((r) => r.availableSlots > 0);
  }, [team.roleSlots, team.requiredRoles, team.members, isTeamFull]);

  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 shrink-0">
          EXPIRED ({memberCount}/{maxMembers})
        </span>
      );
    }
    if (isTeamFull) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
          FULL ({memberCount}/{maxMembers})
        </span>
      );
    }
    if (status === 'ALMOST_FULL') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
          ALMOST FULL ({memberCount}/{maxMembers})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
        OPEN ({memberCount}/{maxMembers})
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-card-hover transition-all duration-150 group h-full">
      <div>
        {/* Header with Name and Status */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
              {team.name}
            </h3>
            {leaderName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                <span className="text-slate-400 dark:text-slate-500">Led by</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {leaderName}
                </span>
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Project Name & Type */}
        {team.projectName ? (
          <div className="mb-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {team.projectName}
              </span>
              {team.projectType && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shrink-0">
                  {team.projectType}
                </span>
              )}
            </div>
            {team.projectDescription && (
              <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {team.projectDescription}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3 leading-relaxed">
            {team.description || 'No description provided.'}
          </p>
        )}

        {/* Hackathon Badge if applicable */}
        {team.hackathonName && (
          <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-2 py-1 rounded-md mb-2.5">
            <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-medium truncate">{team.hackathonName}</span>
          </div>
        )}

        {/* Join Deadline */}
        {team.joinDeadline && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className={isExpired ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}>
              {isExpired ? 'Expired: ' : 'Deadline: '}
              {new Date(team.joinDeadline).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Looking for Roles / Openings */}
        <div className="mb-3">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Looking for:
          </span>
          {isTeamFull ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No open positions
            </p>
          ) : aggregatedRoles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {aggregatedRoles.slice(0, 3).map((slot, idx) => (
                <span
                  key={`${slot.roleName}-${idx}`}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate"
                >
                  <span>{slot.roleName}</span>
                  <span className="text-slate-400 dark:text-slate-500 ml-1 font-semibold">
                    — {slot.availableSlots} opening{slot.availableSlots > 1 ? 's' : ''}
                  </span>
                </span>
              ))}
              {aggregatedRoles.length > 3 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                  +{aggregatedRoles.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No open positions
            </p>
          )}
        </div>

        {/* Required Skills */}
        {requiredSkills.length > 0 && (
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Required Skills:
            </span>
            <div className="flex flex-wrap gap-1">
              {requiredSkills.slice(0, 4).map((skill, idx) => (
                <span
                  key={`${skill}-${idx}`}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-brand-50/60 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900"
                >
                  {skill}
                </span>
              ))}
              {requiredSkills.length > 4 && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500 self-center">
                  +{requiredSkills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Compact Project Resource Icons (Part 24) */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="font-medium">
              {memberCount}/{maxMembers}
            </span>
          </div>

          {/* Compact resource indicators */}
          {team.githubRepositoryUrl && (
            <span
              title="Has GitHub Repository"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <Github className="w-3.5 h-3.5" />
            </span>
          )}
          {team.documentationUrl && (
            <span
              title="Has Documentation"
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <FileText className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <Link
          to={`/teams/${team.id}`}
          className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default TeamCard;
