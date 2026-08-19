import { HomeHub } from "@/components/HomeHub";
import { getApiBase, getBlinksBase } from "@/lib/config";

export default function HomePage() {
  return <HomeHub siteBase={getBlinksBase()} apiBase={getApiBase()} />;
}
