// PGlite behavioral verification for migrations 001-003.
// NOTE: PGlite runs as superuser so RLS *enforcement* cannot be tested
// here — RLS is verified at the policy-definition level (pg_policies) plus
// SECURITY DEFINER auth checks, which DO execute. Full enforcement is
// covered by scripts/smoke-supabase.mjs against a live project.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Resolve relative to this file so the harness runs from any checkout
// (it previously hardcoded one machine's absolute paths, and pointed at a
// stubs file that was never committed there).
const here = dirname(fileURLToPath(import.meta.url));
const MIG = join(here, '../migrations');
const db = new PGlite();
await db.exec(readFileSync(join(here, 'stubs.sql'), 'utf8'));
for (const f of ['001_lms_core.sql', '002_phase2_community.sql', '003_production_backend.sql', '004_notify_and_counts.sql', '005_showcase_reads.sql', '006_payment_notes.sql', '007_classroom_upgrade.sql']) {
  await db.exec(readFileSync(`${MIG}/${f}`, 'utf8'));
}
console.log('migrations 001-007 applied clean');

const ADMIN = '11111111-1111-1111-1111-111111111111';
const STU = '22222222-2222-2222-2222-222222222222';
const STU2 = '33333333-3333-3333-3333-333333333333';
const COURSE = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const QUIZ = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const QUIZ2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc';
const Q_MC = 'c0000000-0000-0000-0000-000000000001';
const Q_TF = 'c0000000-0000-0000-0000-000000000002';
const Q_MA = 'c0000000-0000-0000-0000-000000000003';
const Q_SA = 'c0000000-0000-0000-0000-000000000004';
const Q2_1 = 'c0000000-0000-0000-0000-000000000005';
const ASG = 'd0000000-0000-0000-0000-000000000001';
const ASG_FINAL = 'd0000000-0000-0000-0000-000000000002';
const BUNDLE = 'e0000000-0000-0000-0000-000000000001';

let pass = 0, fail = 0;
const q = (sql, p = []) => db.query(sql, p);
const one = async (sql, p = []) => (await q(sql, p)).rows[0];
const as = (uid) => db.exec(`SET app.session_uid = '${uid}'`);
const anon = () => db.exec(`SET app.session_uid = ''`);
function assert(c, msg) { if (!c) throw new Error(msg || 'assertion failed'); }
async function t(name, fn) {
  try { await fn(); pass++; console.log('PASS', name); }
  catch (e) { fail++; console.log('FAIL', name, '-', String(e.message || e).split('\n')[0]); }
}
async function tErr(name, fn, match) {
  try { await fn(); fail++; console.log('FAIL', name, '- expected error, got success'); }
  catch (e) {
    if (match && !String(e.message || e).includes(match)) { fail++; console.log('FAIL', name, '- wrong error:', String(e.message).split('\n')[0]); }
    else { pass++; console.log('PASS', name); }
  }
}

// ---------- seed fixtures ----------
await q(`insert into auth.users (id, email, raw_user_meta_data) values
  ('${ADMIN}', 'admin@wolidantech.com', '{"full_name":"Site Admin"}'),
  ('${STU}', 'ada@example.com', '{"full_name":"Ada Lovelace","phone":"08030000001"}')`);
await q(`update profiles set role='admin' where id='${ADMIN}'`);
await q(`insert into categories (name) values ('Web Development')`);
await q(`insert into courses (id, slug, title, category, price) values
  ('${COURSE}', 'web-dev-test', 'Web Dev Test', 'Web Development', 50000)`);
await q(`insert into course_modules (course_id, title, position) values ('${COURSE}','M1',0) returning id`);
const modId = (await one(`select id from course_modules where course_id='${COURSE}'`)).id;
await q(`insert into course_lessons (course_id, module_id, title, position) values
  ('${COURSE}','${modId}','L1',0), ('${COURSE}','${modId}','L2',1), ('${COURSE}','${modId}','L3',2)`);
const lessons = (await q(`select id from course_lessons where course_id='${COURSE}' order by position`)).rows.map(r => r.id);
await q(`insert into quizzes (id, course_id, title, status, passing_score, allow_retake, attempt_limit) values
  ('${QUIZ}','${COURSE}','Q1','published',70,true,2),
  ('${QUIZ2}','${COURSE}','Q2','published',50,true,null)`);
