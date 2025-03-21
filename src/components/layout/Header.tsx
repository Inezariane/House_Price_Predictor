
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Info, History, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { name: 'Home', icon: <Home className="h-4 w-4 mr-2" />, path: '/' },
    { name: 'How It Works', icon: <Info className="h-4 w-4 mr-2" />, path: '/how-it-works' },
    { name: 'Price History', icon: <History className="h-4 w-4 mr-2" />, path: '/history' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-10',
        scrolled ? 'bg-white/80 backdrop-blur-lg shadow-soft' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-all duration-300">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight">
            HomeValue<span className="text-primary">AI</span>
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
