"use client";

import { useLocale } from "@/components/LocaleProvider";
import type { HubMessages } from "@/lib/i18n/hub";

type CopyKey = {
  [K in keyof HubMessages]: HubMessages[K] extends string ? K : never;
}[keyof HubMessages];

type Props = {
  kicker: CopyKey;
  title: CopyKey;
  lede: CopyKey;
};

export function HubPageIntro({ kicker, title, lede }: Props) {
  const { t } = useLocale();

  return (
    <>
      <p className="hub-kicker">{t[kicker]}</p>
      <h1 className="page-title">{t[title]}</h1>
      <p className="lede">{t[lede]}</p>
    </>
  );
}
