import { HomeHub } from "@/components/HomeHub";
import { getBlinksBase } from "@/lib/config";

export default function Home() {
  return <HomeHub blinkBase={getBlinksBase()} />;
}
