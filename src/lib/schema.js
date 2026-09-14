// ============================================================
// Schema resolver — ONE classroom, TWO compatible schema lineages.
// ------------------------------------------------------------
// WOLI DAN TECH HUB's live Supabase project has grown from two repos:
//   * the frontend lineage (this repo, migrations 001-009):
//     course_lessons / course_content / course_videos, lowercase statuses
//   * the backend lineage (Tech-hub-backend, 20260910000010+):
//     lessons / lesson_content / lesson_videos, content_status enum
//
// The classroom must render the REAL curriculum on either. Instead of
// guessing, we probe once per page load (cheap HEAD-count requests, cached)
// and every curriculum read maps through the resolved shape. Missing
// optional tables (topics/practicals/resources — e.g. migration 009 has not
// been run yet) degrade to absent features instead of throwing.
// ============================================================
import { requireSb } from './supabase';

const MISSING_RELATION = ['42P01', 'PGRST205', 'PGRST202'];
const MISSING_COLUMN = ['42703', 'PGRST204'];

let cached = null;

const head = async (query) => {
  const { error } = await query;
  return error ? { code: String(error.code || ''), message: String(error.message || '') } : null;
};

/**
 * Resolve the live curriculum shape. Never throws: on total network failure
 * we fall back to the frontend lineage (this repo's migrations) so the
 * classroom still renders from cache-friendly queries that surface real
 * errors through the normal error states.
 */
export async function resolveSchemaShape() {
  if (cached) return cached;
  let sb;
  try { sb = requireSb(); } catch { return cached || defaultShape(); }

  const tableExists = async (name) => {
    const err = await head(sb.from(name).select('id', { count: 'exact', head: true }));
    return !(err && MISSING_RELATION.includes(err.code));
  };
  const columnExists = async (table, col) => {
    const err = await head(sb.from(table).select(col, { count: 'exact', head: true }));
    return !(err && (MISSING_COLUMN.includes(err.code) || MISSING_RELATION.includes(err.code)));
  };

  let shape = defaultShape();
  try {
    // lessons table: prefer the frontend name, fall back to the backend one
    const lessonsTable = await tableExists('course_lessons') ? 'course_lessons'
      : (await tableExists('lessons') ? 'lessons' : null);
    const contentTable = await tableExists('course_content') ? 'course_content'
      : (await tableExists('lesson_content') ? 'lesson_content' : null);
    const videosTable = await tableExists('course_videos') ? 'course_videos'
      : (await tableExists('lesson_videos') ? 'lesson_videos' : null);

    // module order column (position vs order_number)
    const modulesOrderedBy = (await columnExists('course_modules', 'position')) ? 'position' : 'order_number';
    const lessonsHasCourseId = lessonsTable ? await columnExists(lessonsTable, 'course_id') : false;
    const lessonsOrderCol = lessonsTable && (await columnExists(lessonsTable, 'position')) ? 'position' : 'order_number';
    const lessonsHasPublished = lessonsTable ? await columnExists(lessonsTable, 'published') : false;
    const contentBodyCol = contentTable === 'course_content' ? 'body_markdown' : 'content';
    const contentChunked = contentTable === 'lesson_content';
    const videosUrlCol = videosTable === 'course_videos' ? 'url' : 'video_url';
    const videosProviderCol = videosTable === 'course_videos' ? await columnExists('course_videos', 'provider') : false;
    const videosApprovedStatus = videosTable === 'course_videos' ? 'published' : 'COMPLETED';

    const hasTopics = await tableExists('course_topics');
    const hasPracticals = await tableExists('lesson_practicals');
    const hasResources = await tableExists('course_resources');
    const hasPracticalSubs = await tableExists('practical_submissions');
    const lessonsHasTopicId = lessonsTable ? await columnExists(lessonsTable, 'topic_id') : false;
    // Backend `quizzes.status` uses the uppercase content_status enum.
    let quizStatusValues = ['published'];
    if (await tableExists('quizzes')) {
      const err = await head(sb.from('quizzes').select('status', { count: 'exact', head: true }).eq('status', 'published'));
      if (err && (err.code === '22P02' || /invalid input value/.test(err.message))) quizStatusValues = ['PUBLISHED', 'APPROVED'];
    }

    shape = {
      lessonsTable, lessonsOrderCol, lessonsHasCourseId, lessonsHasPublished, lessonsHasTopicId,
      modulesOrderedBy, contentTable, contentBodyCol, contentChunked,
      videosTable, videosUrlCol, videosProviderCol, videosApprovedStatus,
      hasTopics, hasPracticals, hasResources, hasPracticalSubs,
      quizStatusValues,
    };
    cached = shape;
  } catch {
    cached = cached || defaultShape();
  }
  return cached;
}

/** Force re-detection (used by admin "repair catalog" and after migrations). */
export function resetSchemaShape() { cached = null; }

function defaultShape() {
  return {
    lessonsTable: 'course_lessons', lessonsOrderCol: 'position', lessonsHasCourseId: true,
    lessonsHasPublished: false, lessonsHasTopicId: true,
    modulesOrderedBy: 'position', contentTable: 'course_content', contentBodyCol: 'body_markdown',
    contentChunked: false, videosTable: 'course_videos', videosUrlCol: 'url',
    videosProviderCol: true, videosApprovedStatus: 'published',
    hasTopics: true, hasPracticals: true, hasResources: true, hasPracticalSubs: true,
    quizStatusValues: ['published'],
  };
}

/** True for errors that mean "this optional table/column is not provisioned". */
export function isMissingRelationErr(err) {
  const code = String(err?.code || '');
  const msg = String(err?.message || '');
  return MISSING_RELATION.includes(code)
    || /could not find the (table|view)|relation .* does not exist/i.test(msg);
}

/**
 * Run a query; return [] (not a throw) when the relation is simply absent.
 * Real failures (auth, network, RLS) still reject so error states surface.
 */
export async function optionalQuery(query) {
  const { data, error } = await query;
  if (error && isMissingRelationErr(error)) return [];
  if (error) throw error;
  return data || [];
}
