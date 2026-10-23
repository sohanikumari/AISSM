import { Location, EtaSource } from '../../../shared/src/types';
import { SYSTEM_DEFAULTS } from '../../../shared/src/constants';

export interface RouteEstimate {
  distanceKm: number;
  etaMinutes: number;
  etaSource: EtaSource;
}

export function haversineDistanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export class MockRouteEstimator {
  estimate(from: Location, to: Location): RouteEstimate {
    const rawDist = haversineDistanceKm(from, to);
    const roadDist = rawDist * SYSTEM_DEFAULTS.MOCK_DETOUR_FACTOR;
    const drivingMinutes = (roadDist / SYSTEM_DEFAULTS.MOCK_AVERAGE_SPEED_KMH) * 60;
    const totalMinutes = Math.ceil(drivingMinutes + SYSTEM_DEFAULTS.MOCK_HANDLING_MINUTES);

    return {
      distanceKm: Math.round(roadDist * 10) / 10,
      etaMinutes: Math.max(5, totalMinutes),
      etaSource: 'mock',
    };
  }
}

export const routeEstimator = new MockRouteEstimator();
