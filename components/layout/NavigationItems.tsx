import {
  BarChartIcon,
  PersonIcon,
  ReaderIcon,
  ShuffleIcon,
} from "@radix-ui/react-icons";
import { ReactNode } from "react";

import { t } from "@/lib/i18n";

interface NavItem {
  title: string;
  subtitle: string;
  slug: string;
  icon?: ReactNode;
}

export const publicNavItems: NavItem[] = [
  {
    title: t("nav.rental.title"),
    subtitle: t("nav.rental.subtitle"),
    slug: "/rental",
    icon: <ShuffleIcon width={24} height={24} />,
  },
  {
    title: t("nav.user.title"),
    subtitle: t("nav.user.subtitle"),
    slug: "/user",
    icon: <PersonIcon width={24} height={24} />,
  },
  {
    title: t("nav.book.title"),
    subtitle: t("nav.book.subtitle"),
    slug: "/book",
    icon: <ReaderIcon width={24} height={24} />,
  },
  {
    title: t("nav.reports.title"),
    subtitle: t("nav.reports.subtitle"),
    slug: "/reports",
    icon: <BarChartIcon width={24} height={24} />,
  },
];
