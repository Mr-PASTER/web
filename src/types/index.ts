export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  previewImage: string;
  images?: string[];
  technologies: string[];
  demoUrl?: string;
  clientReview?: {
    name: string;
    text: string;
    rating: number;
  };
}

export interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectsQueryParams {
  page?: number;
  limit?: number;
  technology?: string;
  search?: string;
}

