<!---Gruppengrid, Bei Klick auf Button Gruppen in der Kundenuebersicht, landet man hier--->
<cfparam name="form.id_kunde" default="-1">

<cfquery name="q_kundengruppen" datasource="#application.datasource#">
    select
        g.id,
        g.gruppe,
        g.user_vorlage_login_fk,
        g.kunden_fk,
        user_anzahl.*
    from login.gruppen g, lateral (
        select
            count(*) as anzahl_user,
            count(*) filter(where inaktiv) as anzahl_inaktiveuser,
            count(*) filter(where not inaktiv) as anzahl_aktiveuser
        from login.login
        where
            gruppen_fk=g.id
        and login <> ''
        and not user_vorlage
        and not bei_userexport_ignorieren
    ) as user_anzahl
    where g.kunden_fk = <cfqueryparam cfsqltype="cf_sql_integer" value="#form.id_kunde#">
</cfquery>

<cfquery name="q_kunde" datasource="#application.datasource#">
    select 
        login.kunden.kundenname,
        login.kunden.r_hranzeigen
    from login.kunden 
    where login.kunden.id = <cfqueryparam cfsqltype="cf_sql_integer" value="#form.id_kunde#">
</cfquery>

<cfquery name="q_login_adminrecht" datasource="#application.datasource#">
    select admin as adminrecht
    from login.login
    where login = '#session.aktueller_user#'
</cfquery>

