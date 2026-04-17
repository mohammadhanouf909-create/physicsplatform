export type UserRole = 'admin' | 'instructor' | 'assistant' | 'student';
export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  full_name_ar?: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  thumbnail_url?: string;
  price: number;
  currency: string;
  status: CourseStatus;
  instructor_id: string;
  instructor?: { full_name: string }; 
  is_free: boolean;
  sort_order: number;
  created_at: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  title_ar?: string;
  sort_order: number;
  lectures?: Lecture[];
}

export interface Lecture {
  id: string;
  section_id: string;
  course_id: string;
  title: string;
  title_ar?: string;
  video_url?: string;
  video_bunny_id?: string;
  duration_seconds?: number;
  is_preview: boolean;
  sort_order: number;
  materials?: Material[];
}

export interface Material {
  id: string;
  lecture_id: string;
  course_id: string;
  title: string;
  title_ar?: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  sort_order: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'refunded';
  progress_percent: number;
  enrolled_at: string;
  course?: Course;
}