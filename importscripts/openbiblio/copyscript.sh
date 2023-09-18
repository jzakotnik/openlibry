#!/usr/bin/env bash

podman cp ./input/biblio.MYD mysql-server-db:/var/lib/mysql/openbiblio 
podman cp ./input/biblio.MYI  mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_copy.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_copy.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_copy.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_field.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_field.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_field.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_hold.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_hold.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_hold.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_status_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_status_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_status_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_status_hist.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_status_hist.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/biblio_status_hist.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/collection_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/collection_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/collection_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/db.opt mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/material_type_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/material_type_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/material_type_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/mbr_classify_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/mbr_classify_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/mbr_classify_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/member.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/member.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/member.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/member_account.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/member_account.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/member_account.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/session.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/session.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/session.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/settings.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/settings.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/settings.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/staff.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/staff.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/staff.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/state_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/state_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/state_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/theme.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/theme.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/theme.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/transaction_type_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/transaction_type_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/transaction_type_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_block_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_block_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_block_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_indicator_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_indicator_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_indicator_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_subfield_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_subfield_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_subfield_dm.frm mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_tag_dm.MYD mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_tag_dm.MYI mysql-server-db:/var/lib/mysql/openbiblio
podman cp ./input/usmarc_tag_dm.frm mysql-server-db:/var/lib/mysql/openbiblio