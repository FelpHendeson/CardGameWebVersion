import type { CardDefinition } from "@duelo/shared";

/** Resolve assetId canônico para path estático do Next (`public/cards`). */
export function resolveCardArtworkPath(assetId: string): string {
  return `/cards/${assetId}.png`;
}

export function getPrimaryArtworkSrc(card: Pick<CardDefinition, "id" | "artwork">): string | null {
  const assetId = card.artwork?.assetId ?? card.id;
  if (!assetId) {
    return null;
  }
  return resolveCardArtworkPath(assetId);
}

export function getAlternateArtworkSrcs(card: Pick<CardDefinition, "artwork">): string[] {
  return (card.artwork?.alternateAssetIds ?? []).map(resolveCardArtworkPath);
}

/** Armadilha preparada e não revelada não mostra arte (especialmente ao adversário). */
export function shouldRevealSupportArtwork(revealed: boolean | undefined): boolean {
  return revealed !== false;
}
