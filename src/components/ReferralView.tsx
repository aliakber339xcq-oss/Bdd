import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, CheckCircle2, Users, Gift, Trophy, Activity, Medal, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ReferralView({ user, onBack }: { user: User, onBack: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showCopiedCode, setShowCopiedCode] = useState(false);
  const [showCopiedLink, setShowCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReferralData = async () => {
    setLoading(true);
    
    // Get own profile
    const { data: prof } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
    if (prof) setProfile(prof);

    // Get referral history
    const { data: refs } = await supabase.from('referrals')
      .select('created_at, reward_amount, referred_user_id')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });
      
    if (refs && refs.length > 0) {
      // Fetch names separately since join might fail on auth.users
      const userIds = refs.map(r => r.referred_user_id);
      const { data: profiles } = await supabase.from('user_profiles').select('user_id, name').in('user_id', userIds);
      
      const enrichedRefs = refs.map(r => ({
        ...r,
        referred_name: profiles?.find(p => p.user_id === r.referred_user_id)?.name || 'Unknown User'
      }));
      setHistory(enrichedRefs);
    } else {
      setHistory([]);
    }

    // Get leaderboard
    const { data: leaders } = await supabase.from('user_profiles')
      .select('name, total_referrals')
      .order('total_referrals', { ascending: false })
      .limit(10);
      
    if (leaders) setLeaderboard(leaders);

    setLoading(false);
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleCopyCode = () => {
    if (profile?.my_referral_code) {
      navigator.clipboard.writeText(profile.my_referral_code);
      setShowCopiedCode(true);
      setTimeout(() => setShowCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (profile?.my_referral_code) {
      const refLink = `${window.location.origin}?ref=${profile.my_referral_code}`;
      navigator.clipboard.writeText(refLink);
      setShowCopiedLink(true);
      setTimeout(() => setShowCopiedLink(false), 2000);
    }
  };

  const claimBonus = async (milestone: number, bonusAmount: number) => {
    const { data, error } = await supabase.rpc('claim_referral_bonus', { p_milestone: milestone, p_bonus: bonusAmount });
    if (data === true) {
      alert(`🎉 আপনি ৳${bonusAmount} বোনাস পেয়েছেন!`);
      fetchReferralData();
    } else {
      alert('এখনও বোনাস ক্লেইম করার সময় হয়নি অথবা আগে নেওয়া হয়েছে।');
    }
  };

  const totalRefs = profile ? profile.total_referrals : 0;
  const claimedBonuses = profile?.bonuses_claimed || [];

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto pb-safe"
    >
      <div className="bg-indigo-600 rounded-b-[2rem] pt-safe px-5 pb-10 shadow-lg text-white sticky top-0 z-10 w-full max-w-md mx-auto">
        <div className="flex items-center gap-4 py-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">রেফার করুন ও আয় করুন</h1>
        </div>
        
        <div className="mt-4 text-center">
           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
             <Gift size={32} />
           </div>
           <h2 className="text-3xl font-black mb-1">৳১৫ <span className="text-lg font-medium text-indigo-200">প্রতি রেফারে</span></h2>
           <p className="text-indigo-100 text-sm">আপনার কোড শেয়ার করুন এবং বন্ধুদের জয়েন করিয়ে বোনাস পান!</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-6">
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 relative">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Users size={18} className="text-indigo-500" /> আপনার রেফারেল কোড</h3>
          {loading ? (
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse mb-3"></div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-2">
                <div className="flex-1 font-mono font-bold text-lg text-slate-800 flex items-center px-3 tracking-widest">
                  {profile?.my_referral_code || 'Loading...'}
                </div>
                <button onClick={handleCopyCode} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${showCopiedCode ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 text-white'}`}>
                  {showCopiedCode ? <><CheckCircle2 size={16} /> কপিড</> : <><Copy size={16} /> কোড</>}
                </button>
              </div>

              <div className="flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden p-2">
                <div className="flex-1 font-mono text-xs text-slate-500 flex items-center px-3 truncate overflow-hidden whitespace-nowrap">
                  {`${window.location.origin}?ref=${profile?.my_referral_code || ''}`}
                </div>
                <button onClick={handleCopyLink} className={`px-3 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${showCopiedLink ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-800 text-white'}`}>
                  {showCopiedLink ? <><CheckCircle2 size={16} /> কপিড</> : <><LinkIcon size={16} /> লিংক</>}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Medal size={18} className="text-indigo-500" /> টার্গেট বোনাস</h3>
          <p className="text-xs text-slate-500 mb-4">আপনি ইতিমধ্যে <span className="font-bold text-indigo-600">{totalRefs}</span> জনকে ইনভাইট করেছেন।</p>
          
          <div className="space-y-4">
            <MilestoneCard milestone={25} bonus={100} current={totalRefs} claimed={claimedBonuses.includes('25')} onClaim={() => claimBonus(25, 100)} />
            <MilestoneCard milestone={50} bonus={200} current={totalRefs} claimed={claimedBonuses.includes('50')} onClaim={() => claimBonus(50, 200)} />
            <MilestoneCard milestone={100} bonus={1000} current={totalRefs} claimed={claimedBonuses.includes('100')} onClaim={() => claimBonus(100, 1000)} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-indigo-500" /> রিসেন্ট ইনভাইট</h3>
           {loading ? (
             <p className="text-slate-500 text-sm">লোড হচ্ছে...</p>
           ) : history.length === 0 ? (
             <p className="text-slate-500 text-sm italic text-center py-4 bg-slate-50 rounded-xl">এখনও কাউকে ইনভাইট করেননি।</p>
           ) : (
             <div className="space-y-3">
               {history.slice(0, 5).map((h, i) => (
                 <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                   <div>
                     <div className="font-bold text-sm text-slate-800">{h.referred_name || 'Unknown User'}</div>
                     <div className="text-xs text-slate-400">{new Date(h.created_at).toLocaleDateString()}</div>
                   </div>
                   <div className="font-bold text-emerald-600 text-sm">+৳{h.reward_amount}</div>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-10">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Trophy size={18} className="text-amber-500" /> লিডারবোর্ড</h3>
           {loading ? (
             <p className="text-slate-500 text-sm">লোড হচ্ছে...</p>
           ) : leaderboard.length === 0 ? (
             <p className="text-slate-500 text-sm">কোনো ডেটা নেই।</p>
           ) : (
             <div className="space-y-4">
               {leaderboard.map((leader, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-amber-50/50 text-amber-800' : 'bg-slate-100 text-slate-500'}`}>
                     {i + 1}
                   </div>
                   <div className="flex-1 font-bold text-sm text-slate-700">{leader.name}</div>
                   <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{leader.total_referrals} রেফার</div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}

function MilestoneCard({ milestone, bonus, current, claimed, onClaim }: { milestone: number, bonus: number, current: number, claimed: boolean, onClaim: () => void }) {
  const percent = Math.min(100, Math.round((current / milestone) * 100));
  const isComplete = current >= milestone;
  
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercent(percent);
    }, 100);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden">
      <div className="flex justify-between items-end mb-2 relative z-10">
        <div>
          <div className="font-bold text-sm text-slate-700">{milestone} রেফারেলস</div>
          <div className="text-xs text-slate-500 font-medium">এক্সট্রা বোনাস: <span className="text-emerald-600 font-bold">৳{bonus}</span></div>
        </div>
        <div>
          {claimed ? (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">কালেক্টেড</span>
          ) : isComplete ? (
            <button onClick={onClaim} className="text-[10px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-lg shadow-sm transition-colors uppercase tracking-widest">কালেক্ট</button>
          ) : (
            <span className="text-xs font-bold text-slate-400">{current}/{milestone}</span>
          )}
        </div>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative z-10">
        <div className={`h-full transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${animatedPercent}%` }}></div>
      </div>
    </div>
  );
}
