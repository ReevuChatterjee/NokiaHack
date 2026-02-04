
import pandas as pd
import numpy as np

# Configuration
NUM_LINKS = 5
DURATION_SECONDS = 600  # 10 minutes
LINKS = [f'Link_Test_{i}' for i in range(1, NUM_LINKS + 1)]

# Generate Time Series
time_seconds = np.arange(0, DURATION_SECONDS, 0.1) # 100ms intervals
data = []

for link in LINKS:
    # Randomize traffic pattern for each link
    base_load = np.random.uniform(2, 5)
    amplitude = np.random.uniform(1, 3)
    frequency = np.random.uniform(0.01, 0.05)
    phase = np.random.uniform(0, 2 * np.pi)
    noise_level = 0.2
    
    # Generate Traffic (Sine wave + Noise)
    traffic = base_load + amplitude * np.sin(2 * np.pi * frequency * time_seconds + phase)
    traffic += np.random.normal(0, noise_level, len(time_seconds))
    traffic = np.maximum(traffic, 0) # Ensure non-negative
    
    # Burstiness (Random spikes)
    if np.random.rand() > 0.5:
        spike_indices = np.random.choice(len(time_seconds), size=int(len(time_seconds) * 0.01), replace=False)
        traffic[spike_indices] *= np.random.uniform(1.5, 3.0)

    for t, val in zip(time_seconds, traffic):
        data.append({
            'time_seconds': round(t, 2),
            'link_id': link,
            'aggregated_gbps': round(val, 4)
        })

# Create DataFrame
df = pd.DataFrame(data)

# Save to CSV
# Save to CSV
output_path = r'd:\Project2\artifacts\link_traffic_timeseries.csv'
df.to_csv(output_path, index=False)

df.to_csv(output_path, index=False)

print(f"Mock dataset generated at: {output_path}")

# Generate Capacity Summary
print("Generating capacity summary...")
capacity_stats = df.groupby('link_id')['aggregated_gbps'].agg(['mean', 'max', lambda x: x.quantile(0.95)]).reset_index()
capacity_stats.columns = ['link_id', 'avg_gbps', 'peak_gbps', 'p95_gbps']

def calc_buffer(row):
    burstiness = row['peak_gbps'] / (row['avg_gbps'] + 0.001)
    savings_factor = 0.2 if burstiness > 1.5 else 0.05
    return row['peak_gbps'] * (1 - savings_factor)

capacity_stats['capacity_no_buffer_gbps'] = capacity_stats['peak_gbps'] * 1.1 # 10% headroom
capacity_stats['capacity_with_buffer_gbps'] = capacity_stats.apply(calc_buffer, axis=1) * 1.1

capacity_output_path = r'd:\Project2\artifacts\link_capacity_summary.csv'
capacity_stats.to_csv(capacity_output_path, index=False)
print(f"Capacity summary generated at: {capacity_output_path}")

print(f"Total Rows: {len(df)}")
print(f"Links: {LINKS}")
