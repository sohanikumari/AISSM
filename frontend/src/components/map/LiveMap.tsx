import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Donation, ReceivingSite, DeliveryTask } from '../../api/types';
import { StatusBadge } from '../common/StatusBadge';
import { UrgencyBadge } from '../common/UrgencyBadge';
import { MapPin, Building2, Package, List } from 'lucide-react';

// Fix Leaflet default icon path issues in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LiveMapProps {
  donations?: Donation[];
  sites?: ReceivingSite[];
  tasks?: DeliveryTask[];
}

export const LiveMap: React.FC<LiveMapProps> = ({
  donations = [],
  sites = [],
  tasks = [],
}) => {
  const [showList, setShowList] = useState(false);

  // Center coordinate around Delhi NCR (PRD baseline)
  const defaultCenter: [number, number] = [28.6139, 77.209];

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
      {/* Map Header Toolbar */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-white/90 dark:bg-[#161C23]/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-semibold">
        <button
          onClick={() => setShowList(!showList)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
        >
          <List className="w-3.5 h-3.5" />
          {showList ? 'Show Map' : 'Accessible List View'}
        </button>
      </div>

      {showList ? (
        <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#161C23] space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Accessible Map Locations List</h3>
          
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">Shelter Sites</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sites.map((s) => (
                <div key={s.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.address}</div>
                  <div className="mt-1"><StatusBadge status={s.status} /></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">Active Pickups</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {donations.map((d) => (
                <div key={d.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg">
                  <div className="font-semibold text-sm">{d.description}</div>
                  <div className="text-xs text-slate-500">{d.pickup.address}</div>
                  <div className="mt-1 flex gap-2">
                    <StatusBadge status={d.status} />
                    <UrgencyBadge expiryUtc={d.expiryUtc} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <MapContainer center={defaultCenter} zoom={12} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Receiving Site Markers */}
          {sites.map((site) => (
            <Marker key={site.id} position={[site.lat, site.lng]}>
              <Popup>
                <div className="p-1 space-y-1">
                  <div className="font-bold text-sm text-slate-900">{site.name}</div>
                  <div className="text-xs text-slate-500">{site.address}</div>
                  <div className="pt-1"><StatusBadge status={site.status} /></div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Donation Pickup Markers */}
          {donations.map((donation) => (
            <Marker key={donation.id} position={[donation.pickup.lat, donation.pickup.lng]}>
              <Popup>
                <div className="p-1 space-y-1">
                  <div className="font-bold text-sm text-slate-900">{donation.donorName}</div>
                  <div className="text-xs font-semibold text-teal-700">{donation.quantity} {donation.unit} ({donation.category})</div>
                  <div className="text-xs text-slate-500">{donation.pickup.address}</div>
                  <div className="pt-1 flex gap-1">
                    <StatusBadge status={donation.status} />
                    <UrgencyBadge expiryUtc={donation.expiryUtc} />
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* In-Transit Delivery Polylines */}
          {tasks
            .filter((t) => ['PICKED_UP', 'IN_TRANSIT', 'REROUTE_PROPOSED'].includes(t.status))
            .map((task) => (
              <Polyline
                key={task.id}
                positions={[
                  [task.pickupLocation.lat, task.pickupLocation.lng],
                  [task.destinationLocation.lat, task.destinationLocation.lng],
                ]}
                color={task.status === 'REROUTE_PROPOSED' ? '#D97706' : '#0F766E'}
                dashArray={task.status === 'REROUTE_PROPOSED' ? '5, 10' : undefined}
                weight={3}
              />
            ))}
        </MapContainer>
      )}
    </div>
  );
};
