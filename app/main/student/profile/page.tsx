'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // State for student details
  const [student, setStudent] = useState({
    email: '',
    sessionCode: '',
    joinedAt: '',
    role: 'Student'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Get Auth User
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/auth/login');
          return;
        }

        // 2. Fetch Data (Joined Query)
        // We select session_code from 'student_profiles' AND join 'users' to get created_at
        const { data: profileData, error: dbError } = await supabase
          .from('student_profiles')
          .select(`
            session_code,
            users:user_id ( created_at, email )
          `)
          .eq('user_id', user.id)
          .single();

        if (dbError) {
          console.error("Database Error:", dbError);
        }

        // 3. Parse Data
        // The join returns 'users' as an object or array depending on the relationship
        // In a 1:1 relationship, Supabase usually returns it as a single object if configured,
        // otherwise we safe-check it.
        const userData = Array.isArray(profileData?.users) 
            ? profileData?.users[0] 
            : profileData?.users;

        setStudent({
          email: user.email || 'No Email',
          sessionCode: profileData?.session_code || 'Not Generated',
          joinedAt: userData?.created_at 
            ? new Date(userData.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) 
            : 'Unknown',
          role: 'Student'
        });

      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
        <p className="font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Main Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-8 py-12 relative overflow-hidden">
          
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
               {/* Avatar */}
               <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 p-1 shadow-lg shadow-teal-500/20 group cursor-default shrink-0">
                 <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-900 group-hover:bg-slate-800 transition-colors">
                   <User className="w-12 h-12 text-teal-400 group-hover:scale-110 transition-transform" />
                 </div>
               </div>
               
               <div className="text-center md:text-left text-white">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-3">Student Profile</h1>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold shadow-inner">
                     <Shield className="w-4 h-4" />
                     Manage Identity
                  </div>
               </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="px-8 py-10 relative">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                Account Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Email */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300">
                 <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 group-hover:text-teal-300  border border-slate-700/50 shadow-sm">
                     <Mail className="w-5 h-5" />
                   </div>
                   <div className="overflow-hidden">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Email Address
                     </label>
                     <p className="text-white font-medium truncate" title={student.email}>{student.email}</p>
                   </div>
                 </div>
              </div>

              {/* Session Code (Anonymous ID) */}
              <div className="md:col-span-2 group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300">
                 <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 group-hover:text-teal-300  border border-slate-700/50 shadow-sm">
                     <Shield className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                     <label className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        Anonymous Username
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                          ACTIVE
                        </span>
                     </label>
                     <p className="text-white font-mono text-2xl font-bold tracking-widest bg-slate-900/50 inline-block px-4 py-2 rounded-lg border border-slate-700/50 group-hover:border-teal-500/50 transition-colors">
                       {student.sessionCode}
                     </p>
                     <p className="text-sm text-slate-400 mt-3 font-medium">
                       This ID hides your real name in complaints & marketplace.
                     </p>
                   </div>
                 </div>
              </div>

              {/* Account Type */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300">
                 <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 group-hover:text-teal-300  border border-slate-700/50 shadow-sm">
                     <User className="w-5 h-5" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Account Type
                     </label>
                     <p className="text-white font-medium">Verified Student</p>
                   </div>
                 </div>
              </div>

              {/* Joined Date */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-1 transition-all duration-300">
                 <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 group-hover:text-teal-300  border border-slate-700/50 shadow-sm">
                     <Calendar className="w-5 h-5" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Joined Date
                     </label>
                     <p className="text-white font-medium">{student.joinedAt}</p>
                   </div>
                 </div>
              </div>

            </div>

            {/* Back Button */}
            <div className="mt-10 pt-8 border-t border-slate-700/50 flex justify-end">
              <button
                onClick={() => router.push('/main/student/dashboard')}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-slate-800 hover:bg-teal-600 border border-slate-700/50 hover:border-teal-500 transition-all shadow-sm hover:shadow-teal-500/20"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
