import { createFileRoute } from "@tanstack/react-router";
import SurveyPage from "@/pages/SurveyPage";

export const Route = createFileRoute("/encuesta")({
  head: () => ({
    meta: [
      { title: "Encuesta de Clima Laboral — CasaSur Hotel Collection" },
      {
        name: "description",
        content:
          "Completá la encuesta semestral de clima laboral de CasaSur Hotel Collection de forma anónima.",
      },
      { property: "og:title", content: "Encuesta de Clima Laboral — CasaSur Hotel Collection" },
      {
        property: "og:description",
        content:
          "Completá la encuesta semestral de clima laboral de CasaSur Hotel Collection de forma anónima.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SurveyPage,
});
