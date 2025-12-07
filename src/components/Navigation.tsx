import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { Link, getPathname } from "@/i18n/routing";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

export default async function Navigation() {
  const t = await getTranslations("nav");
  
  // Get pathname for server-side rendering
  // Try using getPathname from next-intl first, fallback to headers
  let currentPath = "/";
  try {
    // getPathname might need locale context, so try headers approach
    const headersList = await headers();
    const url = headersList.get("x-url") || headersList.get("referer") || "";
    
    if (url) {
      // Extract pathname from URL, removing locale prefix
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Remove locale prefix (e.g., "/en" -> "")
      currentPath = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    }
  } catch (error) {
    // Fallback to root if pathname can't be determined
    currentPath = "/";
  }

  const navItems: NavItem[] = [
    {
      href: "/",
      labelKey: "home",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
      ),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      ),
    },
    {
      href: "/chat",
      labelKey: "chat",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      href: "/analytics",
      labelKey: "analytics",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 10 10" />
          <path d="M12 12V2" />
          <path d="M12 12h10" />
        </svg>
      ),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 10 10" fill="white" />
          <path d="M12 12V2" stroke="white" />
          <path d="M12 12h10" stroke="white" />
        </svg>
      ),
    },
    {
      href: "/share",
      labelKey: "share",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17,8 12,3 7,8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17,8 12,3 7,8" fill="currentColor" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      href: "/profile",
      labelKey: "profile",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      activeIcon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed top-24 z-40 hidden h-[calc(100vh-6rem)] w-20 flex-col border-[#E8E9ED] bg-white md:flex ltr:left-0 ltr:border-r rtl:right-0 rtl:border-l rtl:border-r-0">
        <nav className="flex flex-1 flex-col justify-center items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/" && currentPath.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "text-[#E63946]"
                    : "text-[#0D1B3E] hover:text-[#E63946]"
                }`}
              >
                <span className="transition-transform group-hover:scale-110">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className="text-[11px] font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8E9ED] bg-white md:hidden">
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.href ||
              (item.href !== "/" && currentPath.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? "text-[#E63946]"
                    : "text-[#0D1B3E] hover:text-[#E63946]"
                }`}
              >
                <span className="transition-transform group-hover:scale-110">
                  {isActive ? item.activeIcon : item.icon}
                </span>
                <span className="text-[11px] font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area for devices with home indicator */}
        <div className="h-safe-area bg-white" />
      </nav>
    </>
  );
}
