import { createFileRoute } from "@tanstack/react-router";
import AdminPage from "@/components/AdminPage";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard de Clima Laboral — CasaSur Hotel Collection" },
      {
        name: "description",
        content:
          "Resultados por sector, planes de acción y seguimiento del clima laboral de CasaSur Hotel Collection.",
      },
      { property: "og:title", content: "Dashboard de Clima Laboral — CasaSur Hotel Collection" },
      {
        property: "og:description",
        content:
          "Resultados por sector, planes de acción y seguimiento del clima laboral de CasaSur Hotel Collection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});
