"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/upload", label: "Upload Video" },
    { href: "/videos", label: "View Videos" },
    { href: "/go-live", label: "Go Live" },
    { href: "/live", label: "Live Stream" },
  ];

  return (
    <nav
      style={{
        background: "#111827",
        borderBottom: "1px solid #374151",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Upload2Live
        </Link>

        <div style={{ display: "flex", gap: 8 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === "/" && pathname === "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "8px 16px",
                  color: isActive ? "#3b82f6" : "#e5e7eb",
                  textDecoration: "none",
                  borderRadius: 6,
                  background: isActive ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  transition: "all 0.2s",
                  fontWeight: isActive ? "600" : "400",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {link.icon && <span>{link.icon}</span>}
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

