"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthApiError } from "@supabase/supabase-js";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Building, MapPin, Phone, Briefcase } from "lucide-react";
import { toast } from "sonner";

import {
  ensureOwnUserRow,
  ensureStudentSessionCode,
  fetchUserRole,
} from "@/lib/authProfile";
import { supabase } from "@/lib/supabaseClient";
import { ROUTES } from "@/lib/routes";
import { verifyFacultyCode } from "./actions";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Faculty specific fields
  const [isFaculty, setIsFaculty] = useState(false);
  const [facultyCode, setFacultyCode] = useState("");
  const [department, setDepartment] = useState("");
  const [cabinNo, setCabinNo] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [experience, setExperience] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    const checkAuth = async () => {
      const role = sessionStorage.getItem("userRole");
      if (role === "student") {
        router.replace(ROUTES.STUDENT.DASHBOARD);
        return;
      } else if (role === "faculty" || role === "admin") {
        router.replace(ROUTES.FACULTY.DASHBOARD);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const fetchedRole = await fetchUserRole(session.user.id);
        sessionStorage.setItem("userRole", fetchedRole);
        if (fetchedRole === "student") {
          const sessionCode = await ensureStudentSessionCode(session.user.id);
          if (sessionCode) sessionStorage.setItem("userSessionCode", sessionCode);
          router.replace(ROUTES.STUDENT.DASHBOARD);
        } else if (fetchedRole === "faculty" || fetchedRole === "admin") {
          router.replace(ROUTES.FACULTY.DASHBOARD);
        }
      }
    };
    checkAuth();
  }, [router]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      toast.error("Full name is required.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    if (isFaculty) {
      if (!facultyCode.trim()) {
        toast.error("Faculty Access Code is required.");
        setIsLoading(false);
        return;
      }
      if (phoneNo.length !== 10) {
        toast.error("Phone number must be exactly 10 digits.");
        setIsLoading(false);
        return;
      }

      try {
        const isValid = await verifyFacultyCode(facultyCode);
        if (!isValid) {
          toast.error("Invalid Faculty Access Code. Registration denied.");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        toast.error("Error verifying Faculty Code. Please try again later.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            role: isFaculty ? "admin" : "student",
            department: isFaculty ? (department.trim() || null) : null,
            cabin_no: isFaculty ? (cabinNo.trim() || null) : null,
            phone_no: isFaculty ? (phoneNo.trim() || null) : null,
            experience_years: isFaculty ? (experience ? parseInt(experience) : 0) : null,
          },
        },
      });

      if (error || !data.user) {
        throw new Error(error?.message || "Signup failed.");
      }

      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error("An account with this email already exists. Please log in instead.");
      }

      if (data.session) {
        await ensureOwnUserRow(data.user);

        const role = await fetchUserRole(data.user.id);
        sessionStorage.setItem("userRole", role);

        if (role === "faculty" || role === "admin") {
          sessionStorage.removeItem("userSessionCode");
          toast.success("Account created! Welcome, Professor.");
          router.replace(ROUTES.FACULTY.DASHBOARD);
          return;
        }

        const sessionCode = await ensureStudentSessionCode(data.user.id);
        sessionStorage.setItem("userSessionCode", sessionCode);
        toast.success("Account created! Welcome to EchoCampus.");
        router.replace(ROUTES.STUDENT.DASHBOARD);
        return;
      }

      toast.success("Account created. Check your email to confirm it, then sign in.");
    } catch (error: unknown) {
      let message =
        error instanceof Error ? error.message : "Something went wrong.";

      if (error instanceof AuthApiError) {
        const statusText = error.status ? ` (HTTP ${error.status})` : "";
        message = `${error.message}${statusText}`;
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isPhoneInvalid = isFaculty && phoneNo.length > 0 && phoneNo.length !== 10;

  return (
    <div className="min-h-[100dvh] w-full bg-background flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="relative w-full max-w-md">
        <div className="bg-surface backdrop-blur-xl rounded-2xl shadow-xl border border-border p-6 sm:p-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-2 tracking-tight">
              Join <span className="text-primary">EchoCampus</span>
            </h3>
            <p className="text-sm md:text-base text-text-muted font-medium">
              Create your account to get started.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 md:space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-sm font-semibold text-text-secondary">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="full_name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all duration-300 hover:bg-surface-hover"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-text-secondary">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-2.5 md:py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all duration-300 hover:bg-surface-hover"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-text-secondary">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-text-disabled group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-11 pr-12 py-2.5 md:py-3 bg-surface border border-border rounded-xl text-text-primary placeholder-text-disabled focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all duration-300 hover:bg-surface-hover"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-disabled hover:text-text-secondary transition-colors duration-200 focus:outline-none focus-visible:text-primary rounded-r-xl"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Faculty Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input
                id="faculty-checkbox"
                type="checkbox"
                checked={isFaculty}
                onChange={(e) => setIsFaculty(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-input-focus/50 bg-surface"
              />
              <label htmlFor="faculty-checkbox" className="text-sm font-medium text-text-secondary cursor-pointer">
                I am a Faculty Member
              </label>
            </div>

            {/* Dynamic Faculty Fields */}
            {isFaculty && (
              <div className="space-y-4 p-4 bg-surface rounded-xl border border-border animate-in fade-in slide-in-from-top-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider">Faculty Access Code *</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-primary/70" />
                    </div>
                    <input
                      type="text"
                      required
                      value={facultyCode}
                      onChange={(e) => setFacultyCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-primary/30 rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 text-sm transition-all hover:bg-surface-hover shadow-inner"
                      placeholder="Enter secret code"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Department</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-text-disabled group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 text-sm transition-all hover:bg-surface-hover"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Cabin No.</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-4 w-4 text-text-disabled group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={cabinNo}
                        onChange={(e) => setCabinNo(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 text-sm transition-all hover:bg-surface-hover"
                        placeholder="e.g. A-302"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Experience</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-4 w-4 text-text-disabled group-focus-within:text-primary transition-colors" />
                      </div>
                      <input
                        type="number"
                        required
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 text-sm transition-all hover:bg-surface-hover"
                        placeholder="Years"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">Phone</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-text-disabled group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      required
                      type="tel"
                      value={phoneNo}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) {
                          setPhoneNo(val);
                        }
                      }}
                      className={`w-full pl-9 pr-3 py-2 bg-surface border rounded-lg text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 text-sm transition-all hover:bg-surface-hover ${isPhoneInvalid ? 'border-danger/50 focus:ring-danger/50' : 'border-border focus:ring-input-focus/50'}`}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 md:mt-6 bg-button-primary text-text-primary py-3 px-6 rounded-xl font-semibold text-base md:text-lg transition-all duration-300 hover:scale-[0.98] hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <span className="flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          <p className="mt-5 md:mt-6 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href={ROUTES.AUTH.LOGIN} className="font-semibold text-primary hover:text-primary-light transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
