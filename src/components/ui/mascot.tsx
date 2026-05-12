import Image from "next/image";

type Style = "bot" | "classic" | "owl";
type Age = "seed" | "baby" | "kid" | "teen" | "hero";
type Motion = "float";

type Props = {
  style?: Style;
  age?: Age;
  size: number;
  className?: string;
  alt?: string;
  decorative?: boolean;
  priority?: boolean;
  motion?: Motion;
};

export function MascotImage({
  style = "bot",
  age = "hero",
  size,
  className,
  alt,
  decorative = false,
  priority = false,
  motion,
}: Props) {
  const src = `/avatars/${style}/${age}-transparent.svg`;
  const img = decorative ? (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      priority={priority}
    />
  ) : (
    <Image
      src={src}
      alt={alt ?? "Lexi"}
      width={size}
      height={size}
      className={className}
      priority={priority}
    />
  );
  if (motion === "float") {
    return <span className="lexi-float">{img}</span>;
  }
  return img;
}
