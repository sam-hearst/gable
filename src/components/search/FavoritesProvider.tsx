"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { listFavorites, setFavorite } from "@/app/favorites/actions";

type Favorites = { ids: string[]; signedIn: boolean; toggle: (id: string) => void };

const FavoritesContext = createContext<Favorites>({ ids: [], signedIn: false, toggle: () => {} });

// Where a signed-out heart click goes: sign in, then come back here with that
// listing saved.
function signInHref(id: string) {
  const next = window.location.pathname + window.location.search;
  return `/signin?next=${encodeURIComponent(next)}&save=${encodeURIComponent(id)}`;
}

// Holds the signed-in user's saved listing ids for the page, so every heart and
// the saved count update together. Saves go to the server; a failed save is
// undone on screen. When the page opens it re-reads the list from the server,
// because the browser can reuse an older copy of a page it visited before.
export function FavoritesProvider({
  initialIds,
  signedIn,
  children,
}: {
  initialIds: string[];
  signedIn: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ids, setIds] = useState(initialIds);
  const touched = useRef(false);

  useEffect(() => {
    if (!signedIn) return;
    let live = true;
    listFavorites()
      .then((fresh) => {
        // Skip if they've already hearted something since the page opened.
        if (live && fresh && !touched.current) setIds(fresh);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [signedIn]);

  const toggle = useCallback(
    (id: string) => {
      if (!signedIn) {
        // Already heading to sign-in from an earlier click.
        if (!window.location.pathname.startsWith("/signin")) router.push(signInHref(id));
        return;
      }
      touched.current = true;
      const save = !ids.includes(id);
      const apply = (on: boolean) => setIds((cur) => (on ? [...cur.filter((x) => x !== id), id] : cur.filter((x) => x !== id)));
      apply(save);
      setFavorite(id, save)
        .then((result) => {
          if (result === "ok") return;
          apply(!save);
          if (result === "signed-out") router.push(signInHref(id));
        })
        .catch(() => apply(!save));
    },
    [ids, signedIn, router],
  );

  return <FavoritesContext.Provider value={{ ids, signedIn, toggle }}>{children}</FavoritesContext.Provider>;
}

export const useFavorites = () => useContext(FavoritesContext);
