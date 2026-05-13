// Approximated SVG payment logo row (no third-party assets in this MVP).
// Replace with licensed brand SVGs in /public/payment/ when wiring real
// providers — leave the component API the same.

type Props = {
  /** Override default vertical size (32px). */
  height?: number;
  className?: string;
};

export function PaymentLogos({ height = 22, className = "" }: Props) {
  return (
    <ul
      aria-label="Geaccepteerde betaalmethoden"
      className={`flex items-center gap-3 ${className}`}
    >
      <li>
        <IdealLogo height={height} />
      </li>
      <li>
        <MastercardLogo height={height} />
      </li>
      <li>
        <VisaLogo height={height} />
      </li>
      <li>
        <BancontactLogo height={height} />
      </li>
    </ul>
  );
}

function IdealLogo({ height }: { height: number }) {
  // 48x28 viewBox; stylised pink+blue mark.
  return (
    <svg
      role="img"
      aria-label="iDEAL"
      width={(height * 48) / 28}
      height={height}
      viewBox="0 0 48 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>iDEAL</title>
      <rect width="48" height="28" rx="3" fill="#fff" stroke="#d1d5db" />
      <text
        x="6"
        y="19"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        fontWeight="800"
        fill="#cc0066"
      >
        i
      </text>
      <text
        x="12"
        y="19"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="11"
        fontWeight="800"
        fill="#1e3a8a"
      >
        DEAL
      </text>
    </svg>
  );
}

function MastercardLogo({ height }: { height: number }) {
  return (
    <svg
      role="img"
      aria-label="Mastercard"
      width={(height * 40) / 28}
      height={height}
      viewBox="0 0 40 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Mastercard</title>
      <rect width="40" height="28" rx="3" fill="#fff" stroke="#d1d5db" />
      <circle cx="16" cy="14" r="8" fill="#eb001b" />
      <circle cx="24" cy="14" r="8" fill="#f79e1b" opacity="0.92" />
      <path d="M20 8 a8 8 0 0 0 0 12 a8 8 0 0 0 0 -12" fill="#ff5f00" />
    </svg>
  );
}

function VisaLogo({ height }: { height: number }) {
  return (
    <svg
      role="img"
      aria-label="Visa"
      width={(height * 44) / 28}
      height={height}
      viewBox="0 0 44 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Visa</title>
      <rect width="44" height="28" rx="3" fill="#1a1f71" />
      <text
        x="22"
        y="19"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontStyle="italic"
        fontSize="13"
        fontWeight="900"
        fill="#fff"
      >
        VISA
      </text>
      <rect x="0" y="22" width="44" height="2" fill="#f7b600" />
    </svg>
  );
}

function BancontactLogo({ height }: { height: number }) {
  return (
    <svg
      role="img"
      aria-label="Bancontact"
      width={(height * 56) / 28}
      height={height}
      viewBox="0 0 56 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Bancontact</title>
      <rect width="56" height="28" rx="3" fill="#fff" stroke="#d1d5db" />
      <rect x="6" y="8" width="20" height="12" rx="2" fill="#005498" />
      <rect x="22" y="8" width="20" height="12" rx="2" fill="#ffd200" />
      <text
        x="28"
        y="22.5"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize="6"
        fontWeight="800"
        fill="#374151"
      >
        BANCONTACT
      </text>
    </svg>
  );
}
