"use client";
import { useState } from 'react';
import { Mail, Phone, BookUser, ChevronDown } from 'lucide-react';
import { useDirectory } from '@/hooks/data/useDirectory';
import { useDebounce } from '@/hooks/useDebounce';
import { EmptyDirectory, EmptySearch } from '@/components/shared/EmptyStates';
import { DirectorySkeleton } from '@/components/shared/Skeletons';
import { SearchBar } from '@/components/shared/SearchBar';

export default function Directory() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { items: facultyList, isLoading } = useDirectory(debouncedSearchTerm);
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Derive departments dynamically from fetched data
  const departments = ['All', ...Array.from(new Set(facultyList.map(f => f.department)))].filter(Boolean);

  const filteredFaculty = facultyList.filter(faculty => {
    return selectedDepartment === 'All' || faculty.department === selectedDepartment;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 pt-2 md:pt-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary capitalize flex items-center gap-3">
            <BookUser className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            Campus Directory
          </h1>
          <p className="text-sm md:text-base text-text-muted font-medium">
            Find and connect with faculty members across all departments.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border p-6 rounded-2xl">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search faculty by name or email..."
          className="w-full sm:w-96"
        />

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
      ) : facultyList.length === 0 ? (
        <EmptyDirectory />
      ) : filteredFaculty.length === 0 ? (
        <EmptySearch searchTerm={searchTerm} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3">
          {filteredFaculty.map((faculty) => (
            <div
              key={faculty.id}
              className="group bg-surface border border-border rounded-2xl p-5 "
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary transition-colors truncate">
                    {faculty.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mt-1">
                    {faculty.department}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <a
                  href={`mailto:${faculty.email}`}
                  className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-primary transition-colors py-1 px-1.5 -mx-1.5 rounded-md hover:bg-surface-hover"
                >
                  <Mail className="w-4 h-4 text-text-disabled shrink-0" />
                  <span className="truncate">{faculty.email}</span>
                </a>

                {faculty.phone_no && (
                  <a
                    href={`tel:${faculty.phone_no}`}
                    className="flex items-center gap-2.5 text-sm text-text-muted hover:text-text-primary transition-colors py-1 px-1.5 -mx-1.5 rounded-md hover:bg-surface-hover"
                  >
                    <Phone className="w-4 h-4 text-text-disabled shrink-0" />
                    <span>{faculty.phone_no}</span>
                  </a>
                )}
              </div>

              {(faculty.cabin_no || faculty.experience !== null) && (
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/60">
                  {faculty.cabin_no && (
                    <div className="flex flex-col">
                      <span className="text-[11px] uppercase tracking-wider text-text-disabled font-bold">Room</span>
                      <span className="text-sm text-text-secondary font-medium">{faculty.cabin_no}</span>
                    </div>
                  )}

                  {faculty.experience !== null && faculty.experience !== undefined && (
                    <div className="flex flex-col text-right">
                      <span className="text-[11px] uppercase tracking-wider text-text-disabled font-bold">Experience</span>
                      <span className="text-sm text-text-secondary font-medium">{faculty.experience} Yrs</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}