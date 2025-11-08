import { Link } from 'react-router-dom';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      {/* Preview Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={project.previewImage}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
          {project.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
          {project.shortDescription || project.description}
        </p>

        {/* Technologies */}
        <div className="mb-4 flex flex-wrap gap-2">
          {project.technologies.length > 0 ? (
            <>
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  +{project.technologies.length - 4}
                </span>
              )}
            </>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs italic text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Технологии не указаны
            </span>
          )}
        </div>

        {project.clientReview && (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
            <p className="mb-2 line-clamp-3 italic">“{project.clientReview.text}”</p>
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
              <span>{project.clientReview.name}</span>
              {project.clientReview.rating > 0 && (
                <span className="flex items-center gap-1">
                  <svg
                    className="h-3 w-3 text-yellow-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.048 2.927c.3-.921 1.603-.921 1.902 0l1.464 4.51a1 1 0 00.95.69h4.743c.969 0 1.371 1.24.588 1.81l-3.84 2.79a1 1 0 00-.364 1.118l1.464 4.51c.3.922-.755 1.688-1.538 1.118l-3.84-2.79a1 1 0 00-1.176 0l-3.84 2.79c-.783.57-1.838-.196-1.539-1.118l1.465-4.51a1 1 0 00-.365-1.118l-3.84-2.79c-.783-.57-.38-1.81.588-1.81h4.744a1 1 0 00.95-.69l1.464-4.51z" />
                  </svg>
                  {project.clientReview.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/projects/${project.id}`}
            className="text-sm font-medium text-gray-900 transition-colors hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            Подробнее →
          </Link>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Демо
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

