# Persistence

`PersistenceStore` namespaces JSON state, validates optional schemas and fails safely when storage is absent, full or corrupt. `frameworkPersistence` uses the `ou:` namespace.

The framework now routes theme, MDI workspace, DataView sorting/width/order, Splitter ratio, and Tabs order/active tab through this store. Persisted components need stable application-provided IDs. Compatibility keys such as `ou:v2:mdi-workspace` are preserved. Old or invalid values fall back to compact defaults and must never prevent the shell from opening.