await q(`insert into quiz_questions (id, quiz_id, type, question, options, correct_answer, correct_answers, accepted_answers) values
  ('${Q_MC}','${QUIZ}','multiple_choice','2+2?','["3","4","5"]',1,null,null),
  ('${Q_TF}','${QUIZ}','true_false','Sky is blue','["True","False"]',0,null,null),
  ('${Q_MA}','${QUIZ}','multiple_answer','Pick evens','["1","2","3","4"]',null,'[1,3]',null),
  ('${Q_SA}','${QUIZ}','short_answer','Capital city?','[]',null,null,'{Lagos,Eko}'),
  ('${Q2_1}','${QUIZ2}','multiple_choice','1+1?','["1","2","3"]',1,null,null)`);
await q(`insert into assignments (id, course_id, title, instructions, is_final_project) values
  ('${ASG}','${COURSE}','A1','Do it',false),
  ('${ASG_FINAL}','${COURSE}','Final','Build it',true)`);
await q(`insert into course_completion_rules (course_id, require_lessons_pct, require_quiz_avg, require_assignments_approved, require_final_project) values
  ('${COURSE}',100,0,0,false)`);
await q(`insert into coupons (code, discount_type, discount_value, active) values
  ('SAVE20','percentage',20,true),
  ('FREE100','free',100,true),
  ('OLD5','percentage',5,false),
  ('GONE','percentage',50,true)`);
await q(`update coupons set expires_at = now() - interval '1 day' where code='GONE'`);
await q(`insert into bundles (id, title, price, original_price, course_ids) values
  ('${BUNDLE}','Test Bundle',80000,100000,array['${COURSE}'::uuid])`);
console.log('fixtures seeded');

// ---------- H1: schema shape ----------
await t('H1 schema: tables/columns/buckets/constraints', async () => {
  const cols = await one(`select count(*) c from information_schema.columns
    where table_schema='public' and table_name='enrollments' and column_name in ('payment_id','approved_by')`);
  assert(Number(cols.c) === 2, 'enrollments link columns missing');
  const nul = await one(`select is_nullable n from information_schema.columns
    where table_schema='public' and table_name='manual_payments' and column_name='course_id'`);
  assert(nul.n === 'YES', 'manual_payments.course_id still NOT NULL');
  const buckets = await one(`select count(*) c from storage.buckets`);
  assert(Number(buckets.c) === 7, 'expected 7 buckets, got ' + buckets.c);
  const chk = await one(`select pg_get_constraintdef(oid) d from pg_constraint where conname='quiz_questions_type_check'`);
  assert(chk.d.includes('short_answer'), 'short_answer missing from CHECK');
  const ann = await one(`select count(*) c from information_schema.tables where table_schema='public' and table_name='announcements'`);
  assert(Number(ann.c) === 1, 'announcements missing');
  const trig = await one(`select count(*) c from pg_trigger where tgname='on_auth_user_created'`);
  assert(Number(trig.c) === 1, 'handle_new_user trigger missing');
  const sub = await one(`select count(*) c from information_schema.columns
    where table_schema='public' and table_name='course_lessons' and column_name in ('sub_lessons','resources')`);
  assert(Number(sub.c) === 2, 'lesson columns missing');
});

// ---------- H2: profile auto-create ----------
await t('H2 signup trigger creates profile', async () => {
  await q(`insert into auth.users (id, email, raw_user_meta_data) values
    ('${STU2}','bob@example.com','{"full_name":"Bob Student"}')`);
  const p = await one(`select full_name, role from profiles where id='${STU2}'`);
  assert(p.full_name === 'Bob Student' && p.role === 'student', 'profile not auto-created');
});

// ---------- H3: is_admin ----------
await t('H3 is_admin respects session user', async () => {
  await as(ADMIN); assert((await one(`select is_admin() a`)).a === true, 'admin not detected');
  await as(STU); assert((await one(`select is_admin() a`)).a === false, 'student seen as admin');
  await anon(); assert((await one(`select is_admin() a`)).a === false, 'anon seen as admin');
});

