import React from 'react';
import { Building2, BookOpen, Calendar, Edit3, ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatCollege, formatBranchYear } from '../../utils/helpers';

export const ProfileHeader = ({ profile, isOwnProfile, onEditClick }) => {
  const navigate = useNavigate();

  const skillsList = Array.isArray(profile.skills)
    ? profile.skills
    : typeof profile.skills === 'string'
    ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

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

        {/* Skills Section */}
        <div className="pt-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Skills & Expertise
          </h2>
          {skillsList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, index) => (
                <Badge key={`${skill}-${index}`} variant="neutral" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
