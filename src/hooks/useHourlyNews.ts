'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DisplayArticle } from '@/lib/stockNewsService';
import { generateHourlyNewsFeed, HourlyUpdateMeta } from '@/lib/hourlyNewsEngine';
import { bloombergAudio } from '@/lib/bloombergAudio';

export interface UseHourlyNewsReturn {
  articles: DisplayArticle[];
  meta: HourlyUpdateMeta;
  countdown: string; // e.g. "54:32"
  secondsRemaining: number;
  isRefreshing: boolean;
  hasNewStories: boolean;
  refreshNow: () => void;
  dismissNewBadge: () => void;
}

export function useHourlyNews(): UseHourlyNewsReturn {
  const [data, setData] = useState<{ articles: DisplayArticle[]; meta: HourlyUpdateMeta }>(() =>
    generateHourlyNewsFeed()
  );
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => data.meta.intervalSeconds);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasNewStories, setHasNewStories] = useState(false);
  const previousHourRef = useRef<number>(data.meta.cycleHour);

  // Manual or hourly triggered refresh
  const refreshNow = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // First attempt to call the API route, fallback to direct engine
      const res = await fetch('/api/news/hourly');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.articles)) {
          setData({
            articles: json.articles,
            meta: json.meta,
          });
          setSecondsRemaining(json.meta.intervalSeconds || 3600);
          setHasNewStories(true);
          bloombergAudio.playFlashNewsAlert();
          previousHourRef.current = json.meta.cycleHour;
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Direct local computation fallback
    const fresh = generateHourlyNewsFeed();
    setData(fresh);
    setSecondsRemaining(fresh.meta.intervalSeconds);
    setHasNewStories(true);
    bloombergAudio.playFlashNewsAlert();
    previousHourRef.current = fresh.meta.cycleHour;
    setTimeout(() => setIsRefreshing(false), 400);
  }, []);

  // Fetch immediately on mount to grab live crawled articles
  useEffect(() => {
    refreshNow();
  }, [refreshNow]);

  const dismissNewBadge = useCallback(() => {
    setHasNewStories(false);
  }, []);

  // 1-second interval for countdown timer and hourly transition detection
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // 1 hour elapsed! Trigger automatic hourly update
          refreshNow();
          return 3600;
        }
        return prev - 1;
      });

      // Also check if clock hour has changed
      const currentH = new Date().getHours();
      if (currentH !== previousHourRef.current) {
        refreshNow();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshNow]);

  // Format seconds into MM:SS or HH:MM:SS
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return {
    articles: data.articles,
    meta: data.meta,
    countdown: formatCountdown(secondsRemaining),
    secondsRemaining,
    isRefreshing,
    hasNewStories,
    refreshNow,
    dismissNewBadge,
  };
}
