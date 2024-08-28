export type IconsId =
  | "npm"
  | "mode-light"
  | "mode-dark"
  | "github";

export type IconsKey =
  | "Npm"
  | "ModeLight"
  | "ModeDark"
  | "Github";

export enum Icons {
  Npm = "npm",
  ModeLight = "mode-light",
  ModeDark = "mode-dark",
  Github = "github",
}

export const ICONS_CODEPOINTS: { [key in Icons]: string } = {
  [Icons.Npm]: "61697",
  [Icons.ModeLight]: "61698",
  [Icons.ModeDark]: "61699",
  [Icons.Github]: "61700",
};
