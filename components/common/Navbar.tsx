"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

// Auth0 hook
import { useUser } from '@auth0/nextjs-auth0/client';

const Navbar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const pathname = usePathname();

  // Auth0 context using the useUser hook
  const { user, error, isLoading } = useUser();

  // Handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search for:', searchQuery);
    // Implement search functionality here
  };

  return (
    <nav
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-2" aria-label="Homepage">
            <Image
              src="/images/home/logo.png"
              alt="Fluent.ai Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-lg font-bold text-black">Fluent.ai</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            {/* Add your nav links here */}
          </NavigationMenu>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-sm mx-4 flex-1 bg-white p-2 rounded-lg shadow-md">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <Button type="submit" size="icon" variant="ghost" className="ml-2" aria-label="Submit search">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Login/Logout Button and User Icon (based on Auth0 status) */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Icon (Profile Picture from Google) */}
                <Link href="users/profile">
                  <Image
                    src={user.picture || '/images/default-avatar.png'} // Fallback to default avatar if no picture is available
                    alt="User Profile"
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-gray-300"
                  />
                </Link>
                {/* Logout Button */}
                <Button onClick={() => window.location.href = "/api/auth/logout"} className="ml-4">
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = "/api/auth/login"} className="ml-4">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
