import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Crown, ArrowRight } from 'lucide-react';

export default function TeamCard({ team }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 transition group hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
            {team.name}
          </h3>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0">
            <Users className="w-3 h-3 text-indigo-400" />
            Max: {team.maxMembers}
          </span>
        </div>

        <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {team.description || 'No description provided for this team.'}
        </p>

        <div className="flex items-center gap-2 mb-6 text-xs text-slate-400 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-800">
          <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400">Leader:</span>
          <span className="font-semibold text-slate-200 truncate">{team.leaderName}</span>
        </div>
      </div>

      <Link
        to={`/teams/${team.id}`}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/50 hover:border-indigo-700 transition"
      >
        <span>View Details</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </Link>
    </div>
  );
}
