"use client";

import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { GeoJSONCollection } from "@/lib/geojson-data";
import { Search, X, MapPin, Loader2 } from "lucide-react";

interface MapContentProps {
  geoJsonData: GeoJSONCollection;
  onSelectFeature: (id: string) => void;
}

// Search Result Interface
interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  importance: number;
}

// Search Control Component
function SearchControl() {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function using Nominatim (OpenStreetMap)
  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setShowResults(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data: SearchResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location selection
  const handleSelectLocation = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    // Remove previous marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add new marker
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    markerRef.current = L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(`<strong>${result.display_name}</strong>`)
      .openPopup();

    // Fly to location
    map.flyTo([lat, lng], 16, { duration: 1.5 });

    setShowResults(false);
    setQuery(result.display_name.split(",")[0]);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  return (
    <div
      ref={searchRef}
      className="leaflet-control"
      style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        right: "12px",
        zIndex: 1000,
        maxWidth: "calc(100% - 24px)",
      }}
    >
      <div className="flex flex-col w-full sm:w-[320px]">
        {/* Search Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "white",
            borderRadius: showResults && results.length > 0 ? "12px 12px 0 0" : "12px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            padding: "2px",
            border: "2px solid #e5e7eb",
          }}
        >
          <button
            onClick={handleSearch}
            style={{
              padding: "8px 10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              color: "#059669",
            }}
          >
            {isSearching ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Search size={18} />
            )}
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Cari lokasi..."
            style={{
              flex: 1,
              padding: "10px 8px",
              border: "none",
              outline: "none",
              fontSize: "14px",
              background: "transparent",
              color: "#1f2937",
            }}
          />
          {query && (
            <button
              onClick={clearSearch}
              style={{
                padding: "8px 10px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#9ca3af",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results */}
        {showResults && (
          <div
            style={{
              background: "white",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              overflow: "hidden",
              borderTop: "1px solid #e5e7eb",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {isSearching ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                <p className="text-sm">Mencari lokasi...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectLocation(result)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    borderBottom: index < results.length - 1 ? "1px solid #f3f4f6" : "none",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <MapPin size={18} style={{ color: "#059669", marginTop: "2px", flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#374151", lineHeight: "1.4" }}>
                    {result.display_name}
                  </span>
                </button>
              ))
            ) : query && !isSearching ? (
              <div style={{ padding: "16px", textAlign: "center", color: "#6b7280" }}>
                <p className="text-sm">Lokasi tidak ditemukan</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// GeoJSON Layer Component
function GeoJSONLayer({
  data,
  onSelectFeature,
}: {
  data: GeoJSONCollection;
  onSelectFeature: (id: string) => void;
}) {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();

  useEffect(() => {
    if (geoJsonRef.current) {
      map.removeLayer(geoJsonRef.current);
    }

    const geoJsonLayer = L.geoJSON(data as any, {
      style: (feature: any) => {
        const status = feature?.properties?.status;
        return {
          fillColor: status === "Available" ? "#10b981" : "#ef4444",
          weight: 3,
          opacity: 1,
          color: "#ffffff",
          dashArray: "",
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature: any, layer) => {
        const props = feature.properties;

        // Hover effects
        layer.on({
          mouseover: (e: any) => {
            const layer = e.target;
            layer.setStyle({
              weight: 4,
              fillOpacity: 0.9,
              color: "#fbbf24",
            });
            layer.bringToFront();
          },
          mouseout: (e: any) => {
            geoJsonLayer.resetStyle(e.target);
          },
        });

        // Popup content removed in favor of side panel but keeping for desktop click fallback if needed
        layer.on("click", (e) => {
          onSelectFeature(props.id);
        });
      },
    });

    geoJsonRef.current = geoJsonLayer;
    geoJsonLayer.addTo(map);

    // Fit bounds to GeoJSON
    try {
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [80, 80] });
      }
    } catch (e) {
      // Fallback center - Bojonegoro, Jawa Timur (lokasi Perhutani)
      map.setView([-7.15, 111.88], 13);
    }

    return () => {
      if (geoJsonRef.current) {
        map.removeLayer(geoJsonRef.current);
      }
    };
  }, [data, map, onSelectFeature]);

  return null;
}

export default function MapContent({
  geoJsonData,
  onSelectFeature,
}: MapContentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-emerald-700 font-medium">Memuat peta satelit...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
          border-radius: 12px !important;
          overflow: hidden;
          margin-bottom: 24px !important;
          margin-right: 12px !important;
        }
        .leaflet-control-zoom a {
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          color: #059669 !important;
          background: white !important;
          border-bottom: 1px solid #e5e7eb !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f0fdf4 !important;
        }
        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <MapContainer
        center={[-7.026, 111.514]}
        zoom={17}
        style={{ width: "100%", height: "100vh" }}
        className="z-0"
        zoomControl={false} // Disable default and add custom for mobile placement
      >
        {/* Google Satellite Layer */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
          maxZoom={21}
        />

        {/* Google Hybrid Layer (Labels on Satellite) */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
          maxZoom={21}
        />

        {/* Custom Zoom Control Placement */}
        <ZoomControl position="bottomright" />

        {/* Search Control */}
        <SearchControl />

        {/* GeoJSON Data Layer */}
        <GeoJSONLayer data={geoJsonData} onSelectFeature={onSelectFeature} />
      </MapContainer>
    </>
  );
}

// Fix for leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});
