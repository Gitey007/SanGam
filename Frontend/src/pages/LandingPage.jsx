import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Users, Sparkles, Code2, ShieldCheck, Check } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
              SG
            </div>
            <span className="font-semibold text-base text-slate-900 tracking-tight">SanGam</span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                  Open Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Built for college students & innovators</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1] max-w-3xl mx-auto text-balance">
            Find people. <br />
            <span className="text-slate-500">Build something together.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
            SanGam helps students discover peers with complementary skills and build teams for projects, hackathons, and research ideas across campuses.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={ArrowRight}>
                {isAuthenticated ? "Go to Workspace" : "Get started with SanGam"}
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </section>

        {/* Product Workflow Preview */}
        <section className="py-16 bg-slate-50 border-y border-slate-200/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                How it works
              </h2>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">
                From discovery to collaborative building
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4 font-semibold text-sm">
                    01
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Create Profile & Skills
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Set up your college, branch, academic year, and showcase the technologies and tools you excel at.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-400">
                  Step 1: Setup Identity
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4 font-semibold text-sm">
                    02
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Discover Collaborators
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Filter students by college scope (My College or Inter-College), academic year, and specific skill requirements.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-400">
                  Step 2: Targeted Matching
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 mb-4 font-semibold text-sm">
                    03
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Form Teams & Build
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Form project teams with complementary skillsets to tackle hackathons, course capstones, and innovative ideas.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-400">
                  Step 3: Team Collaboration
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Focus Areas */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider block mb-2">
                Focused on authenticity
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                Designed for practical student networking
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                SanGam replaces scattered campus chat groups with a clean, searchable index of student developers, designers, and builders.
              </p>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Instant scope filtering across your campus or other institutions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Flexible authentication with secure passwords or email OTP verification</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Skill-based discovery with clean, distraction-free profiles</span>
                </div>
              </div>
            </div>

            {/* Preview Card Mock */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-card">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-subtle">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
                      SK
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">Sahul Kumar</div>
                      <div className="text-[11px] text-slate-500">CSE · Year 3 · ABES Engineering College</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">
                    My College
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  Building backend services with Spring Boot and distributed systems. Looking for frontend collaborators.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    Java
                  </span>
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    Spring Boot
                  </span>
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    React
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            SanGam — Student Collaboration Platform
          </div>
          <div>
            Built with modern web technologies & Spring Boot backend.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
