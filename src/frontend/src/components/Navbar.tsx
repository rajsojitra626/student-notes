import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Layout, Menu, Upload, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  onUploadClick: () => void;
}

export function Navbar({ onUploadClick }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const navLinks = [
    { to: "/", label: "Browse", icon: Layout, ocid: "nav.browse_link" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display font-bold text-lg text-foreground hover:text-primary transition-colors"
            data-ocid="nav.browse_link"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="hidden sm:block">Student Notes Hub</span>
            <span className="sm:hidden">Notes Hub</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon, ocid }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  data-ocid={ocid}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              onClick={onUploadClick}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              data-ocid="nav.upload_button"
            >
              <Upload className="w-4 h-4" />
              Upload Note
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1 pb-4">
            {navLinks.map(({ to, label, icon: Icon, ocid }) => {
              const isActive = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  data-ocid={ocid}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border mt-2">
              <Button
                onClick={() => {
                  setMobileOpen(false);
                  onUploadClick();
                }}
                size="sm"
                className="w-full bg-primary text-primary-foreground gap-2"
                data-ocid="nav.upload_button"
              >
                <Upload className="w-4 h-4" />
                Upload Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
