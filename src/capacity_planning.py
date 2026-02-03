import pandas as pd

from src.buffer_model import capacity_with_buffer

def capacity_no_buffer(series: pd.Series) -> float:
    """Required capacity when no buffer is present = peak traffic."""
    return float(series.max())

def build_capacity_summary(link_traffic: pd.DataFrame,
                           topology: dict) -> pd.DataFrame:
    """One row per link with all required statistics."""

    rows = []

    # ✅ iterate ONLY over inferred links
    for link_id in topology["links"].keys():

        s = link_traffic.loc[
            link_traffic["link_id"] == link_id,
            "aggregated_gbps"
        ]

        # defensive check
        if s.empty:
            print(f"⚠️  No traffic data for {link_id}, skipping")
            continue

        rows.append({
            "link_id": link_id,
            "avg_gbps": round(s.mean(), 4),
            "peak_gbps": round(s.max(), 4),
            "p95_gbps": round(s.quantile(0.95), 4),
            "capacity_no_buffer_gbps": round(capacity_no_buffer(s), 4),
            "capacity_with_buffer_gbps": round(capacity_with_buffer(s), 4),
        })

    return pd.DataFrame(rows)