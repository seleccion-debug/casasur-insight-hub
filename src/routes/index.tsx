import { createFileRoute } from "@tanstack/react-router";
import SurveyPage from "@/components/SurveyPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Encuesta de Clima Laboral — CasaSur Hotel Collection" },
      {
        name: "description",
        content:
          "Encuesta anónima de clima laboral para los equipos de CasaSur Hotel Collection.",
      },
      { property: "og:title", content: "Encuesta de Clima Laboral — CasaSur Hotel Collection" },
      {
        property: "og:description",
        content:
          "Encuesta anónima de clima laboral para los equipos de CasaSur Hotel Collection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SurveyPage,
});
