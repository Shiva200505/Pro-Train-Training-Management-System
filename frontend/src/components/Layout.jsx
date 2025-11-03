import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';

const Layout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {user && <Navbar />}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center">&copy; {new Date().getFullYear()} Pro-Train. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;