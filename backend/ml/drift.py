import numpy as np

def calculate_psi(expected, actual, num_bins=10):
    """
    Calculates Population Stability Index (PSI) between baseline (expected) and current (actual) distributions.
    expected: np.array or list of baseline numbers
    actual: np.array or list of current numbers
    num_bins: number of bins for discretization
    
    PSI rule of thumb:
    PSI < 0.1: No change
    0.1 <= PSI < 0.2: Moderate change
    PSI >= 0.2: Significant change / drift detected
    """
    expected = np.array(expected)
    actual = np.array(actual)

    if len(expected) == 0 or len(actual) == 0:
        return 0.0

    # Ensure we are working with 1D arrays
    expected = expected.flatten()
    actual = actual.flatten()

    # Determine bin edges based on expected percentiles
    percentiles = np.linspace(0, 100, num_bins + 1)
    bin_edges = np.percentile(expected, percentiles)
    
    # Adjust boundaries to handle duplicate values and avoid bin overlapping
    bin_edges = np.unique(bin_edges)
    if len(bin_edges) < 2:
        # Fallback to linear binning if values are uniform
        bin_edges = np.linspace(np.min(expected), np.max(expected) + 1e-5, num_bins + 1)

    # Calculate frequency counts in each bin
    expected_counts, _ = np.histogram(expected, bins=bin_edges)
    actual_counts, _ = np.histogram(actual, bins=bin_edges)

    # Convert counts to proportions
    expected_pct = expected_counts / len(expected)
    actual_pct = actual_counts / len(actual)

    # Handle zeros to avoid division-by-zero or log-of-zero errors
    eps = 1e-4
    expected_pct = np.where(expected_pct == 0, eps, expected_pct)
    actual_pct = np.where(actual_pct == 0, eps, actual_pct)

    # Normalize again after adding eps
    expected_pct /= np.sum(expected_pct)
    actual_pct /= np.sum(actual_pct)

    # Compute PSI
    psi_value = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
    
    return float(psi_value)

def generate_drifted_data(base_data, drift_severity=0.5):
    """
    Simulates concept drift by shifting features in the transaction data.
    E.g. increasing transaction amount or velocity to simulate active credit fraud waves.
    """
    drifted_data = np.copy(base_data)
    # Features details:
    # 0: Amount, 1: Hour, 2: Velocity, 3: Device Age, 4: New Device, 5: New Beneficiary, 6: Location Anomaly, 7: Account Age
    
    # Shift transaction amounts (feature 0) upwards by drift_severity
    drifted_data[:, 0] = np.clip(drifted_data[:, 0] * (1.0 + drift_severity * 0.4), 0, 1)
    
    # Shift location anomaly rate (feature 6) upwards
    for i in range(len(drifted_data)):
        if np.random.rand() < (drift_severity * 0.25):
            drifted_data[i, 6] = 1.0 # Set location anomaly
            
        # Shift transaction velocity (feature 2)
        drifted_data[i, 2] = np.clip(drifted_data[i, 2] + drift_severity * 0.15, 0, 1)
        
    return drifted_data
