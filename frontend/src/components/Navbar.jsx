import { LogOut, Hexagon } from 'lucide-react';

export default function Navbar({ user, setUser }) {
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <nav className="glass sticky top-0 z-50 animate-fade-in print:hidden">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-gradient-to-tr from-primary-600 to-indigo-400 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-0.5">
              <Hexagon className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-brand-dark font-['Outfit']">
                Masily
              </span>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest -mt-1">Manage Easily</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-4 border-r border-slate-200 pr-5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-100 to-indigo-100 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div className="text-sm hidden sm:block text-right">
                <p className="font-semibold text-brand-dark">{user.name.split(' ')[0]}</p>
                <p className="text-xs text-brand-muted font-medium tracking-wide">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-100"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
