export interface AuditType {
  createdAt?: string;
  updatedAt?: string;
  id?: number;
  eventType: string;
  eventContent: string;
  bookid: number;
  userid: number;
}
