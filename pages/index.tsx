import { getConfiguredRootRoute } from "@/lib/rootRoute";

export default function RootRedirect() {
  return null;
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: getConfiguredRootRoute(),
      permanent: false,
    },
  };
}
