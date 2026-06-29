export interface Faculty {
  id: string
  name: string
  email: string
  experience: number | null
  department: string
  phone_no: string | null
  date_of_birth?: string | null
  cabin_no: string | null
  created_at?: string
}

export interface FacultyProfileData {
  department: string | null
  phone_no: string | null
  cabin_no: string | null
  experience_years: number | null
}

export interface DirectoryUser {
  id: string
  email: string
  full_name: string | null
  faculty_profiles: FacultyProfileData | FacultyProfileData[] | null
}
