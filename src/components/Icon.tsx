import { CSSProperties, MouseEvent } from 'react';

interface Props {
  children: string;

  // classes
  size?: 'normal' | 'small' | 'smaller' | 'large' | 'larger';
  color?: string;

  // forwarded to `i` tag
  title?: string;
  style?: CSSProperties;
  role?: string;
  onClick?: (event: MouseEvent<HTMLElement, globalThis.MouseEvent>) => void;
}

/**
 * @example
 *   <Icon>warning</Icon>
 *   <Icon>material:warning</Icon>
 *   <Icon>exportify:spotify</Icon>
 */
export default function Icon({ children, size = 'normal', color, style, ...rest }: Props) {
  const [vendorClass, iconName] = parseIcon(children);

  const getSize = () => {
    if (typeof size === 'number') return size;

    if (size === 'smaller') return 13;
    if (size === 'small') return 18;
    if (size === 'large') return 32;
    if (size === 'larger') return 48;

    return 24;
  };

  return (
    <i
      data-testid="icon"
      className={`fonticon ${vendorClass}`}
      style={{ ...style, ['--size' as string]: `${getSize()}px`, color }}
      {...rest}
    >
      {iconName}
    </i>
  );
}

/**
 * @example
 *   parseIcon('warning')               -> ['-vendor-material', 'warning']
 *   parseIcon('material:warning')      -> ['-vendor-material', 'warning']
 *   parseIcon('exportify:spotify')     -> ['-vendor-exportify', 'exportify']
 */
export function parseIcon(raw: string) {
  if (!raw.includes(':')) raw = `material:${raw}`;

  const [vendor, iconName] = raw.split(':');
  const vendorClass = `-vendor-${vendor}`;

  return [vendorClass, iconName] as const;
}
