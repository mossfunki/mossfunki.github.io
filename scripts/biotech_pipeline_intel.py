#!/usr/bin/env python3
"""
Biotech Pipeline Intelligence — Healthcare CI Project
Pulls clinical trial activity and FDA drug approval data from public federal APIs.
No API keys required.

Data sources:
  - ClinicalTrials.gov REST API v2 (https://clinicaltrials.gov/api/v2/)
  - FDA CDER Drug Approval Database (https://www.fda.gov/drugs/drug-approvals-and-databases/)
"""
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "biotech"
DATA_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {"Accept": "application/json", "User-Agent": "BioIntelPipeline/1.0 (portfolio project)"}

# Therapeutic areas to track
INDICATIONS = [
    "oncology", "rare disease", "CNS", "immunology",
    "cardiovascular", "infectious disease", "metabolic",
]

PHASE_LABELS = {
    "PHASE1": "Phase I",
    "PHASE2": "Phase II",
    "PHASE3": "Phase III",
    "PHASE4": "Phase IV (Post-market)",
    "NA": "Not Applicable",
    "EARLY_PHASE1": "Early Phase I",
}


# ── ClinicalTrials.gov ────────────────────────────────────────────────────────

def fetch_trials_for_condition(condition: str, max_studies: int = 200) -> list[dict]:
    """Fetch Phase II/III trials for a given condition from ClinicalTrials.gov API v2."""
    url = "https://clinicaltrials.gov/api/v2/studies"
    params = {
        "query.cond": condition,
        "pageSize": min(max_studies, 200),
        "format": "json",
    }
    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        studies = data.get("studies", [])
        rows = []
        for s in studies:
            proto = s.get("protocolSection", {})
            id_mod = proto.get("identificationModule", {})
            status_mod = proto.get("statusModule", {})
            design_mod = proto.get("designModule", {})
            sponsor_mod = proto.get("sponsorCollaboratorsModule", {})
            conds_mod = proto.get("conditionsModule", {})
            rows.append({
                "nct_id":       id_mod.get("nctId", ""),
                "title":        id_mod.get("briefTitle", "")[:120],
                "status":       status_mod.get("overallStatus", ""),
                "phase":        PHASE_LABELS.get(
                    (design_mod.get("phases") or [""])[0], "Unknown"
                ),
                "sponsor":      sponsor_mod.get("leadSponsor", {}).get("name", ""),
                "start_date":   status_mod.get("startDateStruct", {}).get("date", ""),
                "completion_date": status_mod.get("primaryCompletionDateStruct", {}).get("date", ""),
                "condition":    condition,
                "conditions_raw": ", ".join((conds_mod.get("conditions") or [])[:3]),
            })
        return rows
    except Exception as e:
        print(f"  Warning: ClinicalTrials fetch failed for '{condition}': {e}")
        return []


def fetch_all_trials() -> pd.DataFrame:
    print("Fetching clinical trial data from ClinicalTrials.gov...")
    all_rows = []
    for indication in INDICATIONS:
        print(f"  Querying: {indication}")
        rows = fetch_trials_for_condition(indication)
        all_rows.extend(rows)
        time.sleep(0.5)  # be polite to the API
    df = pd.DataFrame(all_rows)
    if df.empty:
        return df
    df = df.drop_duplicates(subset="nct_id")
    print(f"  Total unique trials: {len(df)}")
    return df


# ── FDA Drug Approvals ────────────────────────────────────────────────────────

