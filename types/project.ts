export interface Project {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  divisionId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { credentials: number };
}
