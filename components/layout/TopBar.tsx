import {
  Cross2Icon,
  GearIcon,
  HamburgerMenuIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { publicNavItems } from "./NavigationItems";

interface TopBarProps {
  showAdminButton?: boolean;
}

export default function TopBar({ showAdminButton = true }: TopBarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (slug: string) => {
    setMobileMenuOpen(false);
    router.push(slug);
  };

  const isActivePage = (slug: string) => {
    return router.pathname === slug || router.pathname.startsWith(slug + "/");
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Sticky App Bar */}
      <nav
        data-cy="topbar"
        className="sticky top-0 z-50 backdrop-blur-[10px] border-b border-white/20"
        style={{
          background:
            "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, var(--primary) 100%)",
          boxShadow: "0 4px 30px rgba(18, 85, 111, 0.3)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center min-h-16 md:min-h-[70px]">
            {/* Logo & Brand - Desktop */}
            <div
              className="hidden md:flex items-center gap-3 cursor-pointer mr-8 group"
              onClick={() => router.push("/")}
            >
              <div className="flex items-center justify-center w-[42px] h-[42px] rounded-lg text-white bg-white/15 border border-white/20 transition-transform duration-300 group-hover:-rotate-[10deg] group-hover:scale-110">
                <ReaderIcon
                  width={24}
                  height={24}
                  data-cy="topbar_logo_desktop"
                />
              </div>
              <span
                className="text-white font-bold text-lg tracking-wider"
                data-cy="topbar_title_desktop"
              >
                OpenLibry
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-white mr-2 transition-colors hover:bg-white/10"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Navigation öffnen"
              data-cy="topbar_menu_button_mobile"
            >
              <HamburgerMenuIcon width={24} height={24} />
            </button>

            {/* Logo & Brand - Mobile */}
            <div
              className="flex md:hidden items-center gap-2 flex-grow cursor-pointer text-white"
              onClick={() => router.push("/")}
            >
              <ReaderIcon width={24} height={24} data-cy="topbar_logo_mobile" />
              <span
                className="font-bold text-lg tracking-wide"
                data-cy="topbar_title_mobile"
              >
                OpenLibry
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-grow gap-1">
              {publicNavItems.map((page) => {
                const isActive = isActivePage(page.slug);
                return (
                  <button
                    key={page.title}
                    onClick={() => handleNavigation(page.slug)}
                    data-cy={`topbar_nav_button_${page.slug.replace(/\//g, "_")}`}
                    className={`
                      relative px-4 py-2 text-white text-[0.9rem] rounded-lg transition-colors
                      ${isActive ? "font-semibold bg-white/15" : "font-medium hover:bg-white/10"}
                    `}
                  >
                    {page.title}
                    <span
                      className={`
                        absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 rounded bg-primary-light
                        transition-all duration-300
                        ${isActive ? "w-[60%]" : "w-0"}
                      `}
                    />
                  </button>
                );
              })}
            </div>

            {/* Admin Button */}
            {showAdminButton && (
              <button
                onClick={() => router.push("/admin")}
                aria-label="Administration"
                title="Administration"
                data-cy="topbar_admin_button"
                className={`
                  ml-2 p-2 rounded-lg text-white border border-white/20
                  transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/20
                  ${isActivePage("/admin") ? "bg-white/20" : "bg-white/10"}
                `}
              >
                <GearIcon width={24} height={24} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Drawer - Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
        data-cy="topbar_menu_mobile"
      />

      {/* Mobile Drawer - Panel */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-[280px] flex flex-col
          bg-background-paper
          transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Drawer Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{
            background:
              "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
          }}
        >
          <div className="flex items-center gap-3 text-white">
            <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-white/15 border border-white/20">
              <ReaderIcon width={26} height={26} />
            </div>
            <div>
              <div className="font-bold tracking-wide">OpenLibry</div>
              <div className="text-white/70 text-xs">Bibliotheksverwaltung</div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white/80 hover:text-white p-1"
            aria-label="Menü schließen"
          >
            <Cross2Icon width={24} height={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-grow px-3 py-4">
          <ul className="space-y-1">
            {publicNavItems.map((page) => {
              const isActive = isActivePage(page.slug);
              return (
                <li key={page.title}>
                  <button
                    onClick={() => handleNavigation(page.slug)}
                    data-cy={`topbar_menu_item_${page.slug.replace(/\//g, "_")}`}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors mx-1
                      border-l-[3px]
                      ${
                        isActive
                          ? "bg-primary/10 border-l-primary"
                          : "border-l-transparent hover:bg-primary/5"
                      }
                    `}
                  >
                    {page.icon && (
                      <span
                        className={`flex items-center justify-center w-10 ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {page.icon}
                      </span>
                    )}
                    <span
                      className={
                        isActive
                          ? "font-semibold text-primary"
                          : "font-medium text-muted-foreground"
                      }
                    >
                      {page.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Admin Button in Drawer */}
        {showAdminButton && (
          <div className="px-4 pb-4 mt-auto">
            <button
              onClick={() => handleNavigation("/admin")}
              data-cy="topbar_menu_item_admin"
              className={`
                w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium
                transition-colors border border-primary/30
                ${
                  isActivePage("/admin")
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "text-primary hover:border-primary hover:bg-primary/5"
                }
              `}
            >
              <GearIcon width={20} height={20} />
              Administration
            </button>
          </div>
        )}
      </div>
    </>
  );
}
