export type IconsId =
  | "github"
  | "mode-dark"
  | "mode-light"
  | "npm";

export type IconsKey =
  | "Github"
  | "ModeDark"
  | "ModeLight"
  | "Npm";

export enum Icons {
  Github = "github",
  ModeDark = "mode-dark",
  ModeLight = "mode-light",
  Npm = "npm",
}

export const ICONS_CODEPOINTS: { [key in Icons]: string } = {
  [Icons.Github]: "61697",
  [Icons.ModeDark]: "61698",
  [Icons.ModeLight]: "61699",
  [Icons.Npm]: "61700",
};
