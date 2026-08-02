import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Themes & Experiences | CelebrationCraft",
  description: "Browse 30+ interactive celebration themes and experiences. From birthday mini-games to elegant wedding invitations.",
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
