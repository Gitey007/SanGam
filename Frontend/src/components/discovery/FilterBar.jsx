import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { DISCOVERY_SCOPES, SCOPE_LABELS, YEAR_OPTIONS, POPULAR_SKILLS } from '../../utils/constants';

export const FilterBar = ({
  scope,
  onScopeChange,
  year,
  onYearChange,
  skill,
  onSkillChange,
  searchTerm,
  onSearchTermChange,
  onResetFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-subtle space-y-4">
      {/* Top row: Scope Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg self-start">
          {SCOPE_LABELS.map((item) => {
            const isActive = scope === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onScopeChange(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-subtle font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
                title={item.description}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Middle row: Year select + Backend Skill filter + Client search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Year Filter */}
        <div className="sm:col-span-3">
          <label htmlFor="filter-year" className="block text-[11px] font-medium text-slate-500 mb-1">
            Academic Year
          </label>
          <select
            id="filter-year"
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 transition-colors"
          >
            {YEAR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Backend Skill Filter */}
        <div className="sm:col-span-4">
          <label htmlFor="filter-skill" className="block text-[11px] font-medium text-slate-500 mb-1">
            Filter by Skill (Backend)
          </label>
          <div className="relative flex items-center">
            <input
              id="filter-skill"
              type="text"
              placeholder="e.g. Java, React, Python"
              value={skill}
              onChange={(e) => onSkillChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-3 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 transition-colors"
            />
            {skill && (
              <button
                type="button"
                onClick={() => onSkillChange('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Clear skill"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Client-side Name / Keyword Filter */}
        <div className="sm:col-span-5">
          <label htmlFor="filter-search" className="block text-[11px] font-medium text-slate-500 mb-1">
            Quick Name / Bio Search
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              id="filter-search"
              type="text"
              placeholder="Filter loaded results..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 hover:border-slate-300 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchTermChange('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: Popular skill quick tags */}
      <div className="pt-2 flex items-center gap-2 overflow-x-auto text-xs pb-1 scrollbar-none">
        <span className="text-[11px] font-medium text-slate-400 shrink-0">Popular:</span>
        <div className="flex items-center gap-1.5 flex-nowrap">
          {POPULAR_SKILLS.slice(0, 7).map((s) => {
            const isSelected = skill.toLowerCase() === s.toLowerCase();
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSkillChange(isSelected ? '' : s)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
