type Props = { className?: string; title?: string; decorative?: boolean };

export function NlFlag({ className = "h-4 w-6", title = "Nederland", decorative }: Props) {
  if (decorative) {
    return (
      <svg className={className} viewBox="0 0 60 40" aria-hidden="true">
        <rect width="60" height="13.33" y="0" fill="#AE1C28" />
        <rect width="60" height="13.34" y="13.33" fill="#FFFFFF" />
        <rect width="60" height="13.33" y="26.67" fill="#21468B" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 60 40" role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="60" height="13.33" y="0" fill="#AE1C28" />
      <rect width="60" height="13.34" y="13.33" fill="#FFFFFF" />
      <rect width="60" height="13.33" y="26.67" fill="#21468B" />
    </svg>
  );
}

export function BeFlag({ className = "h-4 w-6", title = "België", decorative }: Props) {
  if (decorative) {
    return (
      <svg className={className} viewBox="0 0 60 40" aria-hidden="true">
        <rect width="20" height="40" x="0" fill="#000000" />
        <rect width="20" height="40" x="20" fill="#FAE042" />
        <rect width="20" height="40" x="40" fill="#ED2939" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 60 40" role="img" aria-label={title}>
      <title>{title}</title>
      <rect width="20" height="40" x="0" fill="#000000" />
      <rect width="20" height="40" x="20" fill="#FAE042" />
      <rect width="20" height="40" x="40" fill="#ED2939" />
    </svg>
  );
}
