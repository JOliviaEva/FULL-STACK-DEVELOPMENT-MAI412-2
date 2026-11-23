import { listCampuses, listOfficers, listProgrammes } from "../api.js";
import { useAsync } from "./useAsync.js";

const EMPTY = { programmes: [], campuses: [], officers: [] };

// Three tables, three requests at once: the lists behind every dropdown.
export function useLookups() {
  const { data, error, loading, reload } = useAsync(
    async (signal) => {
      const [programmes, campuses, officers] = await Promise.all([listProgrammes(signal), listCampuses(signal), listOfficers(signal)]);
      return { programmes, campuses, officers };
    },
    [],
  );
  return { ...(data ?? EMPTY), ready: Boolean(data), error, loading, reload };
}
