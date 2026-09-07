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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-subtle">
      {/* Top action bar */}
      <div className="px-6 pt-5 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
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
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-100">
          <Avatar name={profile.name} size="xl" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {profile.name}
              </h1>
              {isOwnProfile && (
                <Badge variant="brand" size="sm">
                  You
                </Badge>
              )}
            </div>

            <p className="text-sm font-medium text-slate-600 mt-1">
              {formatBranchYear(profile.branch, profile.year)}
            </p>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{formatCollege(profile.college)}</span>
              </div>

              {profile.year && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Year {profile.year}</span>
                </div>
              )}

              {profile.email && isOwnProfile && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-medium transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
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
        <div className="py-6 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            About
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed max-w-3xl whitespace-pre-line">
            {profile.bio || 'No bio written yet.'}
          </p>
        </div>

        {/* Looking For Section */}
        {lookingForList.length > 0 && (
          <div className="pt-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              <span>Looking For / Open To</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {lookingForList.map((item, idx) => (
                <span
                  key={`${item}-${idx}`}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200"
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

