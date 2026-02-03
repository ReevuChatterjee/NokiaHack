def _compute_overflow_fraction(aggregated_gbps: np.ndarray,
                               candidate_cap_gbps: float) -> float:
    """
    Simulate a token-bucket buffer.
    Returns fraction of slots that overflowed.
    """

    n = len(aggregated_gbps)
    if n == 0:
        return 0.0   # no traffic → no overflow

    B_gb = candidate_cap_gbps * BUFFER_DURATION_S
    excess = np.maximum(aggregated_gbps - candidate_cap_gbps, 0.0)

    overflow_cnt = 0
    buf = 0.0

    for e in excess:
        buf += e
        if buf > B_gb:
            overflow_cnt += 1
            buf = 0.0

    return overflow_cnt / n



def capacity_with_buffer(series: pd.Series, tol: float = 1e-6) -> float:
    """
    Binary-search for the smallest capacity C such that
    overflow_fraction(C) ≤ MAX_LOSS_FRAC.

    Search range : [mean, peak]
    Termination  : |hi − lo| < tol  or  60 bisections
    """
    arr = series.values.astype(np.float64)
    lo  = float(series.mean())
    hi  = float(series.max())

    if _compute_overflow_fraction(arr, lo) <= MAX_LOSS_FRAC:
        return lo                                # mean already safe

    for _ in range(60):
        mid = (lo + hi) / 2.0
        if hi - lo < tol:
            break
        if _compute_overflow_fraction(arr, mid) <= MAX_LOSS_FRAC:
            hi = mid                             # feasible → try lower
        else:
            lo = mid                             # too lossy → raise

    return hi