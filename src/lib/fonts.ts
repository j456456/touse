import { Lora, Rock_Salt, Caveat, Pangolin } from "next/font/google";

export const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const rockSalt = Rock_Salt({
  subsets: ["latin"],
  weight: ["400"],
});

export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-caveat",
});

export const pangolin = Pangolin({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pangolin",
});
