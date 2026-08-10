# Async tasks

`AsyncTask<T, Args>` exposes idle, pending, success, error and cancelled snapshots with generation identity and optional progress. Starting a run aborts the previous controller. A late result is accepted only when its generation is still current, preventing Mail A from replacing the inspector after Mail B was selected.

Use `useAsyncTask` inside React compositions and the class directly in services. Pass the supplied `AbortSignal` to underlying APIs. Report loading, progress and error compactly inside the current ToolWindow; do not block the MDI shell or replace it with a full-screen state.
