# Campus Gigs - Full UI/UX Technical Documentation

This document contains the complete source code for the critical UI/UX components of the Campus Gigs application. It serves as a technical reference for the layout architecture, responsive design logic, and real-time interface implementation.

---

## 1. The Adaptive Layout Engine (`DashboardLayout.jsx`)

**Role**: This component is the "brain" of the UI. It decides how the page should behave based on the route.
*   **Chat Route**: Locks the viewport height (`h-full min-h-0`) to prevent window scrolling, allowing the internal chat message list to scroll independently. This creates an "App-like" feel.
*   **Standard Routes**: Uses `w-full` with natural height, allowing the page to grow and scroll like a traditional website, preventing footer overlap.

```javascript
import React, { useState } from 'react';
import { Outlet, useLocation, Navigate, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

const getPageTitle = (pathname) => {
  const routes = {
    '/dashboard': 'Job Board',
    '/dashboard/my-jobs': 'My Jobs',
    '/dashboard/favorites': 'Favorites',
    '/dashboard/profile': 'Profile',
    '/dashboard/admin': 'Admin Panel',
    '/dashboard/chat': 'Messages',
  };
  return routes[pathname] || 'Dashboard';
};

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          role="button"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:translate-x-0 transition-transform duration-200 lg:flex lg:flex-col lg:w-64 border-r bg-card`}
      >
        <Sidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getPageTitle(location.pathname)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className={`flex-1 flex flex-col ${location.pathname.includes('/chat') ? 'overflow-hidden p-0' : 'overflow-y-auto p-6 scroll-smooth'}`}>
          <div className={`flex flex-col ${location.pathname.includes('/chat') ? 'flex-1 h-full min-h-0' : 'w-full min-h-[calc(100vh-10rem)]'}`}>
            <Outlet />
          </div>
          {!location.pathname.includes('/chat') && (
            <footer className="mt-12 py-6 border-t text-center text-xs text-muted-foreground">
              <div className="flex justify-center gap-4 mb-2">
                <Link to="/terms" target="_blank" className="hover:text-primary hover:underline transition-colors">Terms of Service</Link>
                <Link to="/privacy" target="_blank" className="hover:text-primary hover:underline transition-colors">Privacy Policy</Link>
                <Link to="/safety" target="_blank" className="hover:text-primary hover:underline transition-colors">Safety Tips</Link>
              </div>
              <p>&copy; {new Date().getFullYear()} Campus Gigs. All rights reserved.</p>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
```

---

## 2. Responsive Sidebar Navigation (`Sidebar.jsx`)

**Role**: Handles navigation and user session control.
*   **Key Fix**: Uses `h-full` instead of `h-screen`. This ensures the sidebar fits perfectly within the layout container controlled by `DashboardLayout`, preventing it from being cut off by mobile address bars.
*   **Scroll**: The navigation list (`nav`) has `overflow-y-auto`, ensuring that even on small screens, users can scroll to see all menu items, while the Logout/User section stays fixed at the bottom.

```javascript
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
```

---

## 3. Real-Time Chat Interface (`ChatPanel.jsx`)

**Role**: Handles the complex interactive logic for messaging.
*   **Scroll Logic**: Uses `useLayoutEffect` to scroll to the bottom *before* the browser paints, eliminating "jumpiness".
*   **Optimistic UI**: Immediately displays sent messages while waiting for backend confirmation.
*   **Deduplication**: Smartly ignores incoming socket messages if a matching "optimistic" message already exists.

```javascript
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, X, Smile, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../utils/api';
import { toast } from 'sonner';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatPanel = ({ conversation, recipientId, jobId, onClose }) => {
    // ... State Definitions ...
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    
    // ... Socket Logic ...
    // ... Scroll Logic (see README Implementation Details) ...

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-background border-l relative min-h-0">
            {/* Header */}
            <div className="h-14 px-4 border-b flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-20">
               {/* User Info */}
            </div>

            {/* Messages Area - KEY: overscroll-none prevents bounce */}
            <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 w-full overscroll-none">
                {Object.entries(grouped).map(([d, msgs]) => (
                    <div key={d}>
                        <div className="text-[10px] text-center text-muted-foreground mb-3 font-medium uppercase tracking-wider">{d}</div>
                        {msgs.map((m) => (
                             // Message Bubbles...
                        ))}
                    </div>
                ))}
                <div ref={endRef} className="h-px w-full" />
            </div>

            {/* Input Area */}
            <div className="p-2 sm:p-3 border-t bg-background shrink-0 w-full z-20">
                {/* Input Fields, Emoji Picker, Send Button */}
            </div>
        </div>
    );
};

export default ChatPanel;
```

---

## 4. Global Styling & Reset (`index.css`)

**Role**: Sets the foundational rules for the app.
*   **Height Reset**: Uses `min-height: 100%` for `body` and `#root` to allow natural scrolling on public pages (like Landing) while supporting `h-full` apps.
*   **Theming**: Defines CSS variables for Light and Dark modes.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 98%;
    --foreground: 0 0% 3.9%;
    /* ... color tokens ... */
  }

  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    /* ... dim tokens ... */
  }
}

@layer base {
  * { @apply border-border; }

  html { height: 100%; }

  body, #root {
    min-height: 100%;
    /* overflow: hidden; Removed to allow native scroll */
  }
}
```
