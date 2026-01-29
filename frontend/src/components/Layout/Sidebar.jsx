import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  LayoutDashboard,
  ClipboardList,
  User,
  Shield,
  LogOut,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { io } from 'socket.io-client';

const Sidebar = ({ closeSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasUnread, setHasUnread] = useState(false);
  const socketRef = useRef(null);

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    logout();
    if (closeSidebar) closeSidebar();
    navigate('/');
  };

  useEffect(() => {
    if (user?._id) {
      // Connect to Socket.io for notifications (and online status)
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      socketRef.current = io(backendUrl, {
        query: { userId: user._id }
      });

      socketRef.current.on('new_message_notification', (data) => {
        // If we are NOT currently on the chat page, show the red dot
        if (!location.pathname.includes('/dashboard/chat')) {
          setHasUnread(true);
        }
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [user?._id, location.pathname]);

  // Clear notification when visiting chat
  useEffect(() => {
    if (location.pathname.includes('/dashboard/chat')) {
      setHasUnread(false);
    }
  }, [location.pathname]);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Job Board' },
    { to: '/dashboard/my-jobs', icon: ClipboardList, label: 'My Jobs' },
    {
      to: '/dashboard/chat',
      icon: MessageCircle,
      label: 'Messages',
      showDot: hasUnread
    },
    { to: '/dashboard/favorites', icon: Heart, label: 'Favorites' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/dashboard/admin', icon: Shield, label: 'Admin Panel' });
  }

  return (
    <aside className="w-64 bg-card border-r h-full flex flex-col transition-all duration-300">
      {/* Logo */}
      <div className="p-6 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-foreground">Campus Gigs</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={() => closeSidebar && closeSidebar()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-colors relative', // Increased padding and min-height for touch
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80' // Added active state
              )
            }
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.showDot && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card" />
              )}
            </div>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
