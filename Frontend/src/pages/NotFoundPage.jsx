import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-base mb-4 shadow-subtle">
        404
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-1">Page not found</h1>
      <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="sm" leftIcon={Home}>
            Back to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="sm">
            Landing Page
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
