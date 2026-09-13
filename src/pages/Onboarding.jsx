import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { toast, Toaster } from 'sonner';

const GOALS = ['Get a job in tech', 'Freelance & earn online', 'Grow my business', 'Create content', 'Build apps/websites', 'Learn AI skills', 'Go to university prepared', 'Start a tech career'];

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const { categories } = useLMS();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState([]);
  const [skillLevel, setSkillLevel] = useState('Complete Beginner');
  const [goals, setGoals] = useState([]);

  if (!user) return <Navigate to="/login" />;
  if (user.onboarded) return <Navigate to="/dashboard" />;

  const toggle = (list, set, v) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const finish = async () => {
    try {
      await updateProfile({ interests, skillLevel, careerGoals: goals, onboarded: true });
      toast.success('Welcome aboard! 🎉 Recommendations ready.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020a1f] via-[#061236] to-[#020a1f] py-12">
      <Toaster richColors />
      <div className="mx-auto max-w-[720px] px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-[11px] font-bold tracking-widest"><Sparkles className="h-4 w-4 text-cyan-300" /> PERSONALIZE YOUR LEARNING</div>
          <h1 className="font-display font-black text-[32px] mt-3">Welcome, {user.fullName.split(' ')[0]}! 👋</h1>
          <p className="text-white/60 mt-2">Answer 3 quick questions so we can recommend the perfect courses for you.</p>
          <div className="flex gap-2 justify-center mt-4">
            {[0, 1, 2].map((i) => <div key={i} className={`h-2 w-16 rounded-full ${i <= step ? 'bg-gradient-to-r from-cyan-400 to-blue-600' : 'bg-white/10'}`} />)}
          </div>
        </div>

        <div className="glass-strong rounded-[24px] p-8">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-bold text-xl">What are you interested in?</h2>
              <p className="text-sm text-white/50">Pick as many as you like.</p>
              <div className="flex flex-wrap gap-2 max-h-[300px] overflow-auto">
                {categories.map((c) => (
                  <button key={c} onClick={() => toggle(interests, setInterests, c)} className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${interests.includes(c) ? 'bg-gradient-to-r from-cyan-400 to-blue-600' : 'glass text-white/60'}`}>
                    {interests.includes(c) && <Check className="h-3 w-3" />} {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-bold text-xl">What's your current skill level?</h2>
              <div className="grid gap-3">
                {['Complete Beginner', 'Some Basics', 'Intermediate', 'Advanced'].map((l) => (
                  <button key={l} onClick={() => setSkillLevel(l)} className={`p-4 rounded-2xl border text-left font-bold ${skillLevel === l ? 'border-cyan-400 bg-cyan-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
                    {l}
                    <span className="block text-xs font-normal text-white/50 mt-0.5">
                      {l === 'Complete Beginner' && 'I\'m starting from zero — guide me step by step.'}
                      {l === 'Some Basics' && 'I know a little and want to go deeper.'}
                      {l === 'Intermediate' && 'I can build basic things on my own.'}
                      {l === 'Advanced' && 'I want mastery, projects and income.'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-xl">What are your career goals?</h2>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button key={g} onClick={() => toggle(goals, setGoals, g)} className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${goals.includes(g) ? 'bg-gradient-to-r from-cyan-400 to-blue-600' : 'glass text-white/60'}`}>
                    {goals.includes(g) && <Check className="h-3 w-3" />} {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button onClick={() => (step === 0 ? navigate('/dashboard') : setStep(step - 1))} className="text-sm font-bold text-white/50 hover:text-white">{step === 0 ? 'SKIP FOR NOW' : '← BACK'}</button>
            {step < 2 ? (
              <button onClick={() => setStep(step + 1)} disabled={step === 0 && interests.length === 0} className="btn-primary !py-3 disabled:opacity-40">CONTINUE <ArrowRight className="h-4 w-4 ml-1" /></button>
            ) : (
              <button onClick={finish} className="btn-primary !py-3">SHOW MY RECOMMENDATIONS 🎯</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
