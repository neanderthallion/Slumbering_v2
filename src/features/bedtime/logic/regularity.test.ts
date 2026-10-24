import { computeRegularity } from './regularity';
import { SeriesPoint } from './series';

function series(values: (number | null)[]): SeriesPoint[] {
  return values.map((minutes, i) => ({ date: `d${i}`, minutes }));
}

describe('computeRegularity', () => {
  it('is null when fewer than 2 confirmed points exist', () => {
    expect(computeRegularity(series([100])).band).toBeNull();
    expect(computeRegularity(series([100, null])).band).toBeNull();
  });

  it('labels verySteady at or under 30 minutes SD', () => {
    // constant series -> SD 0
    expect(computeRegularity(series([600, 600, 600])).band).toBe('verySteady');
  });

  it('labels fairlySteady between 30 and 60 minutes SD', () => {
    const result = computeRegularity(series([540, 600, 660])); // SD = 49
    expect(result.sdMinutes).toBe(49);
    expect(result.band).toBe('fairlySteady');
  });

  it('labels aBitVariable between 60 and 90 minutes SD', () => {
    const result = computeRegularity(series([520, 600, 680])); // SD ~65
    expect(result.sdMinutes).toBeGreaterThan(60);
    expect(result.sdMinutes).toBeLessThanOrEqual(90);
    expect(result.band).toBe('aBitVariable');
  });

  it('labels quiteVariable above 90 minutes SD', () => {
    const result = computeRegularity(series([300, 600, 900]));
    expect(result.sdMinutes).toBeGreaterThan(90);
    expect(result.band).toBe('quiteVariable');
  });
});
