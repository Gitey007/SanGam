import React from 'react';

/**
 * Base atomic Skeleton component with subtle shimmer sweep.
 */
export const Skeleton = ({ className = '', rounded = 'rounded-md', ...props }) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-200/80 dark:bg-slate-800/70 ${rounded} shimmer-effect ${className}`}
      {...props}
    />
  );
};

/**
 * Sidebar Skeleton matching SanGam Desktop Navigation
 */
export const SidebarSkeleton = () => {
  return (
    <aside className="hidden md:flex flex-col w-60 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0 shrink-0 transition-colors">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
          <div className="space-y-1">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-2 pb-1.5">
          <Skeleton className="h-2.5 w-16" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <Skeleton className="w-4 h-4 rounded shrink-0" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Skeleton className="w-4 h-4 rounded shrink-0" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <Skeleton className="w-4 h-4 rounded shrink-0" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2.5 px-2">
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2 w-28" />
          </div>
        </div>
      </div>
    </aside>
  );
};

/**
 * Mobile Navbar Skeleton
 */
export const NavbarSkeleton = () => {
  return (
    <header className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-18" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md" />
          <Skeleton className="w-7 h-7 rounded-full" />
        </div>
      </div>
    </header>
  );
};

/**
 * Mobile Bottom Navigation Skeleton
 */
export const MobileNavSkeleton = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
      <div className="grid grid-cols-4 h-14">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-1">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-2 w-10" />
          </div>
        ))}
      </div>
    </nav>
  );
};

/**
 * Team Card Skeleton matching TeamCard.jsx exactly
 */
export const TeamCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between h-full shadow-subtle">
      <div>
        {/* Top Badges & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-24 rounded-md" />
        </div>

        {/* Team Title */}
        <Skeleton className="h-5 w-3/4 mb-1.5" />

        {/* Leader Info */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4 rounded-full shrink-0" />
          <Skeleton className="h-3 w-32" />
        </div>

        {/* Description Lines */}
        <div className="space-y-1.5 mb-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* Open Roles Section */}
        <div className="space-y-1.5 mb-3.5">
          <Skeleton className="h-2.5 w-24" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-5 w-28 rounded" />
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-1.5 mb-4">
          <Skeleton className="h-2.5 w-20" />
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-4.5 w-14 rounded" />
            <Skeleton className="h-4.5 w-18 rounded" />
            <Skeleton className="h-4.5 w-12 rounded" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-12" />
        </div>
        <Skeleton className="h-3.5 w-20" />
      </div>
    </div>
  );
};

/**
 * Student Card Skeleton matching StudentCard.jsx
 */
export const StudentCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between h-full shadow-subtle">
      <div>
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-1.5 mb-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-18 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

/**
 * Team Invitation Skeleton Card
 */
export const TeamInvitationCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4.5 w-28 rounded-full" />
        </div>
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-2.5 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Team Join Request Skeleton Card
 */
export const TeamRequestCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4.5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-3 w-44" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Dashboard Page Content Skeleton
 */
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Main Grid: Profile Snapshot + Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Snapshot */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="mt-4 flex items-start gap-3.5">
              <Skeleton className="w-12 h-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Skeleton className="h-2.5 w-16" />
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-5 w-14 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Discover & Shortcuts Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="mt-4 space-y-2.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-80" />
              <div className="flex flex-wrap gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
          <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Skeleton className="h-3 w-44" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Open Collaboration Teams */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Teams Page Content Skeleton
 */
export const TeamsPageSkeleton = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TeamCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

/**
 * Team Details Page Content Skeleton
 */
export const TeamDetailsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Back Button */}
      <Skeleton className="h-4 w-28" />

      {/* Main Team Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-subtle">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>

          {/* Role Distribution Slots */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-36" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              ))}
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Skeleton className="h-4 w-28" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Discover Page Content Skeleton
 */
export const DiscoverPageSkeleton = () => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3.5 w-80" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-subtle">
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-28 rounded-lg" />
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <StudentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

/**
 * Profile Page Content Skeleton
 */
export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-subtle">
        {/* Cover / Header Banner */}
        <div className="h-24 bg-slate-100 dark:bg-slate-800/80 shimmer-effect" />

        <div className="p-6 md:p-8 -mt-12">
          {/* Avatar & User Details */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <Skeleton className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-900 shrink-0 shadow-md" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-lg" />
              ))}
            </div>
          </div>

          {/* Bio Block */}
          <div className="py-6 space-y-2 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-3.5 w-20 mb-2" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>

          {/* Skills Block */}
          <div className="py-6 space-y-3 border-b border-slate-100 dark:border-slate-800">
            <Skeleton className="h-3.5 w-20" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-14 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-18 rounded-md" />
            </div>
          </div>

          {/* Achievements Block */}
          <div className="pt-6 space-y-3">
            <Skeleton className="h-3.5 w-28" />
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-2.5 w-48" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Settings Page Content Skeleton
 */
export const SettingsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-3.5 w-64" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-subtle">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Universal Workspace Layout Shell Skeleton
 * Wraps content with the authentic SanGam Sidebar and Header.
 */
export const AppLayoutSkeleton = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar Skeleton */}
      <SidebarSkeleton />

      {/* Mobile Top Navbar Skeleton */}
      <NavbarSkeleton />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children || <DashboardSkeleton />}
        </div>
      </main>

      {/* Mobile Bottom Nav Skeleton */}
      <MobileNavSkeleton />
    </div>
  );
};

/**
 * Context-aware Page Skeleton that picks the right skeleton based on the current URL
 */
export const PageSkeleton = ({ pageType }) => {
  const getSkeletonContent = () => {
    if (pageType) {
      switch (pageType) {
        case 'dashboard':
          return <DashboardSkeleton />;
        case 'teams':
          return <TeamsPageSkeleton />;
        case 'team-details':
          return <TeamDetailsSkeleton />;
        case 'discover':
          return <DiscoverPageSkeleton />;
        case 'profile':
          return <ProfileSkeleton />;
        case 'settings':
          return <SettingsSkeleton />;
        default:
          return <DashboardSkeleton />;
      }
    }

    // Determine based on window location if available
    if (typeof window !== 'undefined' && window.location) {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/teams/') && path !== '/teams/create') {
        return <TeamDetailsSkeleton />;
      }
      if (path.startsWith('/teams')) {
        return <TeamsPageSkeleton />;
      }
      if (path.startsWith('/discover')) {
        return <DiscoverPageSkeleton />;
      }
      if (path.startsWith('/profile')) {
        return <ProfileSkeleton />;
      }
      if (path.startsWith('/settings')) {
        return <SettingsSkeleton />;
      }
      if (path.startsWith('/dashboard')) {
        return <DashboardSkeleton />;
      }
    }

    return <DashboardSkeleton />;
  };

  return <AppLayoutSkeleton>{getSkeletonContent()}</AppLayoutSkeleton>;
};

export default Skeleton;
