<!--

classDiagram
class events{
 TEXT content
   DATETIME created_at
   TEXT id NOT NULL
   INTEGER kind NOT NULL
   TEXT pubkey NOT NULL
   TEXT sig NOT NULL
   TEXT tags
}
class events_fts_config{
 *NULL k NOT NULL
   NULL v
}
class events_fts_data{
 *INTEGER id
   BLOB block
}
class events_fts_docsize{
 *INTEGER id
   INTEGER origin
   BLOB sz
}
class events_fts_idx{
 *NULL segid NOT NULL
   *NULL term NOT NULL
   NULL pgno
}
class tags_index{
 INTEGER fid NOT NULL
   TEXT value NOT NULL
}


-->
![](https://mermaid.ink/img/Y2xhc3NEaWFncmFtCmNsYXNzIGV2ZW50c3sKIFRFWFQgY29udGVudAogICBEQVRFVElNRSBjcmVhdGVkX2F0CiAgIFRFWFQgaWQgTk9UIE5VTEwKICAgSU5URUdFUiBraW5kIE5PVCBOVUxMCiAgIFRFWFQgcHVia2V5IE5PVCBOVUxMCiAgIFRFWFQgc2lnIE5PVCBOVUxMCiAgIFRFWFQgdGFncwp9CmNsYXNzIGV2ZW50c19mdHNfY29uZmlnewogKk5VTEwgayBOT1QgTlVMTAogICBOVUxMIHYKfQpjbGFzcyBldmVudHNfZnRzX2RhdGF7CiAqSU5URUdFUiBpZAogICBCTE9CIGJsb2NrCn0KY2xhc3MgZXZlbnRzX2Z0c19kb2NzaXplewogKklOVEVHRVIgaWQKICAgSU5URUdFUiBvcmlnaW4KICAgQkxPQiBzegp9CmNsYXNzIGV2ZW50c19mdHNfaWR4ewogKk5VTEwgc2VnaWQgTk9UIE5VTEwKICAgKk5VTEwgdGVybSBOT1QgTlVMTAogICBOVUxMIHBnbm8KfQpjbGFzcyB0YWdzX2luZGV4ewogSU5URUdFUiBmaWQgTk9UIE5VTEwKICAgVEVYVCB2YWx1ZSBOT1QgTlVMTAp9Cg==)
