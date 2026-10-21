'use client';

import React from 'react';
import { MapPin, Sparkles, ChevronRight, Truck } from 'lucide-react';
import type { WasteMarker } from '.';

interface NearbyReportCardProps {
  marker: WasteMarker;
  onClick: () => void;
  isSelected?: boolean;
}

export function NearbyReportCard({ marker, onClick, isSelected = false }: NearbyReportCardProps) {
  const thumbnail = marker.imageUrls?.[0] || '/images/template-image.png';

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`group flex items-start gap-3 p-3 rounded-2xl transition-all text-left cursor-pointer ${
        isSelected
          ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-sm'
          : 'bg-white dark:bg-slate-850/90 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200/60 dark:border-slate-700/60">
        <img
          src={thumbnail}
          alt={marker.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/template-image.png';
          }}
        />
        {marker.hasCampaign && (
          <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" title="Ada Kampanye Bersih" />
        )}
      </div>

      {/* Info Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {marker.title}
          </h4>
          <span className="shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/60">
            <MapPin size={10} />
            <span>{marker.distance}</span>
          </span>
        </div>

        {/* Location & Volume Info */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="font-medium text-slate-700 dark:text-slate-300">{marker.location}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Truck size={11} className="text-slate-400" />
            <span>{marker.amount}</span>
          </span>
        </div>

        {/* Badges / Campaign Indicator */}
        <div className="flex items-center justify-between gap-2">
          {marker.hasCampaign ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800/70">
              <Sparkles size={10} className="text-amber-500" />
              <span>Ada Aksi Bersih</span>
            </span>
          ) : marker.notes ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate max-w-[210px]">
              "{marker.notes}"
            </p>
          ) : (
            <span className="text-[10px] text-slate-400">Tervalidasi DLHK Sleman</span>
          )}

          <ChevronRight size={14} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default NearbyReportCard;
