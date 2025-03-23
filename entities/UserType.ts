export interface UserType {
  createdAt?: string;
  updatedAt?: string;
  id?: number;
  lastName: string;
  firstName: string;
  schoolGrade?: string | null;
  schoolTeacherName?: string | null;
  active: boolean;
  eMail?: string | null;
}
