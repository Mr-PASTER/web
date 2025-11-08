import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Создаём решения для вашего бизнеса
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Профессиональные решения для развития вашего бизнеса
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/order"
              className="rounded-md bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Создать решение
            </Link>
            <Link
              to="/projects"
              className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              Посмотреть примеры
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

