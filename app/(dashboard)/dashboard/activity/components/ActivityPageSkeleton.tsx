import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site";

export default function ActivityPageSkeleton() {
  const t = siteConfig.activity;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        {t.title}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{t.recent}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="bg-orange-200 rounded-full w-8 h-8" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between mt-6">
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="flex space-x-2">
              <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
