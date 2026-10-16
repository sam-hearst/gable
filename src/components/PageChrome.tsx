import Image from "next/image";
import { allPhotos } from "@/content/pages";

export function Header() {
  return (
    <header className="mx-auto w-full max-w-[1080px] px-5 pt-6">
      <Image src="/logo/gable-lockup.svg" alt="Gable" width={125} height={40} priority />
    </header>
  );
}

// Pexels doesn't require credit, but the style guide asks us to note it.
export function Footer() {
  const photographers = [...new Set(allPhotos.map((photo) => photo.photographer))];
  return (
    <footer className="mx-auto w-full max-w-[1080px] px-5 py-8 text-[15px] text-ink-faint">
      © 2026 Gable · Example listings use photos from Pexels by{" "}
      {photographers.join(", ")}.
    </footer>
  );
}
