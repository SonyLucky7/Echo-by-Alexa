import { MetadataRoute } from "next";
import { getConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const { appUrl } = getConfig();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/menu", "/checkout"],
        disallow: ["/api/", "/staff/"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
