<cfcomponent>
    <cffunction name="getAllContainerAndElementData" access="remote" returnformat="plain">
        <cfargument name="tab" default="" />
        <cfargument name="type" default="" />
        <cfargument name="id" default="" />

        <cfset tab = arguments.tab>
        <cfif tab eq 'Maerkte'>
            <cfset tab = 'Märkte'>
        </cfif>

        <cfquery name="qContainers" datasource="#application.datasource#">
            SELECT 
                con.id,
                con.sortierung,
                con.label,
                con.tab_fk,
                con.reiter_fk,
                (select label from zugangsverwaltung.reiter reit where reit.id = con.reiter_fk) as reiter_label,
                case when lower(t.label) = 'märkte' then 'Maerkte' else t.label end as tab_label
            FROM 
                zugangsverwaltung.tab t
            JOIN 
                zugangsverwaltung.container con ON con.tab_fk = t.id

            where lower(t.label) = lower(<cfqueryparam value="#tab#" cfsqltype="cf_sql_varchar">)
                and t.type = '#arguments.type#'
            order by con.sortierung    
        </cfquery>

        <cfquery name="qCategories" datasource="#application.datasource#">
            SELECT 
                c.id,
                c.sortierung,
                c.label,
                c.container_fk
            FROM 
                zugangsverwaltung.tab t
            JOIN 
                zugangsverwaltung.container con ON con.tab_fk = t.id
            JOIN 
                zugangsverwaltung.category c ON c.container_fk = con.id
            where lower(t.label) = lower(<cfqueryparam value="#tab#" cfsqltype="cf_sql_varchar">)
                and t.type = '#arguments.type#'
            order by c.sortierung
        </cfquery>

        <cfquery name="qElements" datasource="#application.datasource#">
            <cfif StructKeyExists(arguments, 'user_fk')>
                with kunden_info as (
                    select kunden_fk
                    from login.login l
                    where l.id = <cfqueryparam cfsqltype="cf_sql_integer" value="#arguments.user_fk#">
                    limit 1
                )
            </cfif>
            SELECT 
                e.id,
                e.src_columnname,
                e.label,
                e.element_type,
                e.default_wert,
                e.regex,
                e.category_fk,
                e.src_table,
                case when e.auswahl_sql is not null then
                    zugangsverwaltung.execute_query(
                            e.auswahl_sql
                            <cfif structKeyExists(arguments, 'kunden_fk')>
                            , Cast('{"kunden_fk":'||<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.kunden_fk#">||'}' as JSONB)
                            <cfelseif StructKeyExists(arguments, 'user_fk')>
                            , Cast('{"kunden_fk":'||k.kunden_fk::varchar||',"user_fk":'||<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.user_fk#">||'}' as JSONB)
                            <cfelseif StructKeyExists(arguments, 'gruppen_fk')>
                            , Cast('{"gruppen_fk":'||<cfqueryparam cfsqltype="cf_sql_varchar" value="#arguments.gruppen_fk #">||'}' as JSONB)
                            </cfif>
                        )
                else
                    NULL
                end as auswahl,
                c.label AS category_label,
                con.id AS container_id,
                con.label AS container_label
            FROM 
                zugangsverwaltung.tab t
            JOIN 
                zugangsverwaltung.container con ON con.tab_fk = t.id
            JOIN 
                zugangsverwaltung.category c ON c.container_fk = con.id
            JOIN 
                zugangsverwaltung.element e ON e.category_fk = c.id
            <cfif StructKeyExists(arguments, 'user_fk')>
                CROSS JOIN kunden_info k
            </cfif>
            where
                lower(t.label) = lower(<cfqueryparam value="#tab#" cfsqltype="cf_sql_varchar">)
            and t.type = '#arguments.type#'
            order by e.sortierung
        </cfquery>

        <cfquery name="qReiters" datasource="#application.datasource#">
            SELECT 
            reit.id,
            reit.label,
                (SELECT STRING_AGG(r2.label, ',' ORDER BY r2.sortierung) AS label_liste FROM zugangsverwaltung.reiter r2 where r2.label != reit.label and r2.tab_fk = t.id) as andere_reiter_liste
            FROM 
                zugangsverwaltung.tab t
            JOIN 
                zugangsverwaltung.reiter reit ON reit.tab_fk = t.id
            where lower(t.label) = lower(<cfqueryparam value="#tab#" cfsqltype="cf_sql_varchar">)
                and t.type = '#arguments.type#'
            order by reit.sortierung    
        </cfquery>


        <!--- Daten aus login und kunden Tabelle --->
        <cfif arguments.type eq "Kunde">
            <cfset tabelle = "login.kunden">

            <cfquery name="qDaten" datasource="#application.datasource#">
                SELECT *
                FROM #tabelle#
                WHERE id = <cfqueryparam cfsqltype="cf_sql_int" value="#arguments.id#">
            </cfquery>

        <cfelseif arguments.type eq "User">
            <cfset tabelle = "login.login">

            <cfquery name="qDaten" datasource="#application.datasource#">
                SELECT *
                FROM #tabelle#
                WHERE id = <cfqueryparam cfsqltype="cf_sql_int" value="#arguments.id#">
            </cfquery>

        <cfelseif arguments.type eq "Gruppe">
            <cfset tabelle = "login.login">

            <cfquery name="q_gruppen" datasource="#application.datasource#">
                SELECT user_vorlage_login_fk
                FROM login.gruppen
                WHERE id = <cfqueryparam cfsqltype="cf_sql_int" value="#arguments.id#">
            </cfquery>

            <cfquery name="qDaten" datasource="#application.datasource#">
                SELECT *
                FROM #tabelle#
                WHERE id = <cfqueryparam cfsqltype="cf_sql_int" value="#q_gruppen.user_vorlage_login_fk#">
            </cfquery>
        </cfif>


        <cfset var allData = {
            "containers": [],
            "reiters": []
        }>
        <cfloop query="qContainers">
            <cfset var containerData = {
                "id": qContainers.id,
                "label": qContainers.label,
                "sortierung": qContainers.sortierung,
                "tabID": qContainers.tab_fk,
                "reiter_label" : qContainers.reiter_label,
                "tab_label" : qContainers.tab_label,
                "categories": [] 
            }>

            <cfloop query="qCategories">
                <cfif qCategories.container_fk EQ qContainers.id>
                    <cfset var categoryData = {
                        "id": qCategories.id,
                        "label": qCategories.label,
                        "sortierung": qCategories.sortierung,
                        "elements": []  
                    }>

                    <cfloop query="qElements">
                        <cfif qElements.category_fk EQ categoryData.id>
                            <cfset var elementData = {
                                "id": qElements.id,
                                "label": qElements.label,
                                "elementType": qElements.element_type,
                                "defaultValue": qElements.default_wert,
                                "src_columnname": qElements.src_columnname,
                                "categoryLabel": qCategories.label,
                                "regex": qElements.regex,
                                "ziel_id": qDaten.id,
                                "auswahl": deserializeJSON(qElements.auswahl)
                            }>
                            <cfif structKeyExists(qDaten, qElements.src_columnname)>
                                <cfset structAppend(elementData, {'value': qDaten[qElements.src_columnname] })>
                            <cfelseif qElements.id eq 243>
                                <!--- Actonomy Aktiv oder nicht aktiv in auswahl_sql enthalten --->
                                <cfif len(elementData.auswahl)>
                                    <cfset structAppend(elementData, {'value': elementData.auswahl.selected_value })>
                                </cfif>
                                <cfset elementData.auswahl = ''>
                            </cfif>

                            <cfset arrayAppend(categoryData.elements, elementData)>
                        </cfif>
                    </cfloop>

                    <cfset arrayAppend(containerData.categories, categoryData)>
                </cfif>
            </cfloop>

            <cfset arrayAppend(allData.containers, containerData)>
        </cfloop>

        <cfloop query="qReiters">
            <cfset var reiterData = {
                "id": qReiters.id,
                "label": qReiters.label,
                "andereLabels": qReiters.andere_reiter_liste
            }>
            <cfset arrayAppend(allData.reiters, reiterData)>
        </cfloop>
        
        <cfreturn serializeJSON(allData)>
    </cffunction>


    <!---  --->
    <cffunction name="getRights" access="remote" returnformat="json">
        <cfargument name="kundenid" type="numeric" required="true">
        <cfargument name="suchbegriff" type="string" required="true">
        <cfset var results = []>

        <cfquery name="qRight" datasource="#application.datasource#">
            select e.label, e.src_columnname 
            from zugangsverwaltung.element e
            where label ilike <cfqueryparam value="%#arguments.suchbegriff#%" cfsqltype="cf_sql_varchar">
        </cfquery>

        <cfloop query="qRight">
            <cfset arrayAppend(results, qRight.label)>
        </cfloop>
        
        <cfreturn serializeJSON(results)>
    </cffunction>


    <!--- User Liste der Gruppe --->
    <cffunction name="getAllGruppenUser" access="remote" returnformat="plain">
        <cfargument name="id" default="" />

        <cfquery name="q_user_liste" datasource="#application.datasource#">
            select 	
                l.id,
                l.login,
                l.email,
                case when l.admin = true then 'ja' else '' end as admin,
                l.kunden_fk
            from login.login l
            where l.gruppen_fk = <cfqueryparam cfsqltype="cf_sql_int" value="#arguments.id#">
            order by l.login
        </cfquery>

        <cfset var allUserData = {
            "users": []
        }>
       
        <cfloop query="q_user_liste">
            <cfset var userData = {
                "id": q_user_liste.id,
                "login": q_user_liste.login,
                "email": q_user_liste.email,
                "admin": q_user_liste.admin,
                "kunden_fk": q_user_liste.kunden_fk
            }>
            <cfset arrayAppend(allUserData.users, userData)>
        </cfloop>
        
        <cfreturn serializeJSON(allUserData)>
    </cffunction>


    <!--- Admin-Users Liste --->
    <cffunction name="getAllKundenUser" access="remote" returnformat="plain">
        <cfargument name="id" default="" />

        <cfquery name="q_user_admin_liste" datasource="#application.datasource#">
            select 	l.id,
                    l.login,
                    g.gruppe,
                    trim(l.email) as email,
                    trim(l.telefon) as telefon,
                    l.kunden_fk,
                    l.admin
            from login.login l
                inner join login.kunden k on k.id = l.kunden_fk
                left join login.gruppen g on g.id = l.gruppen_fk
            where l.kunden_fk = <cfqueryparam cfsqltype="cf_sql_int" value="#arguments.id#">
                    and not l.user_vorlage
                    and l.r_adminrecht_zugangsdaten
            order by l.login
        </cfquery>

        <cfset var allUserData = {
            "users": []
        }>
       
        <cfloop query="q_user_admin_liste">
            <cfset var userData = {
                "id": q_user_admin_liste.id,
                "login": q_user_admin_liste.login,
                "email": q_user_admin_liste.email,
                "telefon": q_user_admin_liste.telefon,
                "gruppe": q_user_admin_liste.gruppe,
                "kunden_fk": q_user_admin_liste.kunden_fk
            }>
            <cfset arrayAppend(allUserData.users, userData)>
        </cfloop>
        
        <cfreturn serializeJSON(allUserData)>
    </cffunction>


    <!--- Quellenland --->
    <cffunction name="getAllQuellen" access="remote" returnformat="plain">
        <cfquery name="q_quellenland" datasource="#application.datasource#">
            select quelle_land, id
            from auswahl.stellenmaerkte
            where quelle_land != 'FI'
            order by ordnung
        </cfquery>

        <cfset var allQuellen = {
            "quellen": []
        }>

        <cfloop query="q_quellenland">
            <cfset var quellenData = {
                "id": q_quellenland.id,
                "land": q_quellenland.quelle_land
            }>
            <cfset arrayAppend(allQuellen.quellen, quellenData)>
        </cfloop>

        <cfreturn serializeJSON(allQuellen)>
    </cffunction>

</cfcomponent>
