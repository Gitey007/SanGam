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
  const [debouncedSkill, setDebouncedSkill] = useState(skillParam);
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Data fetching state
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce skill text input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSkill(skill);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [skill]);

  // Sync state with URL search params when changed
  useEffect(() => {
    const params = {};
    if (scope && scope !== DISCOVERY_SCOPES.ALL) params.scope = scope;
    if (year) params.year = year;
    if (debouncedSkill) params.skill = debouncedSkill;

    setSearchParams(params, { replace: true });
  }, [scope, year, debouncedSkill, setSearchParams]);

  // Main fetch function calling the real backend GET /api/users
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        scope,
        year: year ? parseInt(year, 10) : undefined,
        skill: debouncedSkill.trim() || undefined,
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
  }, [scope, year, debouncedSkill]);

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
    setDebouncedSkill('');
    setClientSearchTerm('');
  };

  const hasActiveFilters =
    scope !== DISCOVERY_SCOPES.ALL ||
    Boolean(year) ||
    Boolean(skill) ||
    Boolean(clientSearchTerm);

  const handleSkillBadgeClick = (clickedSkill) => {
    setSkill(clickedSkill);
    setDebouncedSkill(clickedSkill);
  };

  const [limit, setLimit] = useState(9); // 9 | 10 | 20 | 30 | 'ALL'
  const displayedStudents = limit === 'ALL' ? filteredStudents : filteredStudents.slice(0, Number(limit));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-slate-900 dark:text-slate-100" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Discover students
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Find collaborators by college scope, academic year, and technical skills.
          </p>
        </div>

        {/* Real-time Result Badge & Limit Selector */}
        {!isLoading && !error && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-subtle self-start sm:self-auto">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="h-6 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={9}>9</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value="ALL">All</option>
            </select>
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">
              ({displayedStudents.length} of {filteredStudents.length})
            </span>
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
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onSkillClick={handleSkillBadgeClick}
              />
            ))}
          </div>

          {filteredStudents.length > displayedStudents.length && limit !== 'ALL' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setLimit('ALL')}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-subtle transition-all"
              >
                View All ({filteredStudents.length} Students) →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
