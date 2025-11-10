import { Link } from 'react-router-dom';

export default function Header() {
  const base = import.meta.env.BASE_URL ?? '/';
  const logoSrc = `${base.replace(/\/?$/, '/') }favicon.ico`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          aria-label="Главная страница"
        >
          <img 
            src={logoSrc}
            alt="Logo" 
            className="h-8 w-8"
          />
          <span className="hidden font-semibold sm:inline-block">
            PASTER ECO SYSTEM
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Главная
          </Link>
          <Link
            to="/projects"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Проекты
          </Link>
          <Link
            to="/order"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Заказать проект
          </Link>
        </nav>
      </nav>
    </header>
  );
}

