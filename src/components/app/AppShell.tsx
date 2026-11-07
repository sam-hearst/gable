"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { Gift, Heart, LogOut, Menu, PanelLeft, Search, SquarePlus, X } from "@/components/landing/icons";
import { SiteFooter, SiteHeader } from "@/components/landing/SiteChrome";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/supabase/config";
import "./app-shell.css";

export type AppPage = "explore" | "favorites" | "list" | "refer" | "none";

const NAV: { key: AppPage; href: string; label: string; Icon: typeof Search }[] = [
  { key: "explore", href: "/explore", label: "Explore", Icon: Search },
  { key: "favorites", href: "/favorites", label: "Favorites", Icon: Heart },
  { key: "list", href: "/sublet-your-room", label: "List your room", Icon: SquarePlus },
  { key: "refer", href: "/refer", label: "Refer a friend", Icon: Gift },
];

// Whether the sidebar is folded, remembered in this browser (just a
// convenience: if storage is blocked it simply starts open).
const COLLAPSED_KEY = "gable-sidebar-collapsed";
const collapsedListeners = new Set<() => void>();
function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}
function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  } catch {}
  collapsedListeners.forEach((l) => l());
}
function subscribeCollapsed(listener: () => void) {
  collapsedListeners.add(listener);
  return () => collapsedListeners.delete(listener);
}

function firstName(session: Session): string {
  const meta = session.user.user_metadata ?? {};
  const name = meta.name ?? meta.full_name;
  return typeof name === "string" && name.trim() ? name.trim().split(/\s+/)[0] : "";
}

// The signed-in app: a sidebar on the left (Explore, Favorites, List your
// room, Refer a friend, and your account at the bottom) and the page on the
// right. It folds down to icons, and on phones it's a drawer behind a menu
// button. Signed out, the same pages get the normal site header and footer.
export function AppShell({ current, children }: { current: AppPage; children: React.ReactNode }) {
  // undefined while checking; null when signed out.
  const [session, setSession] = useState<Session | null | undefined>(supabaseConfigured ? undefined : null);
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Saves your first name on your account, so the app can say "Hi, Michelle".
  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const value = draftName.trim();
    if (!supabase || !value) return;
    const { data } = await supabase.auth.updateUser({ data: { name: value } });
    if (data.user) setSession((s) => (s ? { ...s, user: data.user } : s));
    setEditingName(false);
  }

  function toggleCollapsed() {
    writeCollapsed(!collapsed);
  }

  if (session === null) {
    return (
      <>
        <SiteHeader current={current === "explore" ? "home" : current === "refer" ? "none" : current} />
        {children}
        <SiteFooter />
      </>
    );
  }

  const name = session ? firstName(session) : "";

  return (
    <div className={`app${collapsed ? " app-collapsed" : ""}${drawerOpen ? " app-drawer-open" : ""}`}>
      <div className="app-mobilebar">
        <button className="app-iconbtn" type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
          <Menu />
        </button>
        <Link className="brand" href="/explore">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/gable-mark.svg" alt="" />
          Gable
        </Link>
      </div>

      <div className="app-scrim" onClick={() => setDrawerOpen(false)} aria-hidden="true" />

      <aside className="app-sidebar" aria-label="Gable">
        <div className="app-sidebar-top">
          <Link className="brand" href="/explore" onClick={() => setDrawerOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/gable-mark.svg" alt="" />
            <span className="app-label">Gable</span>
          </Link>
          <button
            className="app-iconbtn app-collapse"
            type="button"
            aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
            aria-expanded={!collapsed}
            onClick={toggleCollapsed}
          >
            <PanelLeft />
          </button>
          <button className="app-iconbtn app-close" type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <X />
          </button>
        </div>

        <nav className="app-nav">
          {NAV.map(({ key, href, label, Icon }) => (
            <Link
              key={key}
              href={href}
              className="app-nav-link"
              aria-current={key === current ? "page" : undefined}
              title={collapsed ? label : undefined}
              onClick={() => setDrawerOpen(false)}
            >
              <Icon />
              <span className="app-label">{label}</span>
            </Link>
          ))}
        </nav>

        {session && (
          <div className="app-account">
            {editingName && !collapsed ? (
              <form className="app-name-form" onSubmit={saveName}>
                <label htmlFor="app-name" className="sr-only">
                  Your first name
                </label>
                <input
                  id="app-name"
                  autoFocus
                  autoComplete="given-name"
                  placeholder="Your first name"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => e.key === "Escape" && setEditingName(false)}
                />
                <button type="submit">Save</button>
              </form>
            ) : (
              <button
                type="button"
                className="app-me"
                title={collapsed ? (name ? `Hi, ${name}` : session.user.email ?? undefined) : "Change your name"}
                onClick={() => {
                  if (collapsed) return;
                  setDraftName(name);
                  setEditingName(true);
                }}
              >
                <span className="app-avatar" aria-hidden="true">
                  {(name[0] ?? session.user.email?.[0] ?? "?").toUpperCase()}
                </span>
                <span className="app-label app-me-name">{name ? `Hi, ${name}` : "Add your name"}</span>
              </button>
            )}
            <form action="/auth/signout" method="post">
              <button className="app-nav-link app-signout" type="submit" title={collapsed ? "Sign out" : undefined}>
                <LogOut />
                <span className="app-label">Sign out</span>
              </button>
            </form>
            <Link className="app-privacy app-label" href="/privacy">
              Privacy
            </Link>
          </div>
        )}
      </aside>

      <div className="app-main">{children}</div>
    </div>
  );
}
