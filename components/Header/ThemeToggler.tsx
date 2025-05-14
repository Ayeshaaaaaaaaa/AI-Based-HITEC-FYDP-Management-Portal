import { useState } from 'react';

const ThemeToggler = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center justify-center rounded-full cursor-pointer 
        ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'} 
        h-9 w-9 md:h-14 md:w-14`}
    >
      {/* Moon icon for light mode */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-5 h-5 ${isDarkMode ? 'hidden' : 'block'} dark:hidden md:h-6 md:w-6`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          d="M9.55078 1.5C5.80078 1.5 1.30078 5.25 1.30078 11.25C1.30078 17.25 5.80078 21.75 11.8008 21.75C17.8008 21.75 21.5508 17.25 21.5508 13.5C13.3008 18.75 4.30078 9.75 9.55078 1.5Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Sun icon for dark mode */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-5 h-5 ${isDarkMode ? 'block' : 'hidden'} dark:block md:h-6 md:w-6`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M17.36 17.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M17.36 6.64l1.42-1.42" stroke="currentColor" strokeWidth="2"/>
      </svg>
    </button>
  );
};

export default ThemeToggler;
