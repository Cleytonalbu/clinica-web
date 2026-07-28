import { useEffect, useState } from "react";

import type {
  DashboardData,
} from "../services/dashboard";

import {
  getDashboardData,
} from "../services/dashboard";

export function useDashboard() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await getDashboardData();

        if (mounted) {
          setDashboard(data);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    stats: dashboard?.stats,
    agenda: dashboard?.agenda ?? [],
    proximosAtendimentos:
      dashboard?.proximosAtendimentos ?? [],
    loading,
  };
}