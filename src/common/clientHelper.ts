import { lookup } from 'geoip-lite';
import { getCountriesForTimezone } from 'countries-and-timezones';

export const detectCountryViaIP = (ip: string) => {
  const result = '-/-';
  const geo = lookup(ip);
  if (!geo) {
    return result;
  }

  if (geo.country && geo.country != '') {
    return geo.country.toLowerCase();
  }

  const timezone = getCountriesForTimezone(geo.timezone);
  if (!!timezone[0]) {
    return timezone[0].name.toLowerCase() || result;
  }

  return result;
};

export const detectDevice = (userAgent: string, appType: string) => {
  if (appType) {
    return 'mobileApp';
  }

  if (!userAgent) {
    return 'unknown';
  }

  if (/mobile/i.test(userAgent)) {
    return 'webMobile';
  } else if (/tablet/i.test(userAgent)) {
    return 'webTablet';
  }

  return 'webDesktop';
};
