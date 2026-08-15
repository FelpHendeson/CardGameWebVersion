"use client";

import { useEffect, useState } from "react";
import type { CardDefinition, CardCategory, Rarity } from "@duelo/shared";
import { getPrimaryArtworkSrc } from "../lib/card-artwork";

export type CardViewVariant = "hand" | "board" | "support" | "detail" | "field";

const RARITY_LABEL: Record<Rarity, string> = {
  COMMON: "Comum",
  UNCOMMON: "Incomum",
  RARE: "Rara",
  EPIC: "Épica",
  LEGENDARY: "Lendária",
};

const RARITY_ACCENT: Record<Rarity, string> = {
  COMMON: "border-stone-500/50",
  UNCOMMON: "border-emerald-600/60",
  RARE: "border-sky-500/70",
  EPIC: "border-violet-500/70",
  LEGENDARY: "border-amber-400/80",
};

const CATEGORY_LABEL: Record<CardCategory, string> = {
  UNIT: "Unidade",
  SPELL: "Feitiço",
  EQUIPMENT: "Equipamento",
  MAGIC_EQUIPMENT: "Equipamento Mágico",
  TRAP: "Armadilha",
  MAGIC_TRAP: "Armadilha Mágica",
  FIELD: "Campo",
};

export type CardViewProps = {
  card: CardDefinition;
  variant: CardViewVariant;
  selected?: boolean;
  hidden?: boolean;
  currentHp?: number;
  maxHp?: number;
  statusChips?: string[];
  hpTestId?: string;
  className?: string;
};

function ArtworkFrame({
  card,
  className,
  priority,
}: {
  card: CardDefinition;
  className: string;
  priority?: boolean;
}) {
  const src = getPrimaryArtworkSrc(card);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src, card.id]);

  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950 text-center ${className}`}
        data-testid="card-artwork-fallback"
        data-card-id={card.id}
      >
        <span className="text-[10px] uppercase tracking-wider text-stone-400">Arte indisponível</span>
        <span className="mt-1 font-mono text-xs text-stone-200">{card.id}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={card.artwork?.alt ?? card.name}
      className={`object-cover object-top ${className}`}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      data-testid="card-artwork"
      data-artwork-src={src}
    />
  );
}

function HiddenSupportFace({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-violet-700/50 bg-gradient-to-br from-violet-950 via-stone-950 to-black ${className ?? ""}`}
      data-testid="card-back"
      aria-label="Armadilha preparada"
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(139,92,246,0.25) 0 8px, transparent 8px 16px)",
        }}
      />
      <div className="relative flex h-full min-h-[4.5rem] flex-col items-center justify-center gap-1 p-2 text-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-violet-300">Véu</span>
        <span className="text-xs text-stone-300">Armadilha preparada</span>
      </div>
    </div>
  );
}

function MetaLine({ card }: { card: CardDefinition }) {
  return (
    <p className="truncate text-[10px] uppercase tracking-wide text-stone-400">
      {CATEGORY_LABEL[card.category]}
      {card.level != null ? ` · Nv. ${card.level}` : null}
    </p>
  );
}

export function CardView(props: CardViewProps) {
  const { card, variant, selected, hidden, currentHp, maxHp, statusChips = [], hpTestId, className = "" } = props;
  const rarityBorder = RARITY_ACCENT[card.rarity] ?? "border-white/10";
  const selectedRing = selected ? "ring-2 ring-orange-400" : "";

  if (hidden) {
    return <HiddenSupportFace className={className} />;
  }

  if (variant === "hand") {
    return (
      <div
        className={`flex w-[7.5rem] shrink-0 flex-col overflow-hidden rounded-xl border bg-black/40 ${rarityBorder} ${selectedRing} ${className}`}
        data-testid="card-view"
        data-variant="hand"
      >
        <ArtworkFrame card={card} className="aspect-[3/4] w-full" />
        <div className="space-y-0.5 p-2">
          <MetaLine card={card} />
          <p className="line-clamp-2 text-xs font-semibold leading-tight">{card.name}</p>
        </div>
      </div>
    );
  }

  if (variant === "board") {
    return (
      <div className={`flex h-full flex-col gap-1 ${className}`} data-testid="card-view" data-variant="board">
        <ArtworkFrame card={card} className="h-16 w-full rounded-md" />
        <p className="line-clamp-2 text-xs font-semibold leading-tight">{card.name}</p>
        {currentHp != null && maxHp != null ? (
          <p className="text-[11px] text-stone-200" data-testid={hpTestId}>
            {currentHp}/{maxHp} PV
          </p>
        ) : null}
        {statusChips.length > 0 ? (
          <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] uppercase">
            {statusChips.map((chip) => (
              <span key={chip} className="rounded bg-stone-800 px-1 py-0.5">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "support") {
    return (
      <div className={`flex h-full flex-col gap-1 ${className}`} data-testid="card-view" data-variant="support">
        <ArtworkFrame card={card} className="h-14 w-full rounded-md" />
        <p className="line-clamp-2 text-xs font-semibold leading-tight">{card.name}</p>
        {statusChips.length > 0 ? (
          <div className="flex flex-wrap gap-1 text-[10px] uppercase">
            {statusChips.map((chip) => (
              <span key={chip} className="rounded bg-amber-900 px-1 py-0.5">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (variant === "field") {
    return (
      <div
        className={`flex items-stretch gap-3 overflow-hidden rounded-xl border bg-black/30 ${rarityBorder} ${className}`}
        data-testid="card-view"
        data-variant="field"
      >
        <ArtworkFrame card={card} className="h-20 w-28 shrink-0" />
        <div className="flex min-w-0 flex-col justify-center py-2 pr-3">
          <MetaLine card={card} />
          <p className="truncate text-sm font-semibold">{card.name}</p>
          <p className="text-[10px] uppercase text-emerald-400">Campo ativo</p>
        </div>
      </div>
    );
  }

  // detail
  return (
    <div className={`space-y-3 ${className}`} data-testid="card-view" data-variant="detail">
      <ArtworkFrame card={card} className="mx-auto aspect-[3/4] w-full max-w-[12rem] rounded-lg" priority />
      <div>
        <p className="font-semibold">{card.name}</p>
        <p className="text-xs text-stone-400">
          {card.id} · {RARITY_LABEL[card.rarity] ?? card.rarity} · {CATEGORY_LABEL[card.category]}
        </p>
        {card.level != null ? (
          <p className="mt-1 text-sm">
            Nível {card.level}
            {card.maxHp != null
              ? ` · PV ${currentHp != null && maxHp != null ? `${currentHp}/${maxHp}` : card.maxHp}`
              : null}
          </p>
        ) : null}
        {card.types.length > 0 ? (
          <p className="mt-1 text-[11px] uppercase tracking-wide text-stone-400">{card.types.join(" · ")}</p>
        ) : null}
      </div>
      {card.attacks && card.attacks.length > 0 ? (
        <ul className="space-y-1 text-xs text-stone-300">
          {card.attacks.map((attack) => (
            <li key={attack.id}>
              <span className="font-semibold text-stone-100">{attack.name}</span>
              {attack.damage != null ? ` · ${attack.damage}` : null}
            </li>
          ))}
        </ul>
      ) : null}
      {card.keywords && card.keywords.length > 0 ? (
        <p className="text-[11px] uppercase text-violet-300">{card.keywords.join(" · ")}</p>
      ) : null}
      {card.rulesText ? <p className="text-sm text-stone-300">{card.rulesText}</p> : null}
    </div>
  );
}
