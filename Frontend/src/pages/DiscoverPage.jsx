import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Users2, Sparkles, Filter } from 'lucide-react';
import FilterBar from '../components/discovery/FilterBar';
import StudentCard from '../components/discovery/StudentCard';
import { StudentCardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { DISCOVERY_SCOPES } from '../utils/constants';
import userApi from '../services/userApi';
import { extractErrorMessage } from '../utils/helpers';

export const DiscoverPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query parameters with defaults
  const scopeParam = searchParams.get('scope') || DISCOVERY_SCOPES.ALL;
  const yearParam = searchParams.get('year') || '';
  const skillParam = searchParams.get('skill') || '';

  // Local state for filters
  const [scope, setScope] = useState(scopeParam);
  const [year, setYear] = useState(yearParam);
  const [skill, setSkill] = useState(skillParam);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Data fetching state
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state with URL search params when changed
  useEffect(() => {
    const params = {};
    if (scope && scope !== DISCOVERY_SCOPES.ALL) params.scope = scope;
    if (year) params.year = year;
    if (skill) params.skill = skill;

    setSearchParams(params, { replace: true });
  }, [scope, year, skill, setSearchParams]);

  // Main fetch function calling the real backend GET /api/users
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        scope,
        year: year ? parseInt(year, 10) : undefined,
        skill: skill.trim() || undefined,
      };

      const data = await userApi.getUsers(filters);

      if (Array.isArray(data)) {
        setStudents(data);
      } else if (data && Array.isArray(data.content)) {
        setStudents(data.content);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.warn('Real API GET /api/users call response:', err);
      const errorMsg = extractErrorMessage(err, 'Unable to load students. Please try again.');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [scope, year, skill]);

  // Fetch when backend query filters change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Client-side quick filter over loaded students
  const filteredStudents = useMemo(() => {
    if (!clientSearchTerm.trim()) return students;
    const term = clientSearchTerm.toLowerCase();

    return students.filter((s) => {
      const nameMatch = s.name?.toLowerCase().includes(term);
      const bioMatch = s.bio?.toLowerCase().includes(term);
      const branchMatch = s.branch?.toLowerCase().includes(term);
      const skillMatch = Array.isArray(s.skills)
        ? s.skills.some((sk) => sk.toLowerCase().includes(term))
        : false;

      return nameMatch || bioMatch || branchMatch || skillMatch;
    });
  }, [students, clientSearchTerm]);

  const handleResetFilters = () => {
    setScope(DISCOVERY_SCOPES.ALL);
    setYear('');
    setSkill('');
    setClientSearchTerm('');
  };

  const hasActiveFilters =
    scope !== DISCOVERY_SCOPES.ALL ||
    Boolean(year) ||
    Boolean(skill) ||
    Boolean(clientSearchTerm);

  const handleSkillBadgeClick = (clickedSkill) => {
    setSkill(clickedSkill);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-slate-900" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Discover students
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Find collaborators by college scope, academic year, and technical skills.
          </p>
        </div>

        {/* Real-time Result Badge */}
        {!isLoading && !error && (
          <div className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-subtle self-start sm:self-auto">
            Showing <span className="text-slate-900 font-semibold">{filteredStudents.length}</span> students
          </div>
        )}
      </div>

      {/* Filter Bar Component */}
      <FilterBar
        scope={scope}
        onScopeChange={setScope}
        year={year}
        onYearChange={setYear}
        skill={skill}
        onSkillChange={setSkill}
        searchTerm={clientSearchTerm}
        onSearchTermChange={setClientSearchTerm}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Content States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <StudentCardSkeleton key={idx} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load students"
          message={error}
          onRetry={fetchStudents}
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description={
            hasActiveFilters
              ? 'No student profiles matched your selected filter criteria. Try adjusting your year or skill filter.'
              : 'No students have joined this category yet.'
          }
          actionLabel={hasActiveFilters ? 'Clear all filters' : undefined}
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onSkillClick={handleSkillBadgeClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
