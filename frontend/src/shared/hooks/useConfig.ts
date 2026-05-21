'use client';

import { useEffect, useState } from 'react';
import { http } from '@/shared/lib/http';

interface AppConfig {
  suspension_threshold: number;
}

const DEFAULT_THRESHOLD = 10;

let cachedConfig: AppConfig | null = null;

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(
    cachedConfig ?? { suspension_threshold: DEFAULT_THRESHOLD },
  );

  useEffect(() => {
    if (cachedConfig) return;
    http<AppConfig>('/api/config')
      .then((data) => {
        cachedConfig = data;
        setConfig(data);
      })
      .catch(() => {
        //
      });
  }, []);

  return {
    suspensionThreshold: config.suspension_threshold,
  };
}