// ---------- H4: profile privilege protection ----------
await t('H4 profile self-escalation blocked, admin edit allowed', async () => {
  await as(STU);
  await q(`update profiles set bio='hello' where id='${STU}'`);
  await tErr('H4a student cannot self-promote', async () => {
    await q(`update profiles set role='admin' where id='${STU}'`);
  }, 'own role');
  await tErr('H4b student cannot unban', async () => {
    await q(`update profiles set banned=true where id='${STU}'`);
  }, 'ban status');
  await as(ADMIN);
  await q(`update profiles set phone='08039999999' where id='${STU}'`);
  const p = await one(`select phone from profiles where id='${STU}'`);
  assert(p.phone === '08039999999', 'admin edit failed');
});

// ---------- H5: redeem_coupon ----------
await t('H5 redeem_coupon: discount math + free instant enroll', async () => {
  await as(STU);
  const r1 = await one(`select redeem_coupon('SAVE20','${COURSE}') r`);
  assert(r1.r.discount === 10000 && r1.r.amountDue === 40000, 'SAVE20 math wrong: ' + JSON.stringify(r1.r));
  const r2 = await one(`select redeem_coupon('FREE100','${COURSE}') r`);
  assert(r2.r.amountDue === 0, 'FREE100 should be free');
  const en = await one(`select status, method from enrollments where user_id='${STU}' and course_id='${COURSE}'`);
  assert(en && en.status === 'active' && en.method === 'coupon', 'free coupon did not enroll');
  await t('H5a double redeem is duplicate-tolerant', async () => {
    const d = await one(`select redeem_coupon('FREE100','${COURSE}') r`);
    assert(d.r.valid === true && d.r.duplicate === true && d.r.amountDue === 0, 'dup wrong: ' + JSON.stringify(d.r));
    const rc = await one(`select count(*) c from coupon_redemptions where user_id='${STU}' and coupon_code='FREE100'`);
    assert(Number(rc.c) === 1, 'duplicate row inserted');
  });
  await t('H5b inactive rejected', async () => {
    const d = await one(`select redeem_coupon('OLD5','${COURSE}') r`);
    assert(d.r.valid === false && /inactive/.test(d.r.reason), 'wrong: ' + JSON.stringify(d.r));
  });
  await t('H5c expired rejected', async () => {
    const d = await one(`select redeem_coupon('GONE','${COURSE}') r`);
    assert(d.r.valid === false && /expired/.test(d.r.reason), 'wrong: ' + JSON.stringify(d.r));
  });
  await t('H5d bad code rejected', async () => {
    const d = await one(`select redeem_coupon('NOPE','${COURSE}') r`);
    assert(d.r.valid === false && /Invalid/.test(d.r.reason), 'wrong: ' + JSON.stringify(d.r));
  });
});

// ---------- H6: validate_coupon ----------
await t('H6 validate_coupon preview (no redemption)', async () => {
  await as(STU2);
  const v = await one(`select validate_coupon('SAVE20','${COURSE}') r`);
  assert(v.r.valid === true && v.r.discount === 10000 && v.r.amountDue === 40000, 'preview wrong');
  const bad = await one(`select validate_coupon('NOPE','${COURSE}') r`);
  assert(bad.r.valid === false, 'bad code marked valid');
  const n = await one(`select count(*) c from coupon_redemptions where user_id='${STU2}'`);
  assert(Number(n.c) === 0, 'preview wrote a redemption!');
});

// ---------- H7: submit_quiz_attempt ----------
await t('H7 server scoring: all types + limits + enrollment gate', async () => {
  await as(STU);
  const ans = {};
  ans[Q_MC] = 1; ans[Q_TF] = 0; ans[Q_MA] = [3, 1]; ans[Q_SA] = 'I live in LAGOS state';
  const a1 = await one(`select submit_quiz_attempt('${QUIZ}',$1) r`, [JSON.stringify(ans)]);
  assert(a1.r.score === 100 && a1.r.passed === true && a1.r.earned === 4 && a1.r.attemptNo === 1, 'perfect attempt wrong: ' + JSON.stringify(a1.r));
  assert(a1.r.details.length === 4, 'details missing');
  const xpq = await one(`select count(*) c from xp_events where user_id='${STU}' and rule='quiz_passed'`);
  assert(Number(xpq.c) === 1, 'quiz XP missing');
  const wrong = {}; wrong[Q_MC] = 0; wrong[Q_TF] = 1; wrong[Q_MA] = [1]; wrong[Q_SA] = 'nowhere';
  const a2 = await one(`select submit_quiz_attempt('${QUIZ}',$1) r`, [JSON.stringify(wrong)]);
  assert(a2.r.score === 0 && a2.r.passed === false && a2.r.attemptNo === 2, 'wrong attempt wrong: ' + JSON.stringify(a2.r));
  const xpq2 = await one(`select count(*) c from xp_events where user_id='${STU}' and rule='quiz_passed'`);
  assert(Number(xpq2.c) === 1, 'quiz XP awarded twice');
  await tErr('H7a attempt limit enforced', async () => {
    await q(`select submit_quiz_attempt('${QUIZ}',$1)`, [JSON.stringify(wrong)]);
  }, 'Attempt limit');
  await as(STU2);
  await tErr('H7b unenrolled blocked', async () => {
    await q(`select submit_quiz_attempt('${QUIZ2}',$1)`, ['{}']);
  }, 'not yet been approved');
  await anon();
  await tErr('H7c anon blocked', async () => {
    await q(`select submit_quiz_attempt('${QUIZ2}',$1)`, ['{}']);
  }, 'Not authenticated');
});

