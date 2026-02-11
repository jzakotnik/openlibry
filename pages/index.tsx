import Layout from "@/components/layout/Layout";
import { publicNavItems } from "@/components/layout/NavigationItems";
import NavTile from "@/components/title/NavTile";
import { useRouter } from "next/router";

interface HomeProps {
  showAdminButton: boolean;
}

export default function Home({ showAdminButton }: HomeProps) {
  const router = useRouter();

  const handleNavigation = (slug: string) => {
    router.push(slug);
  };

  return (
    <div className="relative min-h-screen">
      {/* Background image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/splashbanner.jpg')" }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/10 via-primary/5 to-background" />

      {/* Content */}
      <div className="relative">
        <Layout showAdminButton={showAdminButton}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex flex-col items-center gap-15 pt-40 md:pt-48 pb-8 md:pb-16">
              {/* Hero Section */}
              <div className="text-center max-w-[700px]">
                <h1
                  id="title_headline"
                  data-cy="indexpage"
                  className="
                  font-bold text-primary-dark mb-3 gap-15
                  text-3xl sm:text-4xl md:text-5xl
                  [text-shadow:0_2px_20px_rgba(255,255,255,0.8)]
                "
                >
                  OpenLibry
                </h1>
                <p className="text-muted-foreground text-lg sm:text-xl px-2">
                  Die <strong>einfache</strong> Büchereiverwaltung für Schulen
                </p>
              </div>

              {/* Navigation Tiles */}
              <div
                className="
                grid gap-4 mt-4 w-fit mx-auto
                grid-cols-1 sm:grid-cols-2 md:grid-cols-4
              "
              >
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

              {/* Footer hint */}
              <p className="text-xs text-muted-foreground/60 mt-4 text-center">
                Wähle einen Bereich um zu starten
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
    ) === 1; //keep backup button env for backwards compatibility

  return {
    props: {
      showAdminButton,
    },
  };
}
