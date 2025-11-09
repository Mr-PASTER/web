import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">PASTER - SYSTEM</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Создаём решения для вашего бизнеса. Профессиональный подход к каждому проекту.
            </p>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Контакты</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <span className="font-medium">Телеграм:</span>{' '}
                <a
                  href="https://t.me/PASTERt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-white"
                >
                  @PASTERt
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Быстрые ссылки</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Главная
                </Link>
              </li>
              <li>
                <Link
                  to="/projects"
                  className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Проекты
                </Link>
              </li>
              <li>
                <Link
                  to="/order"
                  className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Заказать проект
                </Link>
              </li>
            </ul>
          </div>

          {/* SEO Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">О нас</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              PASTER ECO SYSTEM — команда профессионалов, специализирующаяся на создании
              инновационных решений для бизнеса. Мы помогаем компаниям развиваться и достигать
              новых высот.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} PASTER ECO SYSTEM. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

