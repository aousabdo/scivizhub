import React from 'react';
import Header from './Header';
import Footer from './Footer';
import useDarkMode from '../../hooks/useDarkMode';

const Layout = ({ children }) => {
  const [dark, setDark] = useDarkMode();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Header dark={dark} setDark={setDark} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
