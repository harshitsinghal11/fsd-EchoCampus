"use client";
import { useState } from 'react';
import { Search, Mail, Phone, BookOpen, Briefcase, ChevronRight, BookUser, ChevronDown } from 'lucide-react';
import { useDirectory } from '@/hooks/data/useDirectory';
import { EmptyDirectory } from '@/components/shared/EmptyStates';
import { DirectorySkeleton } from '@/components/shared/Skeletons';

export default function Directory() {
  const { items: facultyList, isLoading } = useDirectory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Derive departments dynamically from fetched data
  const departments = ['All', ...Array.from(new Set(facultyList.map(f => f.department)))].filter(Boolean);

  const filteredFaculty = facultyList.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'All' || faculty.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pt-2 md:pt-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-text-primary capitalize flex items-center gap-3">
            <BookUser className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            Campus Directory
          </h1>
          <p className="text-sm md:text-base text-text-muted font-medium">
            Find and connect with faculty members across all departments.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface backdrop-blur-xl border border-border p-6 rounded-2xl">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search faculty by name or email..."
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-input-focus/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-64">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-3 pl-4 pr-10 text-text-primary focus:outline-none focus:ring-2 focus:ring-input-focus/50 transition-all appearance-none cursor-pointer"
          >
            {departments.map(dept => (
              <option key={dept} value={dept} className="bg-surface-hover text-text-primary">
                {dept}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-disabled pointer-events-none" />
        </div>
      </div>

      {isLoading ? (
        <DirectorySkeleton />
      ) : facultyList.length === 0 || filteredFaculty.length === 0 ? (
        <EmptyDirectory />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFaculty.map((faculty) => (
            <div
              key={faculty.id}
              className="bg-surface backdrop-blur-xl border border-border rounded-2xl p-6 hover:bg-surface-hover"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                    {faculty.name}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mt-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    {faculty.department}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`mailto:${faculty.email}`}
                  className="flex items-center gap-3 text-sm text-text-muted hover:text-text-primary transition-colors p-2 -mx-2 rounded-lg hover:bg-surface-hover"
                >
                  <div className="bg-surface p-1.5 rounded-md">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="truncate">{faculty.email}</span>
                </a>

                {faculty.phone_no && (
                  <a
                    href={`tel:${faculty.phone_no}`}
                    className="flex items-center gap-3 text-sm text-text-muted hover:text-text-primary transition-colors p-2 -mx-2 rounded-lg hover:bg-surface-hover"
                  >
                    <div className="bg-surface p-1.5 rounded-md">
                      <Phone className="w-4 h-4 text-success" />
                    </div>
                    <span>{faculty.phone_no}</span>
                  </a>
                )}

                {(faculty.cabin_no || faculty.experience !== null) && (
                  <div className="flex items-center gap-4 pt-4 mt-1 border-t border-border">
                    {faculty.cabin_no && (
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-text-disabled font-bold mb-1">Room No:</span>
                        <span className="text-sm text-text-secondary font-medium">{faculty.cabin_no}</span>
                      </div>
                    )}

                    {faculty.experience !== null && faculty.experience !== undefined && (
                      <div className="flex flex-col ml-auto text-right">
                        <span className="text-[10px] uppercase tracking-wider text-text-disabled font-bold mb-1 flex items-center gap-1 justify-end">
                          <Briefcase className="w-3 h-3" />
                          Experience
                        </span>
                        <span className="text-sm text-text-secondary font-medium">{faculty.experience} Years</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
