import { Link } from 'react-router-dom';
import { DatabaseZap, Stethoscope, SearchX } from 'lucide-react';

// Shown when the course grid has nothing to render.
//
// An empty grid has two completely different causes and the old UI reported
// both as "No courses found — try adjusting search or category", which sends
// an administrator hunting for a search bug when the real problem is the
// backend. This component separates them:
//
//   filtering  -> the visitor typed/filtered themselves into an empty result
//   backend    -> the catalog query failed, or returned nothing because the
//                 seed was never run / every course is still unpublished
export default function CatalogEmpty({ filtering = false, error = null, compact = false, onRetry = null, emptyCategory = null, onClearCategory = null }) {
  if (filtering) {
    return (
      <div className={`text-center glass rounded-[24px] ${compact ? 'py-10' : 'py-20'}`}>
        <SearchX className="h-10 w-10 mx-auto text-white/20 mb-4" />
        <div className="font-bold text-lg">{emptyCategory ? 'Nothing is open in this subject yet' : 'No courses match that search'}</div>
        <div className="text-sm text-white/50 mt-1 max-w-[420px] mx-auto">
          {emptyCategory
            ? <>Every course in <span className="text-white/80 font-semibold">{emptyCategory}</span> is unpublished or archived. Browse the whole library, or ask us on WhatsApp to open this subject.</>
            : 'Try a different keyword or category'}
        </div>
        {emptyCategory && (
          <button onClick={onClearCategory} className="mt-4 min-h-11 inline-flex items-center gap-2 px-5 rounded-full glass text-xs font-bold hover:bg-white/10 transition">
            SHOW ALL COURSES
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`text-center glass-strong rounded-[24px] ${compact ? 'py-8 px-5' : 'py-16 px-6'} max-w-[620px] mx-auto`}>
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mx-auto mb-5">
        <DatabaseZap className="h-7 w-7 text-[#020a1f]" />
      </div>
      <div className="font-display font-black text-xl sm:text-2xl">The catalog isn’t loaded</div>
      <p className="text-sm text-white/60 mt-2 leading-relaxed max-w-[460px] mx-auto">
        {error ? (
          <>
            The request to the database failed: <span className="text-rose-300 font-semibold">{error}</span>
          </>
        ) : (
          <>
            Courses come from the database, and it returned none. That usually means the seed file was
            never run, or every course is still a draft — unpublished courses are hidden from visitors
            by row-level security.
          </>
        )}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {error && onRetry && (
          <button type="button" onClick={onRetry} className="inline-flex items-center h-11 px-6 rounded-full bg-white text-black font-bold text-sm hover:bg-white/90">
            TRY AGAIN
          </button>
        )}
        <Link
          to="/backend-status"
          className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-sm transition hover:brightness-110"
        >
          <Stethoscope className="h-4 w-4" /> RUN DIAGNOSTICS
        </Link>
        {!error && (
          <span className="text-[11px] text-white/35 max-w-[220px]">
            Admins: run <code className="font-mono text-white/55">seed_12_courses.sql</code> then{' '}
            <code className="font-mono text-white/55">publish_courses.sql</code>
          </span>
        )}
      </div>
    </div>
  );
}
