// Where the Lab 8 console lives in the journal's router.
export const BASE = "/lab-8/app";

export const path = {
  home: BASE,
  applications: `${BASE}/applications`,
  newApplication: `${BASE}/applications/new`,
  application: (id) => `${BASE}/applications/${id}`,
  editApplication: (id) => `${BASE}/applications/${id}/edit`,
  programmes: `${BASE}/programmes`,
  campuses: `${BASE}/campuses`,
  team: `${BASE}/team`,
};

// A link to the applications list with some filters already applied, e.g. ?programmeId=3&status=admitted.
export function applicationsWhere(filters) {
  const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
  const query = params.toString();
  return query ? `${path.applications}?${query}` : path.applications;
}