<cfoutput>
    <!---Seite Grid Gruppen--->
    <div class="container_element_2_columns" style="align-items: start; padding: 10px 0 20px 0">
        <div class="container_element_2_rows">
            <div class="layout_flex">
                <div class="circle_pagination margin_right_10" style="align-self: baseline; top: 4px; position: relative;" onclick="kunde_aufruf(#form.id_kunde#)">
                    <i class="fa fa-chevron-left" style="font-size: 12px; padding-right: 2px"></i>
                </div>
                <p class="fliesstext_18">
                    <span class="margin_right_10">Gruppen</span>  
                    <div class="circle_productversion margin_right_10" style="background-color: <cfif q_kunde.r_hranzeigen eq 'true'>var(--blueline)<cfelse>var(--redline)</cfif>"></div> 
                    <span class="layout_gruppe_bearbeiten pointer" style="font-weight: 800" onclick="kunde_aufruf(#form.id_kunde#)">
                        #q_kunde.kundenname#
                    </span>
                </p>
            </div>
            <div class="startseite_content_suche_ergebnis_info">
                <div id="prevBtn" class="startseite_content_suche_ergebnis_info__nav_icon" style="margin-right: 5px" onclick="zeigeVorigeSeite('ergebnisGridKundenGruppen')">
                    <span class="fa fa-angle-left"></span> 
                </div>
                <span id="pageIndicator"><b>1</b> - 0 von (0)</span>
                <div id="nextBtn" class="startseite_content_suche_ergebnis_info__nav_icon" style="margin-left: 5px" onclick="zeigeNaechsteSeite('ergebnisGridKundenGruppen')">
                    <span class="fa fa-angle-right"></span> 
                </div>
                <!---Paginierung, bzw Anzahl der Ergebnisse--->
                <div class="startseite_content_suche_ergebnis_info__nav_dropdown input_element" style="padding: 2.5px;">
                    <select id="startseite_content_suche_ergebnis_info__nav_dropdown_content" name="10" class="dropdown_element fliesstext_14 customDropdown padding_right_15">
                        <option value="10">10</option>
                        <option value="30">30</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="container_element_2_rows" style="justify-items: end">
            <cfif q_login_adminrecht.adminrecht eq 'true'>
                <button type="button" class="button fliesstext_14 lyout_flex" style="border: 1px solid var(--gruppen)" onclick="dialog_gruppe_anlegen()">
                    <img src="../images/icon_add_user.png" alt="Icon User hinzufuegen" style="margin-right: 5px">
                    Neue Gruppe
                </button>
            </cfif>
            <div style="float: right">
                <div class="layout_flex_nowrap input_element fliesstext_14" style="padding: 10px 15px; width: 350px; border-radius: 18px;">
                    <i class="fa fa-search" style="padding-right: 10px; float: left; color: var(--dunkles-grau)"></i>
                    <input id="input_gruppe_schnelle_suche" type="text" class="input_element_suche_inlay_grau fliesstext_14" placeholder="Schnell Gruppe suchen" onkeyup="schnelle_suche('input_gruppe_schnelle_suche', 'ergebnisGridKundenGruppen')">
                </div>
            </div>
        </div>
    </div>
    
    <div class="container">
        <div id="ergebnisGridKundenGruppen" class="startseite_content_suche_ergebnis_grid_gruppen">
            <div class="suche_ergebnis_grid_headerrow_gruppen">
                <div class="suche_ergebnis_grid_headeritem" style="background-color: var(--gruppen);" data-index="0">
                    <span style="display: grid; grid-template-rows: auto; padding-right: 5px">
                        <i class="fa fa-caret-up" style="font-size: larger" data-direction="asc"></i>
                        <i class="fa fa-caret-down" style="font-size: larger" data-direction="desc"></i>
                    </span>
                    ID
                </div>
                <div class="suche_ergebnis_grid_headeritem" style="background-color: var(--gruppen);" data-index="1">
                    <span style="display: grid; grid-template-rows: auto; padding-right: 5px">
                        <i class="fa fa-caret-up" style="font-size: larger" data-direction="asc"></i>
                        <i class="fa fa-caret-down" style="font-size: larger" data-direction="desc"></i>
                    </span>
                    Gruppe
                </div>
                <div class="suche_ergebnis_grid_headeritem" style="background-color: var(--gruppen);" data-index="2">
                    <span style="display: grid; grid-template-rows: auto; padding-right: 5px">
                        <i class="fa fa-caret-up" style="font-size: larger" data-direction="asc"></i>
                        <i class="fa fa-caret-down" style="font-size: larger" data-direction="desc"></i>
                    </span>
                    Nutzer
                </div>
                <div class="suche_ergebnis_grid_headeritem" style="background-color: var(--gruppen);" data-index="3">
                    <span style="display: grid; grid-template-rows: auto; padding-right: 5px">
                        <i class="fa fa-caret-up" style="font-size: larger" data-direction="asc"></i>
                        <i class="fa fa-caret-down" style="font-size: larger" data-direction="desc"></i>
                    </span>
                    Aktiv
                </div>
                <div class="suche_ergebnis_grid_headeritem" style="background-color: var(--gruppen);" data-index="4">
                    <span style="display: grid; grid-template-rows: auto; padding-right: 5px">
                        <i class="fa fa-caret-up" style="font-size: larger" data-direction="asc"></i>
                        <i class="fa fa-caret-down" style="font-size: larger" data-direction="desc"></i>
                    </span>
                    Inaktiv
                </div>
            </div>

            <cfloop query="q_kundengruppen">
                <div class="suche_ergebnis_grid_row schnelle_suche_ergebnis_grid_row schnelle_suche_row" data-gruppe="true" id="id_zeile_gruppe_#q_kundengruppen.id#">
                    <div class="suche_ergebnis_grid_item">
                        #q_kundengruppen.id#
                    </div>
                    <div class="suche_ergebnis_grid_item">
                        <div class="icon-container">
                            <span class="layout_gruppe_bearbeiten">
                                <cfif q_login_adminrecht.adminrecht eq 'true'>
                                    <img src='../images/icon_edit_grey.png' alt='Icon Bearbeiten' class="edit-icon" onclick="editGruppenname(this)">
                                </cfif>
                                <span class="edit_gruppename pointer feld_schnelle_suche" onclick="markiereGruppenRow(event, #q_kundengruppen.id#, #q_kundengruppen.id#, #form.id_kunde#)">#q_kundengruppen.gruppe#</span>
                            </span>  
                            <input type="text" class="edit-input" style="display:none;" id="#q_kundengruppen.id#" value="#q_kundengruppen.gruppe#">
                            <div class="icon-wrapper success" style="display:none;" onclick="confirmEditGruppe(this)">
                            <i class="fa fa-check confirm-icon"></i>
                            </div>
                            <div class="icon-wrapper cancel" style="display:none;" onclick="cancelEditGruppe(this)">
                            <i class="fa fa-times cancel-icon"></i>
                            </div>
                        </div>
                    </div>
                    <div class="suche_ergebnis_grid_item">
                        #q_kundengruppen.anzahl_user#
                    </div>
                    <div class="suche_ergebnis_grid_item" data-rowtype="aktiveuser">
                        #q_kundengruppen.anzahl_aktiveuser#
                    </div>
                    <div class="suche_ergebnis_grid_item" data-rowtype="inaktiveuser">  
                        #q_kundengruppen.anzahl_inaktiveuser#
                        
                        <cfif q_login_adminrecht.adminrecht eq 'true'>
                            <cfif q_kundengruppen.anzahl_inaktiveuser eq 0 and q_kundengruppen.anzahl_aktiveuser eq 0>
                                <span class='layout_flex pointer layout_float_right' onclick="dialog_gruppe_loeschen(#q_kundengruppen.id#)">
                                <img src='../images/icon_x_mark.png' alt='Icon entferne Gruppe' style='padding-right: 5px'>
                                <span style="padding-top:2px">Gruppe löschen</span>
                            </span>
                            </cfif>
                        </cfif>
                    </div>
                </div>
            </cfloop>
        </div>
    </div>

    <div id="uservorlage_liste_id"> 
    </div>
    
    <cfset form.id = form.id_kunde> <!--- in dialog_gruppe.cfm wird form.id als kunden_fk benutzt --->
    <cfinclude template="dialoge_gruppe.cfm">
    
    <script>
        gridInitialisierung('ergebnisGridKundenGruppen');
        // Initiale Anzeige
        updatePagination();
        //haengeGruppeLoeschenRan();
    </script>
</cfoutput>