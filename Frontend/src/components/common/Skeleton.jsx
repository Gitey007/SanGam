import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/70 rounded ${className}`}
      {...props}
    />
  );
};

export const StudentCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-start gap-3.5 mb-4">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-32 mb-1.5" />
            <Skeleton className="h-3 w-24 mb-1" />
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
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-100">
          <Skeleton className="w-20 h-20 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        <div className="py-6 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-14 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
