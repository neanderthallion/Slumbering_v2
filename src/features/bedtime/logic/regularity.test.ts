import { computeRegularity } from './regularity';
import { SeriesPoint } from './series';

function series(values: (number | null)[]): SeriesPoint[] {
  return values.map((minutes, i) => ({ date: `d${i}`, minutes }));
}

describe('computeRegularity', () => {
  it('is null when fewer than 2 confirmed points exist', () => {
    expect(computeRegularity(series([100])).label).toBeNull();
    expect(computeRegularity(series([100, null])).label).toBeNull();
  });

  it('labels High Regularity at or under 30 minutes SD', () => {
    // constant series -> SD 0
    expect(computeRegularity(series([600, 600, 600])).label).toBe('High Regularity');
  });

  it('labels Moderate Regularity between 30 and 60 minutes SD', () => {
    const result = computeRegularity(series([540, 600, 660])); // SD = 49
    expect(result.sdMinutes).toBe(49);
    expect(result.label).toBe('Moderate Regularity');
  });

  it('labels Irregular between 60 and 90 minutes SD', () => {
    const result = computeRegularity(series([520, 600, 680])); // SD ~65
    expect(result.sdMinutes).toBeGreaterThan(60);
    expect(result.sdMinutes).toBeLessThanOrEqual(90);
    expect(result.label).toBe('Irregular');
  });

  it('labels Severely Irregular above 90 minutes SD', () => {
    const result = computeRegularity(series([300, 600, 900]));
    expect(result.sdMinutes).toBeGreaterThan(90);
    expect(result.label).toBe('Severely Irregular');
  });
});
