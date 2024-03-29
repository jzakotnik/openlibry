export interface LoginUserType {
  createdAt?: string;
  updatedAt?: string;
  id?: number;
  username: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
}
