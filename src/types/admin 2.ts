export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
} 