import { ArrowLeftRight, BookOpen, ChartBar, Users } from "lucide-react";
import { ReactNode } from "react";

interface NavItem {
  title: string;
  subtitle: string;
  slug: string;
  icon?: ReactNode;
}

export const publicNavItems: NavItem[] = [
  {
    title: "Leihe",
    subtitle: "Entleihe und Rückgabe",
    slug: "/rental",
    icon: <ArrowLeftRight className="size-6" />,
  },
  {
    title: "Nutzer",
    subtitle: "Verwaltung der User",
    slug: "/user",
    icon: <Users className="size-6" />,
  },
  {
    title: "Bücher",
    subtitle: "Bestand aller Medien",
    slug: "/book",
    icon: <BookOpen className="size-6" />,
  },
  {
    title: "Reports",
    subtitle: "Überblick über Bestand",
    slug: "/reports",
    icon: <ChartBar className="size-6" />,
  },
];
