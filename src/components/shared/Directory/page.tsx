'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Faculty } from '@/types/faculty'
import { Search, Mail, Phone, Building, Calendar, User } from 'lucide-react'
import { DirectorySkeleton } from '@/components/shared/Skeletons'

export default function DirectoryPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch faculty data
  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          faculty_profiles (
            department,
            phone_no,
            cabin_no,
            experience_years
          )
        `)
        .eq('role', 'admin')
        .order('full_name', { ascending: true })

      if (error) throw error

      const formattedData: Faculty[] = (data || []).map((user: any) => {
        const profile = Array.isArray(user.faculty_profiles) ? user.faculty_profiles[0] : user.faculty_profiles;
        return {
          id: user.id,
          name: user.full_name || 'Unknown',
          email: user.email,
          department: profile?.department || 'General',
          phone_no: profile?.phone_no,
          cabin_no: profile?.cabin_no,
          experience: profile?.experience_years,
        };
      })

      setFaculty(formattedData)
      setFilteredFaculty(formattedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch faculty')
      console.error('Error fetching faculty:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter faculty based on search and department
  useEffect(() => {
    let filtered = faculty

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cabin_no?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by department
    if (selectedDepartment !== 'All') {
      filtered = filtered.filter(f => f.department === selectedDepartment)
    }

    setFilteredFaculty(filtered)
  }, [searchTerm, selectedDepartment, faculty])

  // Get unique departments
  const departments = ['All', ...Array.from(new Set(faculty.map(f => f.department)))]

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Faculty Directory</h1>
            <p className="mt-2 text-slate-300">
              Browse and search our faculty members
            </p>
          </div>

          {/* Search and Filter Section Skeleton */}
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-11 bg-slate-900/50 border border-slate-700/50 rounded-lg animate-pulse"></div>
              <div className="h-11 bg-slate-900/50 border border-slate-700/50 rounded-lg animate-pulse"></div>
            </div>
            <div className="mt-4 h-4 w-48 bg-slate-700/50 rounded animate-pulse"></div>
          </div>

          <DirectorySkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 max-w-md w-full">
          <p className="text-xl font-semibold text-orange-400">Error loading directory</p>
          <p className="mt-2 text-slate-300">{error}</p>
          <button
            onClick={fetchFaculty}
            className="mt-6 px-6 py-2 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Faculty Directory</h1>
          <p className="mt-2 text-slate-300">
            Browse and search our faculty members
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, department, or cabin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all [&>option]:bg-slate-900"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-slate-400">
            Showing <span className="text-white">{filteredFaculty.length}</span> of <span className="text-white">{faculty.length}</span> faculty members
          </div>
        </div>

        {/* Faculty Grid */}
        {filteredFaculty.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl">
            <User className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-300">No faculty members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((member) => (
              <div
                key={member.id}
                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl hover:bg-slate-700/60 transition-all duration-200 p-6"
              >
                {/* Name and Department */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-blue-400 font-medium mt-1">
                    {member.department}
                  </p>
                </div>

                {/* Contact Details */}
                <div className="space-y-3 text-sm">
                  {/* Email */}
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                    <a
                      href={`mailto:${member.email}`}
                      className="text-slate-300 hover:text-blue-400 break-all transition-colors"
                    >
                      {member.email}
                    </a>
                  </div>

                  {/* Phone */}
                  {member.phone_no && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <a
                        href={`tel:${member.phone_no}`}
                        className="text-slate-300 hover:text-blue-400 transition-colors"
                      >
                        {member.phone_no}
                      </a>
                    </div>
                  )}

                  {/* Cabin */}
                  {member.cabin_no && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-300">
                        Cabin: {member.cabin_no}
                      </span>
                    </div>
                  )}

                  {/* Experience */}
                  {member.experience !== null && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="text-slate-300">
                        {member.experience} years experience
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
