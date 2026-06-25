'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Mail, 
  Phone, 
  Briefcase, 
  MapPin, 
  Award, 
  ArrowLeft,
  Loader2
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // State to store full profile details
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    phone_no: '',
    cabin_no: '',
    experience: 0
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

        // 2. Fetch User & Faculty Details (Joined Query)
        // We query the main 'users' table and join 'faculty_profiles'
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select(`
            full_name,
            email,
            faculty_profiles (
              department,
              phone_no,
              cabin_no,
              experience_years
            )
          `)
          .eq('id', user.id)
          .single();

        if (dbError) {
          console.error("Database Error:", dbError);
        }

        // 3. Map Data to State
        // Supabase returns the joined table as an object (single relationship)
        const facultyDetails = Array.isArray(userData?.faculty_profiles) 
            ? userData?.faculty_profiles[0] 
            : userData?.faculty_profiles;
        
        setProfile({
          name: userData?.full_name || 'Faculty Member',
          email: userData?.email || user.email || '',
          department: facultyDetails?.department || 'Not Assigned',
          phone_no: facultyDetails?.phone_no || 'Not Listed',
          cabin_no: facultyDetails?.cabin_no || 'Not Assigned',
          experience: facultyDetails?.experience_years || 0
        });

      } catch (err) {
        console.error('Error fetching user data:', err);
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
        <p className="font-medium animate-pulse">Loading profile information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Main Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-[1.5rem] md:rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl">
          
          {/* Header Section */}
          <div className="bg-slate-900 border-b border-slate-700/50 px-8 py-10 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
              
               <div className="text-center md:text-left text-white">
                  <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                  <p className="text-slate-400 font-medium text-lg flex items-center justify-center md:justify-start gap-2 mt-1">
                     <Briefcase className="w-4 h-4 text-teal-400" /> {profile.department} Department
                  </p>
               </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="px-8 py-10">
            <h2 className="text-lg font-bold text-white border-b border-slate-700/50 pb-4 mb-6">
                Contact & Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Email */}
              <div className="group p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-teal-500/50 transition-colors">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Mail className="w-3 h-3" /> Email Address
                 </label>
                 <p className="text-white font-semibold">{profile.email}</p>
              </div>

              {/* Phone */}
              <div className="group p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-teal-500/50 transition-colors">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Phone className="w-3 h-3" /> Phone Number
                 </label>
                 <p className="text-white font-semibold">{profile.phone_no}</p>
              </div>

              {/* Cabin */}
              <div className="group p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-teal-500/50 transition-colors">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3" /> Cabin / Office
                 </label>
                 <p className="text-white font-semibold">{profile.cabin_no}</p>
              </div>

              {/* Experience */}
              <div className="group p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-teal-500/50 transition-colors">
                 <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Award className="w-3 h-3" /> Experience
                 </label>
                 <p className="text-white font-semibold">{profile.experience} Years</p>
              </div>

            </div>

            {/* Back Button */}
            <div className="mt-10 pt-6 border-t border-slate-700/50 flex justify-end">
              <button
                onClick={() => router.push('/main/faculty/dashboard')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-300 bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800/60 hover:text-white transition-all shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
