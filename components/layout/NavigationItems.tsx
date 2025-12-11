import {
  AssessmentOutlined,
  AutoStoriesOutlined,
  PeopleOutlined,
  SwapHorizOutlined,
} from "@mui/icons-material";
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
    icon: <SwapHorizOutlined />,
  },
  {
    title: "Nutzer",
    subtitle: "Verwaltung der User",
    slug: "/user",
    icon: <PeopleOutlined />,
  },
  {
    title: "Bücher",
    subtitle: "Bestand aller Medien",
    slug: "/book",
    icon: <AutoStoriesOutlined />,
  },
  {
    title: "Reports",
    subtitle: "Überblick über Bestand",
    slug: "/reports",
    icon: <AssessmentOutlined />,
  },
];