// ---------- H8: question secrecy ----------
await t('H8 answers hidden until attempted', async () => {
  const pol = await one(`select count(*) c from pg_policies where schemaname='public' and tablename='quiz_questions' and policyname='questions enrolled read'`);
  assert(Number(pol.c) === 0, 'student read policy on quiz_questions still exists');
  await as(STU);
  const qs = await one(`select get_quiz_questions('${QUIZ}') r`);
  assert(qs.r.length === 4, 'expected 4 questions');
  assert(!('correctAnswer' in qs.r[0]) && !('explanation' in qs.r[0]), 'answers leaked: ' + JSON.stringify(qs.r[0]));
  const rev = await one(`select get_quiz_review('${QUIZ}') r`);
  assert(rev.r[0].correctAnswer === 1, 'review missing answers');
  await as(STU2);
  await tErr('H8a review blocked pre-attempt', async () => { await q(`select get_quiz_review('${QUIZ}')`); }, 'Attempt the quiz first');
  await tErr('H8b unenrolled cannot fetch quiz', async () => { await q(`select get_quiz_questions('${QUIZ}')`); }, 'not yet been approved');
});

// ---------- H9: no direct attempt inserts ----------
await t('H9 quiz_attempts writable only via RPC', async () => {
  const pols = (await q(`select policyname, cmd from pg_policies where schemaname='public' and tablename='quiz_attempts'`)).rows;
  const studentInsert = pols.filter(p => p.cmd === 'INSERT' && p.policyname !== 'admin write attempts for all');
  assert(studentInsert.length === 0, 'student insert policy exists: ' + JSON.stringify(pols));
});

// ---------- H10: payment approval flow ----------
await t('H10 approve/reject payments atomically', async () => {
  await as(STU);
  const pay = await one(`insert into manual_payments (user_id, course_id, amount, reference, receipt_path, status)
    values ('${STU}','${COURSE}',40000,'REF-001','${STU}/r1.png','pending') returning id`);
  const pol = await one(`select with_check c from pg_policies where schemaname='public' and tablename='manual_payments' and policyname='students submit payments'`);
  assert(pol.c.includes('pending'), 'pending with-check missing: ' + pol.c);
  await tErr('H10a student cannot approve', async () => { await q(`select approve_payment('${pay.id}')`); }, 'Admin only');
  await as(ADMIN);
  const ok = await one(`select approve_payment('${pay.id}') r`);
  assert(ok.r.ok === true, 'approve failed');
  const st = await one(`select status, approved_by from manual_payments where id='${pay.id}'`);
  assert(st.status === 'approved' && st.approved_by === 'admin@wolidantech.com', 'payment row wrong');
  const en = await one(`select status, payment_id from enrollments where user_id='${STU}' and course_id='${COURSE}'`);
  assert(en.status === 'active' && en.payment_id === pay.id, 'enrollment not linked');
  const cnt = await one(`select students_count from courses where id='${COURSE}'`);
  assert(cnt.students_count === 1, 'students_count wrong: ' + cnt.students_count);
  const nt = await one(`select count(*) c from student_notifications where user_id='${STU}' and type='payment_approved'`);
  assert(Number(nt.c) === 1, 'approval notification missing');
  const au = await one(`select count(*) c from audit_logs where action='payment.approve'`);
  assert(Number(au.c) === 1, 'approval audit missing');
  await tErr('H10b double approve blocked', async () => { await q(`select approve_payment('${pay.id}')`); }, 'Already approved');
  const pay2 = await one(`insert into manual_payments (user_id, course_id, amount, reference, status)
    values ('${STU}','${COURSE}',40000,'REF-002','pending') returning id`);
  await tErr('H10c reason required', async () => { await q(`select reject_payment('${pay2.id}','')`); }, 'reason');
  await q(`select reject_payment('${pay2.id}','Receipt unreadable')`);
  const rj = await one(`select status, rejected_reason from manual_payments where id='${pay2.id}'`);
  assert(rj.status === 'rejected' && rj.rejected_reason === 'Receipt unreadable', 'reject wrong');
});

