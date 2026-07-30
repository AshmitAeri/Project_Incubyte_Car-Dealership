import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Star, Wrench, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { serviceCenterService } from '../services/serviceCenterService';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={`text-sm ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>★</span>
    ))}
    <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
  </div>
);

const ServiceCentersSection = ({ brand }) => {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!brand) return;
    setLoading(true);
    serviceCenterService
      .getByBrand(brand)
      .then((res) => setCenters(res.data.data))
      .catch(() => setCenters([]))
      .finally(() => setLoading(false));
  }, [brand]);

  if (loading) {
    return (
      <div className="mt-8 rounded-3xl border border-gray-100 dark:border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-primary-500 animate-pulse" />
          <span className="font-bold text-gray-900 dark:text-white">Nearby Service Centers</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!centers.length) return null;

  const displayed = showAll ? centers : centers.slice(0, 4);

  return (
    <div className="mt-8">
      {/* Section Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-white/5 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/8 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 dark:text-white">Authorized {brand} Service Centers</p>
            <p className="text-sm text-gray-500">{centers.length} locations found</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          {displayed.map((center) => (
            <div
              key={center._id}
              className="card p-4 hover:shadow-md transition-shadow border border-gray-100 dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{center.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />{center.city}, {center.state}
                  </p>
                </div>
                <StarRating rating={center.rating} />
              </div>

              <p className="text-xs text-gray-400 mb-3 leading-relaxed">{center.address}</p>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                  <a href={`tel:${center.phone}`} className="hover:text-primary-600 transition-colors">{center.phone}</a>
                </div>
                {center.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                    <span>{center.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                  <span>{center.timings}</span>
                </div>
              </div>

              {center.services?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {center.services.map((svc) => (
                    <span key={svc} className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full">
                      {svc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {expanded && centers.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 w-full py-2.5 text-sm text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-all"
        >
          {showAll ? 'Show Less' : `Show ${centers.length - 4} More Centers`}
        </button>
      )}
    </div>
  );
};

export default ServiceCentersSection;
