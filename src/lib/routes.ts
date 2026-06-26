export const ROUTES = {
  HOME: "/",
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
  },
  STUDENT: {
    DASHBOARD: "/main/student/dashboard",
    ANNOUNCEMENTS: "/main/student/announcements",
    CHAT: "/main/student/chat",
    COMPLAINTS: "/main/student/complaint",
    DIRECTORY: "/main/student/directory",
    LOST_FOUND: "/main/student/lost-found",
    MARKETPLACE: "/main/student/marketplace",
    PROFILE: "/main/student/profile",
  },
  FACULTY: {
    DASHBOARD: "/main/faculty/dashboard",
    ANNOUNCEMENTS: "/main/faculty/announcements",
    COMPLAINTS: "/main/faculty/complaints",
    DIRECTORY: "/main/faculty/directory",
    LOST_FOUND: "/main/faculty/lost-found",
    PROFILE: "/main/faculty/profile",
  },
  SOCIAL: {
    INSTAGRAM: "https://www.instagram.com/harshitsinghal11",
    LINKEDIN: "https://www.linkedin.com/in/harshitsinghal11/",
    GITHUB: "https://www.github.com/harshitsinghal11",
  },
  LEGAL: {
    PRIVACY: "/privacy",
    TERMS: "/terms",
  }
} as const;