// ---------- H11: cert auto-issue (lessons-only) ----------
await t('H11 auto-issue on 100% lessons + revoke + masked verify', async () => {
  await as(STU);
  for (const L of lessons) await q(`insert into lesson_progress (user_id, course_id, lesson_id) values ('${STU}','${COURSE}','${L}')`);
  const certs = (await q(`select certificate_id, verification_code, status from certificate_issues where user_id='${STU}' and status='valid'`)).rows;
  assert(certs.length === 1, 'expected 1 valid cert, got ' + certs.length);
  assert(certs[0].certificate_id.startsWith('WDTH-'), 'bad cert id');
  const xpc = await one(`select count(*) c from xp_events where user_id='${STU}' and rule='course_complete'`);
  assert(Number(xpc.c) === 1, 'course_complete XP missing');
  const xpl = await one(`select count(*) c from xp_events where user_id='${STU}' and rule='lesson_complete'`);
  assert(Number(xpl.c) === 3, 'lesson XP wrong');
  await as(ADMIN);
  await tErr('H11a revoke needs admin', async () => { await as(STU); await q(`select revoke_certificate('${certs[0].certificate_id}')`); }, 'Admin only');
  await as(ADMIN);
  await q(`select revoke_certificate('${certs[0].certificate_id}')`);
  const rv = await one(`select status from certificate_issues where certificate_id='${certs[0].certificate_id}'`);
  assert(rv.status === 'revoked', 'not revoked');
  await anon();
  const vf = await one(`select verify_certificate('${certs[0].verification_code}') r`);
  assert(vf.r.found === true && vf.r.status === 'revoked', 'verify wrong: ' + JSON.stringify(vf.r));
  assert(vf.r.studentName === 'A***' && vf.r.studentName !== 'Ada Lovelace', 'name not masked: ' + vf.r.studentName);
  return certs[0];
});

// ---------- H12: cert gating (full rules) ----------
await t('H12 full completion rules gate issuance', async () => {
  await q(`update course_completion_rules set require_quiz_avg=70, require_assignments_approved=1, require_final_project=true where course_id='${COURSE}'`);
  await as(STU);
  // quiz2 correct attempt -> fires trigger; assignments still block
  const a = {}; a[Q2_1] = 1;
  await q(`select submit_quiz_attempt('${QUIZ2}',$1)`, [JSON.stringify(a)]);
  let n = await one(`select count(*) c from certificate_issues where user_id='${STU}' and status='valid'`);
  assert(Number(n.c) === 0, 'cert issued despite missing assignments');
  const s1 = await one(`insert into assignment_submissions (user_id, course_id, assignment_id, kind, text_content, status)
    values ('${STU}','${COURSE}','${ASG}','text','my work','submitted') returning id`);
  await as(ADMIN);
  await q(`update assignment_submissions set status='approved', score=85 where id='${s1.id}'`);
  n = await one(`select count(*) c from certificate_issues where user_id='${STU}' and status='valid'`);
  assert(Number(n.c) === 0, 'cert issued despite missing final project');
  const s2 = await one(`insert into assignment_submissions (user_id, course_id, assignment_id, kind, text_content, status)
    values ('${STU}','${COURSE}','${ASG_FINAL}','text','final work','submitted') returning id`);
  await q(`update assignment_submissions set status='approved', score=90 where id='${s2.id}'`);
  n = await one(`select count(*) c from certificate_issues where user_id='${STU}' and status='valid'`);
  assert(Number(n.c) === 1, 'cert NOT issued after all requirements met');
  const m = await one(`select issue_certificate_manual('${STU}','${COURSE}') r`);
  assert(m.r.existing === true, 'manual issue not idempotent');
});

