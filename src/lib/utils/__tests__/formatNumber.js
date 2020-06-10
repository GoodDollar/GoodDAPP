import { formatWithSIPrefix } from '../formatNumber'

describe('Number formatting test', () => {
  const fixture = {
    0: '0',
    1: '1',
    11: '11',
    99: '99',
    999: '999',
    1000: '1K',
    1100: '1.1K',
    1120: '1.1K',
    1150: '1.2K',
    9900: '9.9K',
    10000: '10K',
    11100: '11.1K',
    11110: '11.1K',
    11150: '11.2K',
    99000: '99K',
    99900: '99.9K',
    100000: '100K',
    110000: '110K',
    115000: '115K',
    115500: '116K',
    999000: '999K',
    999500: '1M',
    1000000: '1M',
    1100000: '1.1M',
    1110000: '1.1M',
    1150000: '1.2M',
    10000000: '10M',
    10100000: '10.1M',
    10110000: '10.1M',
    10150000: '10.2M',
    100000000: '100M',
    110000000: '110M',
    115000000: '115M',
    115500000: '116M',
    999000000: '999M',
  }

  it('should successfully transform all of the numbers to be with SI prefixes', () => {
    for (let [number, formatted] of Object.entries(fixture)) {
      expect(formatWithSIPrefix(number)).toBe(formatted)
    }
  })
})
