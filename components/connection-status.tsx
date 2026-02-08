"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

/**
 * Simplified Real-time Connection Status Indicator
 * Optimized to prevent glitching and excessive re-renders
 */
export function ConnectionStatus({ onRefresh }: { onRefresh?: () => void }) {
    const [isOnline, setIsOnline] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        // Set initial online status
        setIsOnline(navigator.onLine);

        // Monitor online/offline
        const handleOnline = () => {
            console.log("🌐 Network: Online");
            setIsOnline(true);
        };

        const handleOffline = () => {
            console.log("📵 Network: Offline");
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        console.log("🔄 Manual refresh triggered");

        try {
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error("❌ Refresh failed:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 1000);
        }
    }, [isRefreshing, onRefresh]);

    const statusIcon = useMemo(() => {
        if (isOnline) {
            return <Wifi className="h-4 w-4 text-emerald-400" />;
        }
        return <WifiOff className="h-4 w-4 text-red-400" />;
    }, [isOnline]);

    const statusDot = useMemo(() => {
        const dotColor = isOnline ? 'bg-emerald-400' : 'bg-red-400';
        return <div className={`w-2 h-2 rounded-full ${dotColor} ${isOnline ? 'animate-pulse' : ''}`} />;
    }, [isOnline]);

    const statusText = useMemo(() => {
        return isOnline ? 'Live' : 'Offline';
    }, [isOnline]);

    return (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-emerald-900/50 rounded-lg border border-emerald-800">
            {/* Status Icon */}
            {statusIcon}

            {/* Status Dot & Text */}
            <div className="flex items-center gap-1.5">
                {statusDot}
                <span className="text-emerald-100 font-medium text-xs">{statusText}</span>
            </div>

            {/* Manual Refresh Button */}
            <button
                onClick={handleRefresh}
                disabled={isRefreshing || !isOnline}
                className="ml-auto p-1 hover:bg-emerald-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isOnline ? "Refresh data" : "No internet connection"}
                type="button"
            >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-300 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
}
