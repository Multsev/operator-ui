# Data sources

`DataSource<T>` is a deliberately small read-first boundary:

- `load(query?, signal?)` returns `{items, total}`;
- optional `refresh`, `subscribe`, and `dispose` add only capabilities the source has;
- `DataQuery` carries text, paging and a simple sort descriptor.

REST, Jira, IMAP, CalDAV, SQL, filesystem and local adapters can implement it without pretending to be an ORM. Mutation belongs to application services/commands. `InMemoryDataSource` is the test and demo implementation. Views receive returned rows; background work stays outside rendering.
