import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const Header = () => {
  const [activeMenu, setActiveMenu] = useState('vi-sao');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [showValidationError, setShowValidationError] = useState(false);

  const mainMenuItems = [
    { 
      id: 'vi-sao', 
      label: 'Vì sao chọn mầm mới', 
      href: '#vi-sao'
    },
    { 
      id: 'gioi-thieu', 
      label: 'Giới thiệu cây', 
      href: '#gioi-thieu'
    },
    { 
      id: 'danh-muc', 
      label: 'Danh mục', 
      href: '#danh-muc'
    },
    { 
      id: 'lien-he', 
      label: 'Liên hệ', 
      href: '#lien-he'
    }
  ];

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (!trimmedQuery) {
      setShowValidationError(true);
      setTimeout(() => {
        setShowValidationError(false);
      }, 3000);
      return;
    }
    
    setShowValidationError(false);
    console.log('Searching for:', trimmedQuery);
    showNotification(`Đang tìm kiếm: ${trimmedQuery}`, false);
    
    // Add your search logic here
    // Example: navigate to search results page
    // window.location.href = `/search?q=${encodeURIComponent(trimmedQuery)}`;
    // or use React Router: navigate(`/search?q=${trimmedQuery}`);
    
    // Close search bar after successful search
    setTimeout(() => {
      handleSearchClose();
    }, 1500);
  };

  const handleSearchButtonClick = () => {
    if (!showSearch) {
      // Open search
      setShowSearch(true);
      setShowValidationError(false);
    } else {
      // Submit search when search bar is open
      const trimmedQuery = searchQuery.trim();
      
      if (!trimmedQuery) {
        setShowValidationError(true);
        setTimeout(() => {
          setShowValidationError(false);
        }, 3000);
        return;
      }
      
      setShowValidationError(false);
      console.log('Searching for:', trimmedQuery);
      showNotification(`Đang tìm kiếm: ${trimmedQuery}`, false);
      
      // Add your search logic here
      // Example: navigate to search results page
      // window.location.href = `/search?q=${encodeURIComponent(trimmedQuery)}`;
      // or use React Router: navigate(`/search?q=${trimmedQuery}`);
      
      // Close search bar after successful search
      setTimeout(() => {
        handleSearchClose();
      }, 1500);
    }
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchQuery('');
    setShowValidationError(false);
  };

  return (
    <>
      {/* Notification */}
      {notification && (
        <div 
          className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-lg text-white animate-slide-in ${
            notification.isError ? 'bg-red-500' : 'bg-green-500'
          }`}
        >
          {notification.message}
        </div>
      )}

      <header className="w-full bg-white shadow-sm">
        {/* Top Bar */}
        <div className="bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-end gap-8 py-2.5">
              {/* Auth Buttons - Single bordered frame */}
              <div className="flex items-stretch border border-gray-300 rounded overflow-hidden">
                <button 
                  onClick={() => {
                    console.log('Navigating to: Login page');
                    // Add your login page navigation logic here
                    // Example: window.location.href = '/login';
                    // or use React Router: navigate('/login');
                  }}
                  className="px-6 py-1.5 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Đăng nhập
                </button>
                <div className="w-px bg-gray-300"></div>
                <button 
                  onClick={() => {
                    console.log('Navigating to: Register page');
                    // Add your register page navigation logic here
                    // Example: window.location.href = '/register';
                    // or use React Router: navigate('/register');
                  }}
                  className="px-6 py-1.5 text-sm bg-green-700 text-white hover:bg-green-800 transition-colors cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <a 
              href="/" 
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick('home');
                console.log('Navigating to: Homepage');
                // Add your homepage navigation logic here
              }}
              className="flex-shrink-0 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="w-3 h-3 bg-green-700 rounded-full"></div>
                </div>
                <h1 className="text-2xl font-bold text-green-800">MẦM MỚI</h1>
              </div>
            </a>

            {/* Search Bar (when active) or Navigation */}
            {showSearch ? (
              <div className="flex-1 mx-8 relative">
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Tìm kiếm cây, phụ kiện, hướng dẫn..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (showValidationError && e.target.value.trim()) {
                        setShowValidationError(false);
                      }
                    }}
                    autoFocus
                    className="w-full px-4 py-2 border-b-2 border-green-600 focus:border-green-700 focus:outline-none text-base bg-transparent placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleSearchClose}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Đóng tìm kiếm"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </form>

                {/* Validation Tooltip */}
                {showValidationError && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white border border-orange-400 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 z-50 animate-fade-in">
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">!</span>
                    </div>
                    <span className="text-gray-700 text-sm whitespace-nowrap">Vui lòng điền vào trường này.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <nav>
                  <ul className="flex items-center gap-0">
                    {mainMenuItems.map((item) => (
                      <li key={item.id} className="relative">
                        <a
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleMenuClick(item.id);
                            console.log(`Navigating to: ${item.label}`);
                            // Add your navigation logic here
                          }}
                          className={`block px-5 py-2 text-base transition-colors ${
                            activeMenu === item.id
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          {item.label}
                        </a>

                        {/* Active Indicator */}
                        {activeMenu === item.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"></div>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* Search Button */}
            <button 
              onClick={handleSearchButtonClick}
              className="p-2.5 border-2 border-green-700 rounded-md hover:bg-green-50 transition-colors flex-shrink-0 ml-2"
            >
              <Search className="w-5 h-5 text-green-700" />
            </button>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;