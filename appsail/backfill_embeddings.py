"""
backfill_embeddings.py

Precompute narrative vectors for every case, once, so case_twin_fn/match
scores with numpy alone instead of loading the embedding model per request
(narrative_similarity tier 1). Run this at ingestion time and whenever a
case's narrative_text changes -- it is idempotent.

    python backfill_embeddings.py            # embed cases missing a vector
    python backfill_embeddings.py --all      # re-embed everything
    python backfill_embeddings.py --dry-run  # report only, write nothing

Kannada narratives are embedded AS KANNADA. There is deliberately no
translation step anywhere in this script.
"""
import sys
import logging

from repositories import CatalystRepository
from routers.case_twin_fn import embed_narrative, _EMBED_MODEL_ID, _get_embed_model

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger("backfill")


def main():
    force = "--all" in sys.argv
    dry_run = "--dry-run" in sys.argv

    repo = CatalystRepository()
    if repo.is_fallback():
        logger.warning("Catalyst Data Store unavailable -- running against mock cases. "
                       "Vectors will be reported, not persisted.")

    if _get_embed_model() is None:
        logger.error(f"Embedding model '{_EMBED_MODEL_ID}' could not be loaded. "
                     f"Nothing to backfill; matching will fall back to on-the-fly "
                     f"embedding or TF-IDF.")
        return 1

    cases = repo.fetch_cases()
    logger.info(f"Model: {_EMBED_MODEL_ID}")
    logger.info(f"Cases fetched: {len(cases)}")

    embedded = skipped = failed = 0
    for c in cases:
        case_id = c.get("case_id")
        text = (c.get("narrative_text") or "").strip()
        if not text:
            logger.info(f"  {case_id}: no narrative_text -- skipped")
            skipped += 1
            continue
        if c.get("narrative_embedding") and not force:
            logger.info(f"  {case_id}: vector already present -- skipped (use --all to redo)")
            skipped += 1
            continue

        vec = embed_narrative(text)
        if not vec:
            logger.warning(f"  {case_id}: embedding failed")
            failed += 1
            continue

        if dry_run:
            logger.info(f"  {case_id}: would store {len(vec)}-dim vector (dry run)")
        else:
            repo.store_case_embedding(case_id, vec, _EMBED_MODEL_ID)
            logger.info(f"  {case_id}: stored {len(vec)}-dim vector")
        embedded += 1

    logger.info(f"\nDone. embedded={embedded} skipped={skipped} failed={failed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
