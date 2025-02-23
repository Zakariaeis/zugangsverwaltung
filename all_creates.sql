-- DROP SCHEMA zugangsverwaltung;

CREATE SCHEMA zugangsverwaltung AUTHORIZATION ad_db_owner;


-- Permissions

GRANT ALL ON SCHEMA zugangsverwaltung TO ad_db_owner;
GRANT USAGE ON SCHEMA zugangsverwaltung TO stellen_read;
GRANT USAGE ON SCHEMA zugangsverwaltung TO stellen_write;


-- zugangsverwaltung.category definition

-- Drop table

-- DROP TABLE zugangsverwaltung.category;

CREATE TABLE zugangsverwaltung.category (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	sortierung int4 NOT NULL,
	"label" varchar NOT NULL,
	container_fk int4 NOT NULL,
	CONSTRAINT category_pkey PRIMARY KEY (id),
	CONSTRAINT category_container_fk_fkey FOREIGN KEY (container_fk) REFERENCES zugangsverwaltung.container(id)
);

-- Permissions

ALTER TABLE zugangsverwaltung.category OWNER TO ad_db_owner;
GRANT ALL ON TABLE zugangsverwaltung.category TO ad_db_owner;
GRANT UPDATE, SELECT, INSERT, DELETE ON TABLE zugangsverwaltung.category TO stellen_write;
GRANT SELECT ON TABLE zugangsverwaltung.category TO stellen_read;



-- zugangsverwaltung.container definition

-- Drop table

-- DROP TABLE zugangsverwaltung.container;

CREATE TABLE zugangsverwaltung.container (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	sortierung int4 NOT NULL,
	"label" varchar NOT NULL,
	tab_fk int4 NULL,
	reiter_fk int4 NULL,
	CONSTRAINT container_pkey PRIMARY KEY (id),
	CONSTRAINT container_reiter_fk_fkey FOREIGN KEY (reiter_fk) REFERENCES zugangsverwaltung.reiter(id),
	CONSTRAINT container_tab_fk_fkey FOREIGN KEY (tab_fk) REFERENCES zugangsverwaltung.tab(id)
);

-- Permissions

ALTER TABLE zugangsverwaltung.container OWNER TO ad_db_owner;
GRANT ALL ON TABLE zugangsverwaltung.container TO ad_db_owner;
GRANT UPDATE, SELECT, INSERT, DELETE ON TABLE zugangsverwaltung.container TO stellen_write;
GRANT SELECT ON TABLE zugangsverwaltung.container TO stellen_read;



-- zugangsverwaltung."element" definition

-- Drop table

-- DROP TABLE zugangsverwaltung."element";

CREATE TABLE zugangsverwaltung."element" (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	sortierung int4 NOT NULL,
	sprachvariabelname varchar NOT NULL,
	"label" varchar NOT NULL,
	regex varchar NULL,
	element_type varchar NOT NULL,
	default_wert varchar NULL,
	category_fk int4 NOT NULL,
	src_columnname varchar(255) NULL,
	src_table varchar(255) NULL,
	auswahl_sql varchar NULL,
	CONSTRAINT element_pkey PRIMARY KEY (id),
	CONSTRAINT element_sprachvariabelname_key UNIQUE (sprachvariabelname),
	CONSTRAINT element_category_fk_fkey FOREIGN KEY (category_fk) REFERENCES zugangsverwaltung.category(id)
);

-- Permissions

ALTER TABLE zugangsverwaltung."element" OWNER TO ad_db_owner;
GRANT ALL ON TABLE zugangsverwaltung."element" TO ad_db_owner;
GRANT UPDATE, SELECT, INSERT, DELETE ON TABLE zugangsverwaltung."element" TO stellen_write;
GRANT SELECT ON TABLE zugangsverwaltung."element" TO stellen_read;



-- zugangsverwaltung.reiter definition

-- Drop table

-- DROP TABLE zugangsverwaltung.reiter;

CREATE TABLE zugangsverwaltung.reiter (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	sortierung int4 NOT NULL,
	"label" varchar NOT NULL,
	anzahlspalten int4 NOT NULL,
	tab_fk int4 NOT NULL,
	CONSTRAINT reiter_pkey PRIMARY KEY (id),
	CONSTRAINT reiter_tab_fk_fkey FOREIGN KEY (tab_fk) REFERENCES zugangsverwaltung.tab(id)
);

-- Permissions

ALTER TABLE zugangsverwaltung.reiter OWNER TO ad_db_owner;
GRANT ALL ON TABLE zugangsverwaltung.reiter TO ad_db_owner;
GRANT UPDATE, SELECT, INSERT, DELETE ON TABLE zugangsverwaltung.reiter TO stellen_write;
GRANT SELECT ON TABLE zugangsverwaltung.reiter TO stellen_read;

--- Verschiedene arten von usern bzw accounts
CREATE TYPE zugangsverwaltung.user_type AS ENUM ('User', 'Gruppe' , 'Kunde');


-- zugangsverwaltung.tab definition

-- Drop table

-- DROP TABLE zugangsverwaltung.tab;

CREATE TABLE zugangsverwaltung.tab (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	sortierung int4 NOT NULL,
	"label" varchar NOT NULL,
	"type" zugangsverwaltung."user_type" NOT NULL,
	CONSTRAINT tab_pkey PRIMARY KEY (id)
);

-- Permissions

ALTER TABLE zugangsverwaltung.tab OWNER TO ad_db_owner;
GRANT ALL ON TABLE zugangsverwaltung.tab TO ad_db_owner;
GRANT UPDATE, SELECT, INSERT, DELETE ON TABLE zugangsverwaltung.tab TO stellen_write;
GRANT SELECT ON TABLE zugangsverwaltung.tab TO stellen_read;



-- DROP FUNCTION zugangsverwaltung.execute_query(varchar, jsonb);

CREATE OR REPLACE FUNCTION zugangsverwaltung.execute_query(query_text character varying, params jsonb)
 RETURNS character varying
 LANGUAGE plpgsql
AS $function$
DECLARE
	lKey TEXT;
    lValue TEXT;
	formatted_query TEXT;
    result varchar;
BEGIN

	formatted_query := query_text;
 	FOR lKey, lValue IN
        SELECT key, value
        FROM jsonb_each_text(params)
    LOOP
        -- Ersetze jeden Platzhalter im Format %key durch den entsprechenden Wert
        formatted_query := REPLACE(formatted_query, '%' || lKey, lValue);
    END LOOP;

    -- Führen Sie die dynamische Abfrage aus und weisen Sie das Ergebnis der Variablen 'result' zu
    EXECUTE formatted_query INTO result;
    
    -- Geben Sie das Ergebnis zurück
    RETURN result;
END;
$function$
;

-- Permissions

ALTER FUNCTION zugangsverwaltung.execute_query(varchar, jsonb) OWNER TO stellen_superuser;
GRANT ALL ON FUNCTION zugangsverwaltung.execute_query(varchar, jsonb) TO public;
GRANT ALL ON FUNCTION zugangsverwaltung.execute_query(varchar, jsonb) TO stellen_superuser;
