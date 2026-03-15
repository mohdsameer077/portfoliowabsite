"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, User, LogOut, Package, LayoutDashboard } from "lucide-react";

interface UserInfo {
  name: string;
  role: string;
}

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userInfo");
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
      } catch {
        localStorage.removeItem("userInfo");
      }
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("userInfo");
    setUserInfo(null);
    router.push("/login");
    router.refresh();
  }

  function getDashboardLink() {
    if (!userInfo) return null;
    if (userInfo.role === "admin") return { href: "/admin", label: "Admin Dashboard" };
    if (userInfo.role === "seller") return { href: "/seller", label: "Seller Dashboard" };
    return null;
  }

  const dashLink = getDashboardLink();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
            <ShoppingBag className="w-6 h-6" />
            <span>ThreadMarket</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-emerald-600 transition-colors text-sm font-medium">
              Browse
            </Link>

            {userInfo ? (
              <>
                {dashLink && (
                  <Link href={dashLink.href} className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}
                {userInfo.role === "buyer" && (
                  <>
                    <Link href="/cart" className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 text-sm font-medium">
                      <ShoppingBag className="w-4 h-4" />
                      Cart
                    </Link>
                    <Link href="/orders" className="flex items-center gap-1 text-gray-600 hover:text-emerald-600 text-sm font-medium">
                      <Package className="w-4 h-4" />
                      Orders
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{userInfo.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-emerald-600 text-sm font-medium">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-2">
            <Link href="/" className="block px-2 py-2 text-sm text-gray-700 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>
              Browse
            </Link>
            {userInfo ? (
              <>
                {dashLink && (
                  <Link href={dashLink.href} className="block px-2 py-2 text-sm text-gray-700 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                {userInfo.role === "buyer" && (
                  <>
                    <Link href="/cart" className="block px-2 py-2 text-sm text-gray-700 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Cart</Link>
                    <Link href="/orders" className="block px-2 py-2 text-sm text-gray-700 hover:text-emerald-600" onClick={() => setMenuOpen(false)}>Orders</Link>
                  </>
                )}
                <div className="px-2 py-1 text-sm text-gray-600">Hi, {userInfo.name}</div>
                <button onClick={handleLogout} className="block px-2 py-2 text-sm text-red-500 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-2 py-2 text-sm text-gray-700" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/register" className="block px-2 py-2 text-sm text-emerald-600 font-medium" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
