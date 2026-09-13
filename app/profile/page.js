"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/join");
        return;
      }
      
      setSession(session);
      
      // Fetch user's reviews
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setReviews(data);
      }
      
      setLoading(false);
    }
    
    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FF5630] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[40px] p-10 card-shadow border border-slate-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-slate-400">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-1">My Dashboard</h1>
              <p className="text-slate-500 font-medium">{session.user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-[40px] p-10 card-shadow border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900">My Reviews</h2>
            <Link 
              href="/directory" 
              className="text-[#FF5630] font-bold hover:underline"
            >
              Review another board &rarr;
            </Link>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No reviews yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-6">
                You haven&apos;t reviewed any job boards or recruiting tools yet. Share your experience to help the community!
              </p>
              <Link 
                href="/directory"
                className="inline-block px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-[#FF5630] transition-colors"
              >
                Browse Directory
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
                        {review.board_name}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900">{review.title}</h3>
                    </div>
                    <div className="flex text-amber-400 text-lg">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= review.rating ? "opacity-100" : "opacity-30"}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-4">{review.review_text}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Submitted on {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    <span className={`font-bold px-3 py-1 rounded-lg ${
                      review.status === 'approved' ? 'bg-teal-50 text-teal-600' :
                      review.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