// ---------- H13: leaderboard ----------
await t('H13 leaderboard: XP totals + levels', async () => {
  await as(STU);
  await q(`insert into reviews (user_id, course_id, student_name, rating, body) values ('${STU}','${COURSE}','Ada Lovelace',5,'Great!')`);
  const lb = await one(`select get_leaderboard(10) r`);
  const me = lb.r.find(e => e.userId === STU);
  assert(me, 'student missing from leaderboard');
  const total = await one(`select coalesce(sum(xp),0) s from xp_events where user_id='${STU}'`);
  assert(me.xp === Number(total.s), `leaderboard xp ${me.xp} != ledger ${total.s}`);
  assert(me.level === Math.floor(me.xp / 200) + 1, 'level formula mismatch');
  assert(lb.r[0].userId === STU, 'ranking wrong');
  await anon();
  await tErr('H13a anon blocked', async () => { await q(`select get_leaderboard(5)`); }, 'Not authenticated');
});

// ---------- H14/H15: admin RPCs ----------
await t('H14 get_admin_stats real aggregates', async () => {
  await as(ADMIN);
  const s = await one(`select get_admin_stats() r`);
  assert(s.r.totalStudents === 2 && s.r.revenue === 40000, 'stats wrong: ' + JSON.stringify(s.r));
  assert(s.r.certificatesIssued === 1 && s.r.quizAttempts === 3, 'stats counts wrong');
  await as(STU);
  await tErr('H14a student blocked', async () => { await q(`select get_admin_stats()`); }, 'Admin only');
});
await t('H15 get_student_detail bundles student record', async () => {
  await as(ADMIN);
  const d = await one(`select get_student_detail('${STU}') r`);
  assert(d.r.profile.email === 'ada@example.com', 'profile wrong');
  assert(d.r.enrollments.length === 1 && d.r.enrollments[0].doneLessons === 3, 'enrollments wrong');
  assert(d.r.payments.length === 2 && d.r.certificates.length === 2, 'payments/certs wrong');
  assert(d.r.submissions.length === 2, 'submissions wrong');
  await as(STU);
  await tErr('H15a student blocked', async () => { await q(`select get_student_detail('${STU}')`); }, 'Admin only');
});

// ---------- H16: public portfolio ----------
await t('H16 portfolio respects privacy toggle', async () => {
  await anon();
  const pf = await one(`select get_public_portfolio('${STU}') r`);
  assert(pf.r.found === true && pf.r.private === false, 'portfolio missing');
  assert(pf.r.projects.length === 2 && pf.r.certificates.length === 1, 'portfolio content wrong');
  assert(!('email' in pf.r.profile), 'email leaked in portfolio');
  await q(`update profiles set portfolio_public=false where id='${STU}'`);
  const pv = await one(`select get_public_portfolio('${STU}') r`);
  assert(pv.r.private === true, 'privacy toggle ignored');
  await q(`update profiles set portfolio_public=true where id='${STU}'`);
  const nf = await one(`select get_public_portfolio('99999999-9999-9999-9999-999999999999') r`);
  assert(nf.r.found === false, 'phantom portfolio');
});

// ---------- H17: showcase ----------
await t('H17 showcase lists approved public image work', async () => {
  await as(ADMIN);
  await q(`insert into assignment_submissions (user_id, course_id, assignment_id, kind, file_name, file_type, storage_path, status, score)
    values ('${STU}','${COURSE}','${ASG_FINAL}','file','design.png','image/png','${STU}/design.png','approved',95)`);
  await anon();
  const sh = await one(`select get_showcase(12) r`);
  assert(sh.r.length === 1 && sh.r[0].fileName === 'design.png', 'showcase wrong: ' + JSON.stringify(sh.r));
  // showcase-read storage expression: public-portfolio owner => readable
  await as(STU2);
  const can = await one(`select exists (select 1 from profiles p
    where p.id::text = (storage.foldername('${STU}/design.png'))[1] and p.portfolio_public = true) e`);
  assert(can.e === true, 'showcase storage expression false');
});

