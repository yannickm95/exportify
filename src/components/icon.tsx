import { cloneElement } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";

import { cn } from "~/helpers/cn";

type IconSize = "normal" | "small" | "smaller" | "large" | "larger";

export type IconProps = Omit<ComponentPropsWithRef<"svg">, "children" | "height" | "width"> & {
  size?: IconSize;
  title?: string;
};

type IconElement = ReactElement<ComponentPropsWithRef<"svg"> & { "data-displayname"?: string }>;

const iconSizes = {
  smaller: 13,
  small: 18,
  normal: 24,
  large: 32,
  larger: 48,
} as const;

function defineIcon(svgElement: IconElement) {
  const Icon = (props: IconProps) => {
    const title = props.title;

    return cloneElement(
      svgElement,
      {
        ...svgIconProps(props),
        "data-displayname": undefined,
      },
      title ? (
        <>
          <title>{title}</title>
          {svgElement.props.children}
        </>
      ) : (
        svgElement.props.children
      ),
    );
  };

  const displayName = svgElement.props["data-displayname"];
  if (displayName) Icon.displayName = displayName;

  return Icon;
}

function svgIconProps({ className, size = "normal", title, ...props }: IconProps) {
  const isLabelled = Boolean(title || props["aria-label"] || props["aria-labelledby"]);

  return {
    ...props,
    "aria-hidden": props["aria-hidden"] ?? (isLabelled ? undefined : true),
    "className": cn("inline-block shrink-0 fill-current text-current", className),
    "data-testid": props["data-testid"] ?? "icon",
    "height": iconSizes[size],
    "role": props.role ?? (isLabelled ? "img" : undefined),
    "width": iconSizes[size],
    "xmlns": "http://www.w3.org/2000/svg",
  };
}

export const LogoutIcon = defineIcon(
  <svg data-displayname="LogoutIcon" viewBox="0 0 24 24">
    <path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z" />
  </svg>,
);

export const CheckCircleOutlineIcon = defineIcon(
  <svg data-displayname="CheckCircleOutlineIcon" viewBox="0 0 24 24">
    <path d="M16.59 7.58 10 14.17l-3.59-3.58L5 12l5 5 8-8zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8" />
  </svg>,
);

export const SortByAlphaIcon = defineIcon(
  <svg data-displayname="SortByAlphaIcon" viewBox="0 0 24 24">
    <path d="M14.94 4.66h-4.72l2.36-2.36zm-4.69 14.71h4.66l-2.33 2.33zM6.1 6.27 1.6 17.73h1.84l.92-2.45h5.11l.92 2.45h1.84L7.74 6.27zm-1.13 7.37 1.94-5.18 1.94 5.18zm10.76 2.5h6.12v1.59H13.2v-1.29l5.92-8.56h-5.88v-1.6h8.3v1.26z" />
  </svg>,
);

export const SortIcon = defineIcon(
  <svg data-displayname="SortIcon" viewBox="0 0 24 24">
    <path d="M3 18h6v-2H3zM3 6v2h18V6zm0 7h12v-2H3z" />
  </svg>,
);

export const DownloadIcon = defineIcon(
  <svg data-displayname="DownloadIcon" viewBox="0 0 24 24">
    <path d="M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z" />
  </svg>,
);

export const SpotifyIcon = defineIcon(
  <svg data-displayname="SpotifyIcon" viewBox="0 0 640 640">
    <path d="M320 72C183 72 72 183 72 320s111 248 248 248 248-111 248-248S457 72 320 72m100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4m26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5m31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3" />
  </svg>,
);
