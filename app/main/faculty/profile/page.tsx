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
} from "lucide-react";
import { ProfileSkeleton } from '@/components/shared/Skeletons';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
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
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push('/auth/login');
          return;
        }

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
          toast.error("Failed to load profile data");
          console.error("Database Error:", dbError);
        }

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
        toast.error("Failed to load profile data");
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
          
        {/* Main Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl md:rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl relative">
          
          {/* Header Section */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 border-b border-slate-700/50 px-8 py-12 relative overflow-hidden">
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
               {/* Avatar */}
               <div className="w-28 h-28 rounded-full bg-linear-to-br from-teal-400 to-blue-500 p-1 shadow-lg shadow-teal-500/20 group cursor-default shrink-0">
                 <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-900 transition-colors">
                   <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-blue-400">
                     {profile.name.charAt(0).toUpperCase() || 'F'}
                   </span>
                 </div>
               </div>
               
               <div className="text-center md:text-left text-white">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-3">{profile.name}</h1>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-semibold shadow-inner">
                     <Briefcase className="w-4 h-4" />
                     {profile.department}
                  </div>
               </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="px-8 py-10 relative">
            <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                Contact & Professional Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Email */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300">
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 border border-slate-700/50 shadow-sm">
                     <Mail className="w-5 h-5" />
                   </div>
                   <div className="overflow-hidden">
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Email Address
                     </label>
                     <p className="text-white font-medium truncate" title={profile.email}>{profile.email}</p>
                   </div>
                 </div>
              </div>

              {/* Phone */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300">
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 border border-slate-700/50 shadow-sm">
                     <Phone className="w-5 h-5" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Phone Number
                     </label>
                     <p className="text-white font-medium">{profile.phone_no}</p>
                   </div>
                 </div>
              </div>

              {/* Cabin */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300">
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 border border-slate-700/50 shadow-sm">
                     <MapPin className="w-5 h-5" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Cabin / Office
                     </label>
                     <p className="text-white font-medium">{profile.cabin_no}</p>
                   </div>
                 </div>
              </div>

              {/* Experience */}
              <div className="group relative p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60 hover:border-teal-500/30 transition-all duration-300">
                 <div className="flex items-start gap-4">
                   <div className="p-3 rounded-xl bg-slate-900/80 text-teal-400 border border-slate-700/50 shadow-sm">
                     <Award className="w-5 h-5" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                        Experience
                     </label>
                     <p className="text-white font-medium">{profile.experience} Years</p>
                   </div>
                 </div>
              </div>

            </div>

            {/* Back Button */}
            <div className="mt-10 pt-8 border-t border-slate-700/50 flex justify-end">
              <button
                onClick={() => router.push('/main/faculty/dashboard')}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-slate-800 hover:bg-teal-600 border border-slate-700/50 hover:border-teal-500 transition-all shadow-sm"
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