// ---------- H18: announcements ----------
await t('H18 announcements: admin write, auth read', async () => {
  const pols = (await q(`select policyname, cmd from pg_policies where schemaname='public' and tablename='announcements'`)).rows;
  assert(pols.length === 2, 'announcement policies wrong: ' + JSON.stringify(pols));
  await as(ADMIN);
  await q(`insert into announcements (title, message, created_by) values ('Hi','Welcome','admin@wolidantech.com')`);
  await as(STU);
  const n = await one(`select count(*) c from announcements`);
  assert(Number(n.c) === 1, 'student cannot read announcements');
});

// ---------- H19: bundle payment E2E + admin utility lockdown ----------
await t('H19 bundle payment approval fans out enrollments', async () => {
  await as(STU2);
  const pay = await one(`insert into manual_payments (user_id, bundle_id, bundle_course_ids, amount, reference, receipt_path, status)
    values ('${STU2}','${BUNDLE}',array['${COURSE}'::uuid],80000,'REF-B1','${STU2}/b1.png','pending') returning id`);
  await as(ADMIN);
  const ok = await one(`select approve_payment('${pay.id}') r`);
  assert(ok.r.ok === true && ok.r.courses[0] === COURSE, 'bundle approve wrong: ' + JSON.stringify(ok.r));
  const en = await one(`select status, method, payment_id from enrollments where user_id='${STU2}' and course_id='${COURSE}'`);
  assert(en.status === 'active' && en.method === 'manual' && en.payment_id === pay.id, 'bundle enrollment wrong');
  const cnt = await one(`select students_count from courses where id='${COURSE}'`);
  assert(cnt.students_count === 2, 'students_count wrong after bundle: ' + cnt.students_count);
  await as(STU2);
  await tErr('H19a enroll_bundle_courses is admin-only', async () => {
    await q(`select enroll_bundle_courses(null,'${STU2}',array['${COURSE}'::uuid],'x')`);
  }, 'Admin only');
  await as(ADMIN);
  await q(`insert into auth.users (id, email, raw_user_meta_data) values
    ('44444444-4444-4444-4444-444444444444','cara@example.com','{"full_name":"Cara"}')`);
  await q(`select enroll_bundle_courses(null,'44444444-4444-4444-4444-444444444444',array['${COURSE}'::uuid],'admin@wolidantech.com')`);
  const be = await one(`select status, approved_by from enrollments where user_id='44444444-4444-4444-4444-444444444444'`);
  assert(be.status === 'active' && be.approved_by === 'admin@wolidantech.com', 'admin bundle enroll wrong');
});

// ---------- H20: ratings, lesson-FK fix, views ----------
await t('H20 rating sync + discussion lesson FK + view events', async () => {
  const c = await one(`select rating from courses where id='${COURSE}'`);
  assert(Number(c.rating) === 5, 'rating not synced: ' + c.rating);
  await as(STU2);
  await q(`insert into reviews (course_id, user_id, student_name, rating, body) values ('${COURSE}','${STU2}','Bob',3,'Okay')`);
  const c2 = await one(`select rating from courses where id='${COURSE}'`);
  assert(Number(c2.rating) === 4, 'rating avg wrong: ' + c2.rating);
  await q(`insert into discussion_posts (course_id, lesson_id, user_id, author_name, title, body)
    values ('${COURSE}','${lessons[0]}','${STU2}','Bob','Q?','Help')`);
  await q(`insert into learning_events (user_id, course_id, kind) values ('${STU2}','${COURSE}','course_view')`);
  const v = await one(`select count(*) c from learning_events where user_id='${STU2}' and kind='course_view'`);
  assert(Number(v.c) === 1, 'view event not recorded');
});

