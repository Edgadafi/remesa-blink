"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { HubMessages } from "@/lib/i18n/hub";

type CopyKey = {
  [K in keyof HubMessages]: HubMessages[K] extends string ? K : never;
}[keyof HubMessages];

export function HubText({ k }: { k: CopyKey }) {
  const { t } = useLocale();
  return <>{t[k]}</>;
}
