// Pexels photos (docs/style_guide.md, Imagery). Pexels already resizes and
// compresses through the URL, so these stay plain <img> tags; the landing CSS
// handles sizing and object-fit.

export function px(id: number, width = 600) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

type PhotoProps = { id: number; width?: number; alt?: string; className?: string };

export function Photo({ id, width = 600, alt = "", className }: PhotoProps) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={px(id, width)} alt={alt} className={className} loading="lazy" />;
}