// ---------- H21: 004 free-redeem notification + lessons_count ----------
await t('H21 free redeem notifies + lessons_count maintained', async () => {
  await q(`insert into coupons (code, discount_type, discount_value, active) values ('FREETEST','free',100,true)`);
  await as(STU2);
  const r = await one(`select redeem_coupon('FREETEST','${COURSE}') r`);
  assert(r.r.valid === true && r.r.isFree === true, 'free redeem wrong');
  const nt = await one(`select count(*) c from student_notifications where user_id='${STU2}' and type='coupon_approved'`);
  assert(Number(nt.c) === 1, 'coupon_approved notification missing');
  const lc = await one(`select lessons_count from courses where id='${COURSE}'`);
  assert(lc.lessons_count === 3, 'lessons_count wrong: ' + lc.lessons_count);
  const mod = await one(`select id from course_modules where course_id='${COURSE}'`);
  await q(`insert into course_lessons (course_id, module_id, title, position) values ('${COURSE}','${mod.id}','L4',3)`);
  const lc2 = await one(`select lessons_count from courses where id='${COURSE}'`);
  assert(lc2.lessons_count === 4, 'lessons_count not synced on insert');
  await q(`delete from course_lessons where course_id='${COURSE}' and title='L4'`);
  const lc3 = await one(`select lessons_count from courses where id='${COURSE}'`);
  assert(lc3.lessons_count === 3, 'lessons_count not synced on delete');
});

// ---------- H22: 005 showcase public-read policy ----------
await t('H22 showcase policy exposes only approved public images', async () => {
  const pol = await one(`select count(*) c from pg_policies where schemaname='storage' and tablename='objects' and policyname='showcase public read'`);
  assert(Number(pol.c) === 1, 'showcase public read policy missing');
  const def = await one(`select qual q from pg_policies where schemaname='storage' and tablename='objects' and policyname='showcase public read'`);
  for (const needle of ['submissions', 'approved', 'portfolio_public', 'image/']) {
    assert(String(def.q).includes(needle), 'showcase policy must scope to ' + needle);
  }
});

// ---------- H23: 006 optional payment submission note ----------
await t('H23 manual_payments.note is optional and stored', async () => {
  const col = await one(`select is_nullable from information_schema.columns
    where table_schema='public' and table_name='manual_payments' and column_name='note'`);
  assert(col && col.is_nullable === 'YES', 'note column missing or NOT NULL');
  await as(STU);
  const withNote = await one(`insert into manual_payments (user_id, course_id, amount, reference, status, note)
    values ('${STU}','${COURSE}',100,'REF-006-N','pending','Paid from a different account') returning note`);
  assert(withNote.note === 'Paid from a different account', 'note not stored');
  const withoutNote = await one(`insert into manual_payments (user_id, course_id, amount, reference, status)
    values ('${STU}','${COURSE}',100,'REF-006-X','pending') returning note`);
  assert(withoutNote.note === null, 'note should default to null');
  await anon();
});

// ---------- H24: 007 classroom upgrade ----------
await t('H24a lesson types cover the full classroom spectrum', async () => {
  await as(ADMIN);
  const mod = await one(`select id from course_modules where course_id='${COURSE}' limit 1`);
  for (const type of ['practical', 'quiz', 'assignment', 'project', 'resource']) {
    const r = await one(`insert into course_lessons (module_id, course_id, title, type, position)
      values ('${mod.id}','${COURSE}','H24 ${type}','${type}',90) returning type`);
    assert(r.type === type, `lesson type '${type}' rejected by constraint`);
    await q(`delete from course_lessons where course_id='${COURSE}' and title='H24 ${type}'`);
  }
  let rejected = false;
  try {
    await one(`insert into course_lessons (module_id, course_id, title, type, position)
      values ('${mod.id}','${COURSE}','H24 bad','hologram',90) returning id`);
  } catch { rejected = true; }
  assert(rejected, 'invalid lesson type was accepted by the constraint');
  await anon();
});

await t('H24b lesson_activity: students track own starts, never anyone else\u2019s', async () => {
  const less = await one(`select id from course_lessons where course_id='${COURSE}' order by position limit 1`);
  await as(STU);
  const row = await one(`insert into lesson_activity (user_id, course_id, lesson_id, video_seconds)
    values ('${STU}','${COURSE}','${less.id}',45)
    on conflict (user_id, lesson_id) do update set video_seconds = excluded.video_seconds
    returning video_seconds`);
  assert(Number(row.video_seconds) === 45, 'start/video progress not stored');
  // PGlite runs as superuser (RLS not enforced), so assert the policy that
  // protects this table on a real server exists and is scoped to user_id.
  const pol = await one(`select qual from pg_policies where tablename='lesson_activity' and policyname='own activity'`);
  assert(pol && String(pol.qual).includes('user_id'), 'own-rows policy missing on lesson_activity');
  await anon();
});

console.log(`\n==== RESULT: ${pass} passed, ${fail} failed ====`);
process.exit(fail ? 1 : 0);

