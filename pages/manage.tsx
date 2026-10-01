import Layout from "@/components/layout/Layout";
import { publicNavItems } from "@/components/layout/NavigationItems";
import NavTile from "@/components/title/NavTile";
import { t } from "@/lib/i18n";
import { useRouter } from "next/router";

interface ManageProps {
  showAdminButton: boolean;
}

export default function Manage({ showAdminButton }: ManageProps) {
  const router = useRouter();

  const handleNavigation = (slug: string) => {
    router.push(slug);
  };

  return (
    <div data-cy="indexpage" className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/splashbanner.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 via-primary/5 to-background" />

      <div className="relative">
        <Layout showAdminButton={showAdminButton}>
          <div className="max-w-5xl mx-auto px-4 ">
            <div className="flex flex-col items-center gap-15 pt-40 md:pt-48 pb-8 md:pb-16">
              {/* Self-sizing grid: fits as many 150–175px tiles per row as have
                  room, so an uneven item count never strands a lone tile. */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,175px))] justify-center gap-3 mt-4 w-full">
                {publicNavItems.map((item) => (
                  <NavTile
                    key={item.slug}
                    title={item.title}
                    subtitle={item.subtitle}
                    slug={item.slug}
                    icon={item.icon}
                    onClick={() => handleNavigation(item.slug)}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground/60 mt-4 text-center">
                {t("home.chooseSection")}
              </p>
            </div>
          </div>
        </Layout>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const showAdminButton =
    parseInt(
      process.env.BACKUP_BUTTON_SWITCH ||
        process.env.ADMIN_BUTTON_SWITCH ||
        "1",
      10,
    ) === 1;

  return {
    props: {
      showAdminButton,
    },
  };
}
