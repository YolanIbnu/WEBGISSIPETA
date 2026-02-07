"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Real-time Connection Status Indicator
 * Shows:
 * - Online/Offline status
 * - Realtime connection status
 * - Last sync time
 * - Manual refresh button
 */
export function ConnectionStatus({ onRefresh }: { onRefresh?: () => void }) {
    const [isOnline, setIsOnline] = useState(true);
    const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        // Monitor online/offline
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Monitor Supabase Realtime connection
        const channel = supabase.channel('connection_monitor');

        channel.subscribe((status) => {
            console.log('📡 Realtime connection status:', status);

            if (status === 'SUBSCRIBED') {
                setRealtimeStatus('connected');
                setLastSync(new Date());
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                setRealtimeStatus('disconnected');
            } else {
                setRealtimeStatus('connecting');
            }
        });

        // Update last sync time periodically
        const syncInterval = setInterval(() => {
            const now = new Date();
            const diff = now.getTime() - lastSync.getTime();

            // If more than 2 minutes since last sync, mark as potentially disconnected
            if (diff > 2 * 60 * 1000 && realtimeStatus !== 'disconnected') {
                setRealtimeStatus('disconnected');
            }
        }, 10000); // Check every 10 seconds

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            channel.unsubscribe();
            clearInterval(syncInterval);
        };
    }, [lastSync, realtimeStatus]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setLastSync(new Date());
        if (onRefresh) {
            await onRefresh();
        }
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const getStatusColor = () => {
        if (!isOnline) return 'bg-red-500';
        if (realtimeStatus === 'connected') return 'bg-green-500';
        if (realtimeStatus === 'connecting') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStatusText = () => {
        if (!isOnline) return 'Offline';
        if (realtimeStatus === 'connected') return 'Live';
        if (realtimeStatus === 'connecting') return 'Connecting...';
        return 'Disconnected';
    };

    const getTimeSinceSync = () => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSync.getTime()) / 1000);

        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return `${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            {/* Status Indicator */}
            <div className="flex items-center gap-1.5">
                {isOnline ? (
                    <Wifi className={`h-4 w-4 ${realtimeStatus === 'connected' ? 'text-green-600' : 'text-yellow-600'}`} />
                ) : (
                    <WifiOff className="h-4 w-4 text-red-600" />
                )}

                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
                    <span className="text-slate-600 font-medium">{getStatusText()}</span>
                </div>
            </div>

            {/* Last Sync Time */}
            <span className="text-slate-400 text-xs">• {getTimeSinceSync()}</span>

            {/* Manual Refresh Button */}
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-1 p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
                title="Refresh data"
            >
                <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
        </div>
    );
}