def fetch_fda_approvals() -> pd.DataFrame:
    """Fetch recent FDA drug approvals from the openFDA API."""
    print("Fetching FDA drug approval data...")
    url = "https://api.fda.gov/drug/drugsfda.json"
    params = {
        "limit": 100,
    }
    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        results = [
            r for r in data.get("results", [])
            if r.get("application_number", "").startswith(("NDA", "BLA"))
        ]
        rows = []
        for r in results:
            sponsor = r.get("sponsor_name", "")
            brand = r.get("brand_name", "")
            generic = r.get("generic_name", "") or r.get("application_number", "")
            products = r.get("products", [])
            drug_name = brand or (products[0].get("brand_name", "") if products else "") or generic
            # Most recent approved submission
            approved_subs = [
                s for s in r.get("submissions", [])
                if s.get("submission_status") == "AP"
                and s.get("submission_type") in ("ORIG", "NDA", "BLA", "ORIG-1")
            ]
            if not approved_subs:
                continue
            latest = max(approved_subs, key=lambda s: s.get("submission_status_date", ""))
            rows.append({
                "sponsor":       sponsor,
                "drug_name":     drug_name[:80],
                "application":   r.get("application_number", ""),
                "approval_date": latest.get("submission_status_date", ""),
                "submission_type": latest.get("submission_type", ""),
            })
        df = pd.DataFrame(rows)
        print(f"  FDA approvals fetched: {len(df)}")
        return df
    except Exception as e:
        print(f"  Warning: FDA fetch failed: {e}")
        return pd.DataFrame()


# ── Analysis ─────────────────────────────────────────────────────────────────

def build_competitive_landscape(trials_df: pd.DataFrame) -> dict:
    """Summarize competitive density by indication and sponsor pipeline."""
    if trials_df.empty:
        return {}

    # Trials by indication + phase
    by_indication = (
        trials_df.groupby(["condition", "phase"])
        .size()
        .reset_index(name="trial_count")
        .sort_values(["condition", "trial_count"], ascending=[True, False])
    )

    # Top sponsors by number of Phase II/III trials
    sponsor_pipeline = (
        trials_df[trials_df["status"].isin(["RECRUITING", "ACTIVE_NOT_RECRUITING"])]
        .groupby("sponsor")
        .size()
        .reset_index(name="active_trials")
        .sort_values("active_trials", ascending=False)
        .head(20)
    )

    # Phase III pipeline (near-approval signals)
    phase3 = (
        trials_df[trials_df["phase"] == "Phase III"]
        [["sponsor", "title", "condition", "status", "completion_date"]]
        .sort_values("completion_date")
        .head(50)
    )

    return {
        "by_indication": by_indication.to_dict(orient="records"),
        "top_sponsors":  sponsor_pipeline.to_dict(orient="records"),
        "phase3_pipeline": phase3.to_dict(orient="records"),
    }


# ── Output ────────────────────────────────────────────────────────────────────

def main() -> None:
    print("=== Biotech Pipeline Intelligence ===")
    trials_df = fetch_all_trials()
    fda_df = fetch_fda_approvals()

    landscape = build_competitive_landscape(trials_df)

    # Save structured outputs
    if not trials_df.empty:
        trials_df.to_csv(DATA_DIR / "clinical_trials.csv", index=False)
        print(f"  Saved {len(trials_df)} trials -> data/biotech/clinical_trials.csv")

    if not fda_df.empty:
        fda_df.to_csv(DATA_DIR / "fda_approvals.csv", index=False)
        print(f"  Saved {len(fda_df)} approvals -> data/biotech/fda_approvals.csv")

    summary = {
        "last_run":        datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "total_trials":    len(trials_df),
        "total_approvals": len(fda_df),
        "indications_tracked": INDICATIONS,
        "top_sponsors_by_active_trials": landscape.get("top_sponsors", [])[:10],
        "phase3_count":    len([t for t in landscape.get("phase3_pipeline", [])]),
    }
    with open(DATA_DIR / "pipeline-summary.json", "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\nSummary:")
    print(f"  Clinical trials: {summary['total_trials']}")
    print(f"  FDA approvals:   {summary['total_approvals']}")
    print(f"  Phase III active: {summary['phase3_count']}")
    print(f"  Top sponsor:     {summary['top_sponsors_by_active_trials'][0]['sponsor'] if summary['top_sponsors_by_active_trials'] else 'n/a'}")
    print("=== Done ===")


if __name__ == "__main__":
    main()
