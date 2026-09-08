import React from 'react';
import {
  Building2,
  Calendar,
  Edit3,
  ArrowLeft,
  Mail,
  Github,
  Linkedin,
  Globe,
  Code2,
  ExternalLink,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatCollege, formatBranchYear } from '../../utils/helpers';

export const ProfileHeader = ({ profile, isOwnProfile, onEditClick }) => {
  const navigate = useNavigate();

  const lookingForList = Array.isArray(profile.lookingFor)
    ? profile.lookingFor
    : profile.lookingFor
    ? Array.from(profile.lookingFor)
    : [];

  const hasSocials = Boolean(
    profile.githubUrl ||
    profile.linkedinUrl ||
    profile.portfolioUrl ||
    profile.leetcodeUrl ||
    profile.otherUrl
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-subtle transition-colors">
      {/* Top action bar */}
      <div className="px-6 pt-5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        {isOwnProfile && onEditClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            leftIcon={Edit3}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Main Profile Info */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <Avatar name={profile.name} size="xl" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {profile.name}
              </h1>
              {isOwnProfile && (
                <Badge variant="brand" size="sm">
                  You
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
              {formatBranchYear(profile.branch, profile.year)}
            </p>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{formatCollege(profile.college)}</span>
              </div>

              {profile.year && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>Year {profile.year}</span>
                </div>
              )}

              {profile.email && isOwnProfile && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>{profile.email}</span>
                </div>
              )}
            </div>

            {/* Social / External Links */}
            {hasSocials && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-medium transition-colors border border-blue-200/50 dark:border-blue-800/50"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.leetcodeUrl && (
                  <a
                    href={profile.leetcodeUrl.startsWith('http') ? profile.leetcodeUrl : `https://${profile.leetcodeUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium transition-colors border border-amber-200/50 dark:border-amber-800/50"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>LeetCode</span>
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl.startsWith('http') ? profile.portfolioUrl : `https://${profile.portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-medium transition-colors border border-purple-200/50 dark:border-purple-800/50"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Portfolio</span>
                  </a>
                )}
                {profile.otherUrl && (
                  <a
                    href={profile.otherUrl.startsWith('http') ? profile.otherUrl : `https://${profile.otherUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Link</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="py-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            About
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl whitespace-pre-line">
            {profile.bio || 'No bio written yet.'}
          </p>
        </div>

        {/* Looking For Section */}
        {lookingForList.length > 0 && (
          <div className="pt-6">
            <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              <span>Looking For / Open To</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {lookingForList.map((item, idx) => (
                <span
                  key={`${item}-${idx}`}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;

