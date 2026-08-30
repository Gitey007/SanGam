import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userApi from '../services/userApi';
import ProfileHeader from '../components/profile/ProfileHeader';
import EditProfileModal from '../components/profile/EditProfileModal';
import { ProfileSkeleton } from '../components/common/Skeleton';
import ErrorState from '../components/common/ErrorState';
import { extractErrorMessage } from '../utils/helpers';

export const ProfilePage = () => {
  const { id } = useParams();
  const { user: authUser } = useAuth();

  const isOwnProfile = !id || (authUser?.id && String(authUser.id) === String(id));
  const targetId = id || authUser?.id;

  const [profile, setProfile] = useState(isOwnProfile ? authUser : null);
  const [isLoading, setIsLoading] = useState(!profile);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!targetId) {
      if (authUser) {
        setProfile(authUser);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await userApi.getUser(targetId);
      setProfile(data);
    } catch (err) {
      console.warn('Real API GET /api/users/:id error:', err);
      const errorMsg = extractErrorMessage(err, 'Unable to load student profile.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, authUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Student not found"
          message={error}
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <ErrorState
          title="Profile unavailable"
          message="We could not load this student profile."
          onRetry={fetchProfile}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          userProfile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
};

export default ProfilePage;
