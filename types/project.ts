export interface Project {
  id: string;
  name: string;
  description: string | null;
  environment: string;
  divisionId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { credentials: number };
}
