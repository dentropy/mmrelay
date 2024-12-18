<!--

classDiagram
class alembic_version{
 *VARCHAR<32> version_num NOT NULL
}
class auth{
 *TEXT pubkey NOT NULL
   DATETIME created
   TEXT roles
}
class events{
 *BLOB id NOT NULL
   TEXT content
   INTEGER created_at
   INTEGER kind
   BLOB pubkey
   BLOB sig
   JSON tags
}
class identity{
 *TEXT identifier NOT NULL
   TEXT pubkey
   JSON relays
}
class tags{
 BLOB id
   TEXT name
   TEXT value
}
class verification{
 *INTEGER id NOT NULL
   TIMESTAMP failed_at
   TEXT identifier
   BLOB metadata_id
   TIMESTAMP verified_at
}
events "0..1" -- "0..n" tags
events "0..1" -- "0..n" verification

-->
![](https://mermaid.ink/img/Y2xhc3NEaWFncmFtCmNsYXNzIGFsZW1iaWNfdmVyc2lvbnsKICpWQVJDSEFSPDMyPiB2ZXJzaW9uX251bSBOT1QgTlVMTAp9CmNsYXNzIGF1dGh7CiAqVEVYVCBwdWJrZXkgTk9UIE5VTEwKICAgREFURVRJTUUgY3JlYXRlZAogICBURVhUIHJvbGVzCn0KY2xhc3MgZXZlbnRzewogKkJMT0IgaWQgTk9UIE5VTEwKICAgVEVYVCBjb250ZW50CiAgIElOVEVHRVIgY3JlYXRlZF9hdAogICBJTlRFR0VSIGtpbmQKICAgQkxPQiBwdWJrZXkKICAgQkxPQiBzaWcKICAgSlNPTiB0YWdzCn0KY2xhc3MgaWRlbnRpdHl7CiAqVEVYVCBpZGVudGlmaWVyIE5PVCBOVUxMCiAgIFRFWFQgcHVia2V5CiAgIEpTT04gcmVsYXlzCn0KY2xhc3MgdGFnc3sKIEJMT0IgaWQKICAgVEVYVCBuYW1lCiAgIFRFWFQgdmFsdWUKfQpjbGFzcyB2ZXJpZmljYXRpb257CiAqSU5URUdFUiBpZCBOT1QgTlVMTAogICBUSU1FU1RBTVAgZmFpbGVkX2F0CiAgIFRFWFQgaWRlbnRpZmllcgogICBCTE9CIG1ldGFkYXRhX2lkCiAgIFRJTUVTVEFNUCB2ZXJpZmllZF9hdAp9CmV2ZW50cyAiMC4uMSIgLS0gIjAuLm4iIHRhZ3MKZXZlbnRzICIwLi4xIiAtLSAiMC4ubiIgdmVyaWZpY2F0aW9u)
