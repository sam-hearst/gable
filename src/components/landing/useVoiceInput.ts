"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// The browser's built-in speech-to-text (Chrome, Edge and Safari). No library
// and no server: the browser does the listening. Firefox doesn't have it, so
// `supported` is false there and the mic button stays hidden.

type Result = { 0: { transcript: string }; isFinal: boolean };
type RecognitionEvent = { resultIndex: number; results: ArrayLike<Result> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => Recognition;

function getCtor(): RecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

// onText gets the full text so far (what was in the box before, plus what was said).
export function useVoiceInput(onText: (text: string) => void) {
  // False on the server and true in browsers that can listen, without a flash.
  const supported = useSyncExternalStore(
    () => () => {},
    () => Boolean(getCtor()),
    () => false,
  );
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recRef = useRef<Recognition | null>(null);

  useEffect(() => () => recRef.current?.stop(), []);

  function start(before: string) {
    const Ctor = getCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    const prefix = before.trim() ? before.trim() + " " : "";
    rec.onresult = (e) => {
      let said = "";
      for (let i = 0; i < e.results.length; i++) said += e.results[i][0].transcript;
      onText(prefix + said.trim());
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "Allow the microphone in your browser to talk instead of type."
          : e.error === "no-speech"
            ? "Didn't catch that. Tap the mic and try again."
            : "",
      );
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setError("");
    setListening(true);
    rec.start();
  }

  function stop() {
    recRef.current?.stop();
  }

  return { supported, listening, error, start, stop };
}
