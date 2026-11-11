"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchAddresses, type AddressSuggestion } from "@/lib/nyc-geosearch";

// The street field on "List your room". Type an address and NYC's address
// search suggests matches; picking one fills in the street (never the building
// number, which stays private) and, when we list it, the neighborhood. Typing
// cross streets by hand still works, so a failed lookup never blocks posting.
export function AddressAutofill({
  id,
  value,
  onChange,
  onPick,
  onGuess,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onPick: (s: AddressSuggestion) => void;
  // Called when they leave the field without picking: the best match, so the
  // neighborhood can still fill in.
  onGuess?: (s: AddressSuggestion) => void;
}) {
  const listId = useId();
  const [items, setItems] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [searching, setSearching] = useState(false);
  const picked = useRef(false); // skip the lookup right after picking a suggestion
  const box = useRef<HTMLDivElement>(null);
  const focused = useRef(false); // a late lookup must not reopen the list after they left the field

  useEffect(() => {
    if (picked.current) {
      picked.current = false;
      return;
    }
    if (value.trim().length < 3) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await searchAddresses(value.trim(), ctrl.signal);
        setItems(found);
        setActive(-1);
        setOpen(found.length > 0 && focused.current);
      } catch {
        // Offline or the service is down: leave the field as a plain text box.
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [value]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function pick(s: AddressSuggestion) {
    picked.current = true;
    setOpen(false);
    setItems([]);
    onPick(s);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="addr" ref={box}>
      <input
        id={id}
        required
        minLength={3}
        maxLength={80}
        autoComplete="off"
        placeholder="Start typing your street, like W 110th St"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-describedby={`${id}-hint`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          focused.current = true;
          if (items.length > 0) setOpen(true);
        }}
        onBlur={() => {
          focused.current = false;
          setOpen(false);
          if (items[0] && value.trim().length >= 3) onGuess?.(items[0]);
        }}
        onKeyDown={onKeyDown}
      />
      {searching && <span className="addr-spin" aria-hidden="true" />}
      {open && value.trim().length >= 3 && (
        <ul className="addr-list" role="listbox" id={listId}>
          {items.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? "is-active" : undefined}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <b>{s.full}</b>
              <small>{s.neighborhood ?? "Neighborhood not on our list yet"}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
