//############################################### Elementgenerierung Logik ####################################//
async function loadAllContainersAndElements(tab, type, id, id_settings) {
    var ziel_id = id;
    //try {
        // Fetch all container and element data from the CFC
		var params = new FormData();
		params.append('tab', tab);
		params.append('type', type);
		params.append('id', ziel_id);
		Object.keys(id_settings).forEach(key => {
			params.append(key, id_settings[key]);
		});
		const response = await fetch('./components/elementGenerator.cfc?method=getAllContainerAndElementData', {method: 'POST', body: params});
        const allData = await response.json();
        
        // Iterate over each container's data and create HTML for it
        if (tab == 'Stellenmarkt' ){
            if (type == 'Kunde' ){
                type = 'kunden';
            }else if (type == 'Gruppe' ){
                type = 'gruppen';
            }else if (type == 'User' ){
                type = 'user';
            }

			var container_element = document.getElementById('element-container'); // Assuming you have this container in HTML

			var reiterHTML = createAllReitersHTML(allData.reiters, type);

			var reiterContainerHTML = createAllContainerReiterHTML(allData, type, ziel_id);

			var containerHTML = `
			<div id="einstellungen_tab_${tab}" class="einstellungen_body">
				<div class="reiter layout_flex fliesstext_14">
					<div id="element-container-reiters">
					${reiterHTML}
					</div>
				</div>
			
				<div id="element-container-reiter">
					${reiterContainerHTML}
				</div>
			</div>`;
			// Append the generated HTML to the main container
			container_element.innerHTML = containerHTML;
        } else {

            if (type == 'Kunde' ){
                type = 'kunden';
            }
            if (type == 'Gruppe' ){
                type = 'gruppen';
            }
            if (type == 'User' ){
                type = 'user';
            }

            if(tab == 'Kundendaten' || tab == 'Userdaten' || tab == 'Gruppendaten'){
                var containersInhalt = document.getElementById('einstellungen_tab_'+tab);
                if (containersInhalt) {
                    containersInhalt.remove();
                }

                var container_element = document.getElementById('element-container'); // Assuming you have this container in HTML

                var containerHTML = `
                <div id="einstellungen_tab_${tab}" class="einstellungen_body">
                    <div class="layout_grid_2_columns" id="container_daten_grid2">
                    </div>
                </div>`;
                
                // Append the generated HTML to the main container
                container_element.innerHTML = containerHTML;
            } else{
                var containersInhalt = document.getElementById('einstellungen_tab_'+tab);
                if (containersInhalt) {
                    containersInhalt.remove();
                }
            }

            allData.containers.forEach(containerData => {
                createContainerHTML(containerData, type, ziel_id);
            });
        }

    // } catch (error) {
    //     console.error('Fehler beim Laden der Container- und Elementdaten:', error);
    // }
}


async function loadAllGruppenUsers(id) {
    try {
        // Fetch all container and element data from the CFC
        const response = await fetch(`./components/elementGenerator.cfc?method=getAllGruppenUser&id=${id}`);
        const allUserData = await response.json();
        
        var containerHTML = "";

        // users
        allUserData.users.forEach(userData => {                        
            containerHTML += `
            <div class="fliesstext_13 display_contents color_dunkles_grau" onclick="oeffneUserSuche(${userData.kunden_fk}, ${userData.id})">
                <div class="suche_ergebnis_grid_item_settings color_black">${userData.login}</div>
                <div class="suche_ergebnis_grid_item_settings">${userData.email}</div>
                <div class="suche_ergebnis_grid_item_settings">${userData.admin}</div>
            </div>`;                                
        });

        return containerHTML;
    } catch (error) {
        console.error('Fehler beim Laden der Container- und Elementdaten:', error);
    }
}


async function getAllKundenUser(id) {
    try {
        // Fetch all container and element data from the CFC
        const UserResponse = await fetch(`./components/elementGenerator.cfc?method=getAllKundenUser&id=${id}`);
        const allKundeUserData = await UserResponse.json();
        
        var containerHTML = "";

        // users
        allKundeUserData.users.forEach(userData => {                        
            containerHTML += `
            <div class="fliesstext_13 display_contents color_dunkles_grau" onclick="oeffneUserSuche(${userData.kunden_fk}, ${userData.id})" >
                <div class="suche_ergebnis_grid_item_settings color_black">${userData.login}</div>
                <div class="suche_ergebnis_grid_item_settings">${userData.email}</div>
                <div class="suche_ergebnis_grid_item_settings">${userData.telefon}</div>
                <div class="suche_ergebnis_grid_item_settings">${userData.gruppe}</div>
            </div>`;
        });

        return containerHTML;
    } catch (error) {
        console.error('Fehler beim Laden der Container- und Elementdaten:', error);
    }
}


function createAllReitersHTML(alldata, type) {
    var result = "";
	alldata.forEach(reiterData => {
		var reiter_item_selected = "";
		if(reiterData.label == 'Felder' && type == 'kunden'){
			reiter_item_selected = " reiter_item_selected";
		}

		if(reiterData.label == 'Quellen' && (type == 'user' || type == 'gruppen')){
			reiter_item_selected = " reiter_item_selected";
		}

    	result += `<span id="reiter_${reiterData.label}" class="reiter_item ${reiter_item_selected}" onclick="reiter_auswaehlen_${type}('${reiterData.label}', '${reiterData.andereLabels}')">${reiterData.label}</span>`;
	});
    return result;
}

function createAllContainerReiterHTML(alldata, type, ziel_id) {
	const SINGLE_GRID_REITER_LABELS = ['Exportfelder'];
    var result = {};
	var container_layout_display_none = "";
	alldata.containers.forEach(containerData => {
		var innerContent = "";
		container_layout_display_none = "container_layout_display_none";
		// Wählt den 1. Reiter per default erstmal aus
		if(alldata.reiters.length > 0 && alldata.reiters[0].label == containerData.reiter_label){
			container_layout_display_none = "";
		}

		if(containerData.reiter_label == 'Exportfelder'){
			var container_element_3_columns = '';
			// Sammelt alle Category Elemente
			containerData.categories.forEach(categoryData => {
				// "Exportfelder Firma" "Exportfelder Anzeige" "Export-Dateiformate"
				if([40,41,42].indexOf(categoryData.id) >= 0){
					container_element_3_columns += createCategoryHTML(categoryData, type, ziel_id);
				}else{
					innerContent += createCategoryHTML(categoryData, type, ziel_id);
				}
			});
			result[containerData.reiter_label] = `
			<div class="layout_grid_1_column container_layout_display_none padding_top_20 ${container_layout_display_none}" id="container_reiter_${containerData.reiter_label}">
				<div class="container_layout_header container_header_${type}">
					<h3>${containerData.label}</h3>
				</div>

				<div class="container_layout_body">
					${innerContent}

					<div class="container_element_3_columns kunden_exportfelder_gruppierung">
						${container_element_3_columns}
					</div>
				</div>
				
			</div>`;
		} else {
			if(typeof result[containerData.reiter_label] == 'undefined'){
				result[containerData.reiter_label] = `<div class="layout_grid_2_columns ${container_layout_display_none} padding_top_20" id="container_reiter_${containerData.reiter_label}">`;
			}
			// Sammelt alle Category Elemente
			containerData.categories.forEach(categoryData => {
				innerContent += createCategoryHTML(categoryData, type, ziel_id);
			});
			result[containerData.reiter_label] += `
			<div>
				<div class="container_layout_header container_header_${type}">
					<h3>${containerData.label}</h3>
				</div>

				<div class="container_layout_body">
					${innerContent}
				</div>
			</div>`;
		}
	});

    return Object.entries(result).reduce((acc, [key, value]) => {
		if(SINGLE_GRID_REITER_LABELS.indexOf(key) < 0)
			return acc+value + '</div>'
		return acc+value;
	}, "");
}


function createContainerHTML(containerData, type, ziel_id) {
    var container = "";  // Assuming you have this container in HTML
    // Generate the main container HTML with header
    let containerHTML = "";
    if(containerData.tab_label == 'Kundendaten' || containerData.tab_label == 'Userdaten' || containerData.tab_label == 'Gruppendaten'){
        container = document.getElementById('container_daten_grid2'); // Assuming you have this container in HTML

        containerHTML = containerHTML + `
        <div>
            <div class="container_layout_header container_header_${type}">
                <h3>${containerData.label}</h3>
            </div>

            <div class="container_layout_body">`;
                // Admin-User - Liste
                if(containerData.label == 'Admin-User' ){
                    containerHTML += `
                    <div id="adminuserErgebnisGrid" class="startseite_content_suche_ergebnis_grid_settings fliesstext_14 container_layout_body_user_liste">
                        <div class="display_contents">
                            <div class="suche_ergebnis_grid_headeritem_settings">Name</div>
                            <div class="suche_ergebnis_grid_headeritem_settings">E-Mail</div>
                            <div class="suche_ergebnis_grid_headeritem_settings">Telefon</div>
                            <div class="suche_ergebnis_grid_headeritem_settings">Gruppe</div>
                        </div>
                    </div>`;

                    getAllKundenUser(ziel_id).then(containerHTML => {
                        document.getElementById('adminuserErgebnisGrid').innerHTML += containerHTML;
                    });
                
                // User - Info
                } else if(containerData.label == 'Info' && type == 'user'){
					containerData.categories.forEach(categoryData => {
                        containerHTML += createCategoryHTML(categoryData, type, ziel_id);
                    });
                    // containerHTML += `
                    // <div class="container_element_1_column">
                    //     <div class="grauer_kasten">
                    //         //ToDo //Kundeninfo
                    //         <p class="fliesstext_14">
                    //             ................
                    //         </p>
                    //     </div>
                    // </div>`;

                // Gruppe - Info
                } else if(containerData.label == 'Info' && type == 'gruppen'){
                    containerHTML += `
                    <div class="margin_bottom_30" style="padding-right: 50px; padding-left: 15px">
                        <div id="ergebnisGridGruppenGruppeSettings" class="einstellungen_tab_gruppendaten_grid_gruppen fliesstext_14 container_layout_body_user_liste">
                            <div class="display_contents">
                                <div class="suche_ergebnis_grid_headeritem_settings">Username</div>
                                <div class="suche_ergebnis_grid_headeritem_settings">E-Mail</div>
                                <div class="suche_ergebnis_grid_headeritem_settings">Admin</div>
                            </div>`;

                            loadAllGruppenUsers(ziel_id).then(containerHTML => {
                                document.getElementById('ergebnisGridGruppenGruppeSettings').innerHTML += containerHTML;
                            });

                        containerHTML += `
                        </div>
                    </div>`;    
					containerData.categories.forEach(categoryData => {
                        containerHTML += createCategoryHTML(categoryData, type, ziel_id);
                    });

                } else {
                    // Iterate over each category in the container
                    containerData.categories.forEach(categoryData => {
                        containerHTML += createCategoryHTML(categoryData, type, ziel_id);
                    });
                }

                // Close the container structure
                containerHTML += `
            </div>
        </div>`;

    } else {
        container = document.getElementById('element-container');

        containerHTML = `
        <div id="einstellungen_tab_${containerData.tab_label}" class="einstellungen_body">`;

            containerHTML = containerHTML + `
            <div class="layout_grid_2_columns">
                <div>
                    <div class="container_layout_header container_header_${type}">
                        <h3>${containerData.label}</h3>
                    </div>

                    <div class="container_layout_body">`;
                        // Iterate over each category in the container
                        containerData.categories.forEach(categoryData => {
                            containerHTML += createCategoryHTML(categoryData, type, ziel_id);
                        });

                        // Close the container structure
                        containerHTML += `
                    </div>
                </div>
            </div>
        </div>`;
    }

    // Append the generated HTML to the main container
    container.innerHTML += containerHTML;
}


function createCategoryHTML(categoryData, type, ziel_id) {
    let categoryHTML = "";
	var categoryHeader = ``;

	if(categoryData.elements.length > 0 && categoryData.elements[0].elementType === 'input(text_zugangsdaten)' || categoryData.elements.length > 0 && categoryData.elements[0].elementType === 'input(text_info)') {
		categoryHeader = ``;
	} else {
		categoryHeader = `
			<div class="container_category_header">
				<h3 class="ueberschrift_16">${categoryData.label}</h3>
				<i class="fa fa-question-circle container_category_header_icon"></i>
			</div>
		`;
	}

	var innerHtml = '';
	// Iterate over each element in the category
	categoryData.elements.forEach(elementData => {
		innerHtml += generateElementHTML(elementData, type, ziel_id);
	});
    categoryHTML = `
	<div class="container_category_group">
		${categoryHeader}
		${innerHtml}
	</div>`;

	return categoryHTML;
}


function generateElementHTML(elementData, type, ziel_id) {
	var buttonClass = ``;
	if(type === 'Kunde' || type === 'kunde') {
		buttonClass = `border_kunden`;
	} else if (type === 'User' || type === 'user') {
		buttonClass = `border_user`;
	} else if (type === 'Gruppe' || type === 'gruppen') {
		buttonClass = `border_gruppe`;
	}
	
    let elementHTML = '';
    // Customize the HTML based on the type of element
    if (elementData.elementType === 'input(text)' || elementData.elementType === 'input(email)') {
		var text = ``;
		if(elementData.auswahl != '') {
			 text = elementData.auswahl;
		} else {
			text = elementData.value;
			if(elementData.value == undefined) {
				text = ``;
			}
		}
		if(elementData.id == '64' || elementData.id == '225') { //wenn das Element mm-Einschraenkung ist
			var zusatzText = `<p class="fliesstext_12" style="color: var(--dunkles-grau)">(Bsp. >1000 oder <1000)</p>`;
		} else {
			var zusatzText = ``;
		}
		var zusaetzlicherText = ``;
		if(elementData.id == '165') { //Zusatztext bei Kunden -> Exportlimit fuer Firmendatensaetze
			zusaetzlicherText = `<div class="padding_left_20 padding_top_10">
			<p class="fliesstext_12 hinweis-rot">	
			Der Kunde verfügt über ${elementData.auswahl[0].anzahl} Landwehr-Zugänge mit unterschiedlichen Mandanten, Filialen oder Global-IDs.<br>
			Beim Anlegen eines weiteren Mandanten für einen Kunden können Sie dies in der Benutzeransicht tun. <a href="landwehr_zugaenge_export.cfm?kunden_fk=${elementData.ziel_id}" target="_blank">Download alle Zugänge</a></p>
			</div>`;
			text = ``;
		} else if(elementData.id == '458') { //Zusatztext bei Landwhr Filiale User
			zusaetzlicherText = `<div class="padding_left_20 padding_top_10">
			<p class="fliesstext_12 hinweis-rot">	
				Beim Speichern der Landwehr-Daten wird ein neuer Zugang für den Kunden angelegt.
			</div>`;
		} else {
			zusaetzlicherText = ``;
		}	
		
        elementHTML = `
			${zusaetzlicherText}
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label} ${zusatzText}</label>
                <div class="layout_element_speichern_select_input">
                    <input type="text" id="${elementData.src_columnname}_id" name="${elementData.src_columnname}" class="input_element width_100 element_input_text_speichern" value="${text}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            </div>
        `;

    } else if(elementData.elementType === 'text') {
		elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <div class="layout_element_speichern_select_input">
					<p id="${elementData.src_columnname}_id" name="${elementData.src_columnname}" class="width_100">${elementData.auswahl}</p>
                </div>
            </div>
        `;
	} else if(elementData.elementType === 'text_button') {
		if(elementData.auswahl == true) {
			var text = 'Aktiv';
		} else {
			var text = 'Inaktiv';
		}
		elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <div class="layout_flex">
					<p id="datenbereitstellung_id" name="datenbereitstellung" class="margin_right_20">${text}</p>
					<a href="https://interne-tools.advertsdata.com/logged_in/indiv_schnittstelle_uebersicht/index.cfm" target="_blank" style="text-decoration: none" class="width_80">
						<button type="button" class="button fliesstext_14 border_kunden layout_flex_nowrap width_40" style="justify-content: center">Zum Tool</button>
					</a>
                </div>
            </div>
        `;

	} else if(elementData.elementType === 'input(text_info)') {
		elementHTML = `
			<div class="container_element_1_column" data-element-id="${elementData.id}">
					<div class="grauer_kasten">
						${elementData.auswahl.value}	
					</div>
			</div>
        `;
	} else if(elementData.elementType === 'input(text_anrede_titel)') {
		elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="anrede_titel_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <div class="layout_element_speichern_select_input">
                    <input type="text" id="anrede_id" name="anrede" class="input_element width_100 element_input_text_speichern" value="${elementData.auswahl.anrede == null ? '' : elementData.auswahl.anrede}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
					<input type="text" id="titel_id" name="titel" class="input_element width_100 element_input_text_speichern" value="${elementData.auswahl.titel == null ? '' : elementData.auswahl.titel}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            </div>
        `;
	} else if(elementData.elementType === 'input(text_exportbeschraenkung)') {
		if(elementData.auswahl != '') { //wenn in auswahl_sql was ausgewertet wurde
			var optionsHTML = '';
			let data = elementData.auswahl;
			optionsHTML = `
				<input type="text" id="${data.label1}" name="${data.name1}" value="${data.input1}" class="input_element width_75 element_input_text_speichern" value="${text}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
				<div class="container_element_2_columns_geschachtelt" style="grid-template-columns: auto 1fr">
					<label for="${data.label2}" class="padding_right_10">${data.label2}</label>
					<input type="text" id="${data.label2}" name="${data.name2}" value="${data.input2}" class="input_element width_75 element_input_text_speichern" value="${text}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
				</div>
			`;

			elementHTML = `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<p class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</p>
				<div class="container_element_2_columns_geschachtelt" style="grid-template-columns: 40% 66%">
					${optionsHTML}
					<span class="container_saved_element_text layout_flex fliesstext_14 hide">
						<img src="../images/icon_saved.png" alt="Icon Gespeichert">
					</span>
				</div>
			</div>
			`;
		}

	} else if(elementData.elementType === 'input(text_einschraenkung)') {
		var text = ``;
		var placeholder = ``;
		if(elementData.auswahl != '') {
			 text = elementData.auswahl;
		} else {
			text = elementData.value;
		}
		if(elementData.id == '314' || elementData.id == '285') {
			placeholder = `Position`;
		} else if(elementData.id == '148' || elementData.id == '287' || elementData.id === '422') {
			placeholder = `Suchbegriffe`;
		}
        elementHTML = `
            <div class="container_element_40_60_layout" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <div class="layout_element_speichern_select_input">
                    <textarea id="${elementData.src_columnname}_id" name="${elementData.src_columnname}" placeholder="${placeholder}" class="input_element width_100 element_input_text_speichern" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);" style="height: 70px">${text}</textarea>
					<button type="button" class="button" style="border-radius:12px; height: min-content" onclick="fuegeAndZuTextfeldHinzu(${elementData.src_columnname}_id)">+"AND"</button>
					<button type="button" class="button" style="border-radius:12px; height: min-content" onclick="fuegeOrZuTextfeldHinzu(${elementData.src_columnname}_id)">+"OR"</button>
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            </div>
        `;

	} else if(elementData.elementType === 'input(text_telefon)') {
		elementHTML += `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
				<div class="layout_element_speichern_select_input">
					<input type="text" id="landesvorwahl_id" name="landesvorwahl" class="input_element width_30" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);" value="${elementData.auswahl.landesvorwahl == null ? '' : elementData.auswahl.landesvorwahl}">
					<input type="text" id="vorwahl_id" name="vorwahl" class="input_element width_30" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);" value="${elementData.auswahl.vorwahl == null ? '' : elementData.auswahl.vorwahl}">
					<input type="text" id="telefon_id" name="telefon" class="input_element" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);" value="${elementData.auswahl.telefon == null ? '' : elementData.auswahl.telefon}">
					<span class="container_saved_element_text layout_flex fliesstext_14 hide">
						<img src="../images/icon_saved.png" alt="Icon Gespeichert">
					</span>
				</div>
			</div>
		`;
	} else if(elementData.elementType === 'input(text_plz)') {
		if (elementData.auswahl.setting && Array.isArray(elementData.auswahl.setting) && elementData.auswahl.setting.length > 0) { 
			var elementSetting = ``;
			elementData.auswahl.setting.forEach(function(plzSettings) {//hole ausgewaehlte plz_bereiche und stelle sie unter dem element dar
				elementSetting += `
					<div class="layout_flex" style="display: grid; grid-template-columns: 15% 10% 10%; padding: 10px 20px 0px 0px">
						<div class="margin_right_20">
							${plzSettings.plz_von} - ${plzSettings.plz_bis}
						</div>
						<div class="margin_right_50">${plzSettings.land}</div>
						<div>
							<span><img src="../images/icon_x_mark_grey.png" alt="Icon Löschen"></span>
						</div>
					</div>
				`;
				});

			elementData.auswahl.setting.forEach(function(plzObj) {
				var options= "";
				elementData.auswahl.alle.forEach((item) => options += `<option value="${item}">${item}</option>`);

				elementHTML = `
					<div class="container_element_1_column" data-element-id="${elementData.id}">
						<label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
						<div class="layout_element_speichern_select_input margin_top_10 layout_flex">
							<input type="text" id="plz_von_id" name="plz_von" class="input_element" value="">
							- 
							<input type="text" id="plz_bis_id" name="plz_bis" class="input_element" value="">
							<div class="input_element input_element_select width_25">
								<select name="${elementData.label}" id="select_${plzObj.land}" class="dropdown_element width_100 fliesstext_14" onchange="visuellesOnChangeFeedback(event)">
								${options}
								</select>
							</div>
							<button id="${elementData.label}_button" type="button" class="button fliesstext_14 ${buttonClass}">Speichern</button>
							<span class="container_saved_element_text layout_flex fliesstext_14 hide">
								<img src="../images/icon_saved.png" alt="Icon Gespeichert">
							</span>
						</div>
						${elementSetting}
					</div>
				`;
			});
		} else {
			var options= "";
			elementData.auswahl.alle.forEach((item) => options += `<option value="${item}">${item}</option>`);
			elementHTML = `
				<div class="container_element_1_column" data-element-id="${elementData.id}">
					<label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
					<div class="layout_element_speichern_select_input margin_top_10 layout_flex">
						<input type="text" id="plz_von_id" name="plz_von" class="input_element" value="">
						- 
						<input type="text" id="plz_bis_id" name="plz_bis" class="input_element" value="">
						<div class="input_element input_element_select width_25">
							<select name="${elementData.src_columnname}" id="select_${elementData.label}" class="dropdown_element width_100 fliesstext_14" onchange="visuellesOnChangeFeedback(event)">
							${options}
							</select>
						</div>
						<button id="${elementData.label}_button" type="button" class="button fliesstext_14 ${buttonClass}">Speichern</button>
						<span class="container_saved_element_text layout_flex fliesstext_14 hide">
							<img src="../images/icon_saved.png" alt="Icon Gespeichert">
						</span>
					</div>
				</div>
			`;
		}
	} else if(elementData.elementType === 'input(text_zugangsdaten)') {
        elementHTML = `
            <div class="container_element_1_column">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
            </div>
            <div class="container_element_3_columns" data-element-id="${elementData.id}">
                <div class="layout_element_speichern_select_input">
                    <input type="text" id="${elementData.src_columnname}_id" name="${elementData.src_columnname}" class="input_element width_100 element_input_text_speichern" value="${elementData.value}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
                <button id="button_zugangsdaten_user" type="button" class="button fliesstext_14 einstellungen_header_kunden_button_users" onclick="zugangsdaten_verschicken_user(${elementData.auswahl.kunden_fk}, ${elementData.ziel_id});">Zugangsdaten versenden</button>
            </div>
        `;

	} else if(elementData.elementType === 'input(text_slidedown)') {
        elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <div class="layout_element_speichern_select_input">
                    <div class="width_100" style="position:relative">
                        <textarea id="element_dynamic_textarea" name="${elementData.src_columnname}" class="input_element width_100" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
                            ${elementData.value}
                        </textarea>
                        <span class="input_text_slidedown" onclick="toggleTextArea()"><img id="element_toogle_icon" src="../images/icon_textarea_more.png" alt="Icon Mehr Text"></span>
                    </div>
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            </div> 
        `;

    } else if(elementData.elementType === 'input(link)') {
        elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <a href="https://partnerportal.landwehr-app.de/login" target="_blank">Landwehr</a>
            </div>
        `;

    } else if(elementData.elementType === 'input(checkbox_exportliste)') {
        if (typeof elementData.value === 'string') {
            elementData.value = elementData.value.split(',');
        }
        
		if( elementData.src_columnname == 'r_zusatzabfragen'){
			
			if( elementData.src_columnname == 'r_zusatzabfragen'){
				var values = Array.isArray(elementData.value) ? elementData.value : [];
			}
			
			var spansHTML = '';
			var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
			spansHTML = optionsArray.map(option => {
			
			var isCheckedd = values.includes(option.key.toString());
			
			return `
			<label class="fliesstext_14 margin_bottom_5">
				<input type="checkbox" value="${option.key}" ${isCheckedd ? 'checked' : ''} name="${elementData.src_columnname}" onclick="speichern_pruefen_${type}(this, ${elementData.ziel_id});"> ${option.value}
			</label><br>
			`;
			}).join('');

		}else if(elementData.src_columnname == 'r_exportformate' || elementData.src_columnname == 'r_exportfelder'){
	
			if( elementData.src_columnname == 'r_exportformate' || elementData.src_columnname == 'r_exportfelder'){
				var values = elementData.value.map(number => number.toString());
			}
			
			var spansHTML = '';
			var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
			spansHTML = optionsArray.map(option => {
			
			var isCheckedd = values.includes(option.key.toString());
			
			return `
			<label class="fliesstext_14 margin_bottom_5">
				<input type="checkbox" value="${option.key}" ${isCheckedd ? 'checked' : ''} name="${elementData.src_columnname}" class="${elementData.src_columnname}" onclick="auswahl_multiple(this, '${elementData.src_columnname}', ${elementData.ziel_id}, '${type}')"> ${option.value}
			</label><br>
			`;
			}).join('');	

		}else{
			var values = Array.isArray(elementData.value) ? elementData.value : [elementData.value];
			var spansHTML = ``;
			
			spansHTML = values.map(function(value) {
				return `
				<label class="fliesstext_14 margin_bottom_5"><input type="checkbox" value="${value}"> ${value}</label><br>
				`;
			}).join('');
		}

        var labelText = ``;
        var classesList = ``;
        // if(elementData.label === 'Zusatzabfragen' || elementData.label === 'Export-Dateiformate') {
        //     labelText = ``;
        //     classesList = `container_element_2_columns_geschachtelt`;
        // } else {
           labelText = `<label for="select_${elementData.label}" class="fliesstext_14 font_weight_700 element_schnelle_rechte_suche">${elementData.label}</label>`; 
           classesList = `padding_top_15`;
        // }
       
        elementHTML = `
            <div class="padding_left_20 padding_bottom_15" data-element-id="${elementData.id}">
                ${labelText}
                <div class="layout_element_speichern_select_input" style="position: relative;">
                    <div class="${classesList} width_90">
                        ${spansHTML}
                    </div>
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide">
                        <img src="../images/icon_saved.png" alt="Icon Gespeichert">
                    </span>
                </div>
            </div>
        `;

    } else if(elementData.elementType === 'input(checkbox_quellen)') {
		var extraLayoutPrintQuellen = ``;
		var extraLayoutOnlineQuellen = ``;

		if(elementData.id == '486' || elementData.id == '500'|| elementData.id == '515') {//wenn das Element die Print-Quellen Liste ist
			extraLayoutPrintQuellen = `
			<div class="container_element_1_column">
				<div class="auswahl_element_letter" id="alphabet">
					<span class="auswahl_element_letter_selected">Alle</span>
					<span class="letter" onclick="toggleLetter(this)">A</span>
					<span class="letter" onclick="toggleLetter(this)">B</span>
					<span class="letter" onclick="toggleLetter(this)">C</span>
					<span class="letter" onclick="toggleLetter(this)">D</span>
					<span class="letter" onclick="toggleLetter(this)">E</span>
					<span class="letter" onclick="toggleLetter(this)">F</span>
					<span class="letter" onclick="toggleLetter(this)">G</span>
					<span class="letter" onclick="toggleLetter(this)">H</span>
					<span class="letter" onclick="toggleLetter(this)">I</span>
					<span class="letter" onclick="toggleLetter(this)">J</span>
					<span class="letter" onclick="toggleLetter(this)">K</span>
					<span class="letter" onclick="toggleLetter(this)">L</span>
					<span class="letter" onclick="toggleLetter(this)">M</span>
					<span class="letter" onclick="toggleLetter(this)">N</span>
					<span class="letter" onclick="toggleLetter(this)">O</span>
					<span class="letter" onclick="toggleLetter(this)">P</span>
					<span class="letter" onclick="toggleLetter(this)">Q</span>
					<span class="letter" onclick="toggleLetter(this)">R</span>
					<span class="letter" onclick="toggleLetter(this)">S</span>
					<span class="letter" onclick="toggleLetter(this)">T</span>
					<span class="letter" onclick="toggleLetter(this)">U</span>
					<span class="letter" onclick="toggleLetter(this)">V</span>
					<span class="letter" onclick="toggleLetter(this)">W</span>
					<span class="letter" onclick="toggleLetter(this)">X</span>
					<span class="letter" onclick="toggleLetter(this)">Y</span>
					<span class="letter" onclick="toggleLetter(this)">Z</span>
	
					<div class="input_element_suche_weiß layout_flex_nowrap input_element input_element_suche_quellen fliesstext_14 width_100">
						<i class="fa fa-search container_suche_icon"></i>
						<input id="printquellen_suche" type="text" class="input_element_suche_inlay_weiss fliesstext_14" onkeyup="filterCheckboxesPrint()">
					</div>
				</div>
			</div>
			`;


		} else if(elementData.id == '487' || elementData.id == '501'|| elementData.id == '516') {//wenn das Element die Online-Quellen Liste ist
			extraLayoutOnlineQuellen = `
			<div class="container_element_1_column">
				<div class="auswahl_element_onlinequellen layout_flex layout_rowgap_20">
					<span class="auswahl_element_onlinequellen_selected">Alle</span>
					<span class="letter" onclick="toggleArt(this)" data-value="alle" >Alle Online-Medien</span>
					<span class="letter" onclick="toggleArt(this)" data-value="online" >Alle Jobbörsen</span>
					<span class="letter" onclick="toggleArt(this)" data-value="CR" >Alle Crawler</span>
					<span class="letter" onclick="toggleArt(this)" data-value="ARB" >Alle Arbeitsämter</span>
					<span class="letter" onclick="toggleArt(this)" data-value="HOME" >Alle Firmen-Websites</span>
					<span class="letter" onclick="toggleArt(this)" data-value="SONS" >Spezialisierten/sonstigen Jobbörsen</span>
	
					<div class="layout_flex_nowrap input_element fliesstext_14 width_25 input_element_suche_medien">
						<i class="fa fa-search container_suche_icon"></i>
						<input id="onlinequellen_suche" type="text" class="input_element_suche_inlay_grau fliesstext_14" onkeyup="filterCheckboxesOnline()">
					</div>
				</div>
			</div>
			`;

		} else {
			extraLayoutPrintQuellen = ``;
			extraLayoutOnlineQuellen = ``;
		}

		if (typeof elementData.value === 'string') {
            elementData.value = elementData.value.split(',');
        }
        
      


		var values = Array.isArray(elementData.value) ? elementData.value : [];
		var spansHTML = '';
		var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
		spansHTML = optionsArray.map(option => {
			var isCheckedd = values.includes(option.key.toString());
			
			if( option.art === 'print'){
				return `
				<label class="fliesstext_14 margin_bottom_5 checkbox_item_quellen_print" data-land="${option.land}" data-quelle="${option.value}" data-art_kurz="">
					<input type="checkbox" value="${option.key}" ${isCheckedd ? 'checked' : ''} name="${elementData.src_columnname}" onclick="speichern_pruefen_${type}(this, ${elementData.ziel_id});"> ${option.value}
				</label><br>`;

			}else if ( option.art === 'online'){
				return `
				<label class="fliesstext_14 margin_bottom_5 checkbox_item_quellen_online" data-land="${option.land}" data-quelle="${option.value}" data-art_kurz="${option.art_kurz}">
					<input type="checkbox" value="${option.key}" ${isCheckedd ? 'checked' : ''} name="${elementData.src_columnname}" onclick="speichern_pruefen_${type}(this, ${elementData.ziel_id});"> ${option.value}
				</label><br>`;
			}

		}).join('');
      
        elementHTML = `
		${extraLayoutPrintQuellen}
		${extraLayoutOnlineQuellen}
            <div class="padding_left_20 padding_bottom_15" data-element-id="${elementData.id}">
                <div class="layout_element_speichern_select_input" style="position: relative;">
                    <div class="padding_top_15 width_90">
                        ${spansHTML}
                    </div>
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide">
                        <img src="../images/icon_saved.png" alt="Icon Gespeichert">
                    </span>
                </div>
            </div>
        `;

	} else if (elementData.elementType === 'input(number)') {
		var text = ``;
		if(elementData.auswahl != '') {
			 text = elementData.auswahl;
		} else {
			text = elementData.value;
		}
        elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <div class="layout_element_speichern_select_input">
                    <input type="number" id="${elementData.src_columnname}_id" name="${elementData.src_columnname}" class="input_element width_100 element_input_number_speichern" value="${text}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            </div>
        `;

	} else if (elementData.elementType === 'input(number_layout_halb)') {
		var text = ``;
		if(elementData.auswahl != '') {
			text = elementData.auswahl;
		} else {
			text = elementData.value;
		}
		
		var zusatzText = ``;
		if(elementData.id == '187') { //Zusatztext bei Kunden -> Exportlimit fuer Firmendatensaetze
			zusatzText = `<div class="padding_left_20 padding_top_10">
			<p class="fliesstext_12 hinweis-rot">Dieses Feld regelt die maximale Anzahl der exportierbaren Firmendatensätze.<br>Das Limit greift nur, wenn ausschließlich Firmendaten (keine Stellenanzeigen) exportiert werden.</p>
			</div>`;
		} else if(elementData.id == '188') {//Zusatztext bei Kunden-> Exportlimit fuer Stellenanzeigen
			zusatzText = `<div class="padding_left_20 padding_top_10">
			<p class="fliesstext_12 hinweis-rot">Dieses Feld steuert die Anzahl der exportierbaren Stellenanzeigen-Datensätze (ggf. inklusive der zugehörigen Firmendatensätze).<br>
			Das Limit tritt in Kraft, wenn Stellenanzeigen oder Stellenanzeigen zusammen mit Firmendaten exportiert werden.</p>
			</div>`;
		} else {
			zusatzText = ``;
		}
		elementHTML = `
			${zusatzText}
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>	
				<div class="layout_element_speichern_select_input">
					<input type="number" id="${elementData.src_columnname}_id" name="${elementData.src_columnname}" placeholder="Zahl" class="input_element width_50 element_input_number_speichern" value="${text}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
					<span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
				</div>
			</div>
		`;

	} else if(elementData.elementType === 'input(number_kundenmanager)') {
		elementHTML = `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
				<div class="layout_element_speichern_select_input">
					<input type="number" id="${elementData.src_columnname}_id" name="${elementData.src_columnname}" class="input_element width_50 element_input_number_speichern" value="${elementData.value}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
					<button type="button" class="button fliesstext_14 ${buttonClass} layout_flex_nowrap width_50" style="justify-content: center" onclick="">
					<img src="../images/icon_arrow_up_right_from_square.png" alt="Icon externer Link" class="padding_right_5">
					Kundenmanager</button>
					<span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
				</div>
			</div>
		`;

	} else if(elementData.elementType === 'input(number_breitengrad)') {
		elementHTML = `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<div class="container_element_2_columns_geschachtelt" style="grid-template-columns: 25% 1fr">
					<label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
					<a id="id_geodaten" onclick="lookupGeoData(${elementData.ziel_id});" class="fliesstext_14 element_link">Geokoordinaten ermitteln</a>
				</div>
				<div class="layout_element_speichern_select_input">
					<input type="number" id="${elementData.src_columnname}_id" name="${elementData.src_columnname}" class="input_element width_100 element_input_number_speichern" value="${elementData.value}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event);">
					<span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
				</div>
			</div>
		`;

    } else if (elementData.elementType === 'select') {
		if (elementData.id == '123' || elementData.id == '438' || elementData.id == '476' || elementData.id == '477') { // Wenn Element Stellenmarktauswahl Print o. Online ist
			const selectedAttributeAlle = elementData.value === "Alle" ? 'selected' : '';
			var optionAlle = `<option value="Alle" ${selectedAttributeAlle}>Alle</option>`;
		} else {
			var optionAlle = ``;
		}

		if(elementData.id == '406' || elementData.id == '476' || elementData.id == '123') {
			var textOnlineQuelle = '<span class="padding_left_10" style="color:var(--dunkles-grau)">inkl. o-sis, o-home%</span>';
		} else {
			var textOnlineQuelle = '';
		}
		
		var funktion_aufruf = 'speichern_pruefen_'+type+'(this, '+elementData.ziel_id+'); visuellesOnChangeFeedback(event)'; // Vorher deklarieren
		var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
		let optionsHTML = optionsArray.map(optionObject => {
			const selectedAttribute = String(optionObject.key) === String(elementData.value) ? 'selected' : '';

			if (elementData.id == '123' || elementData.id == '438' || elementData.id == '476' || elementData.id == '477') { // Wenn Element Stellenmarktauswahl Print o. Online ist
				if (elementData.id == '438') { //print in Kunde
					funktion_aufruf = 'filterCheckboxesPrint()';
					return `<option value="${optionObject.value}" ${selectedAttribute}>${optionObject.value}</option>`;
					
				} else if(elementData.id == '123' || elementData.id == '476'){ //online in Kunde und User
					funktion_aufruf = 'filterCheckboxesOnline()';
					return `<option value="${optionObject.value}" ${selectedAttribute}>${optionObject.value}</option>`;
				}
				
			// wenn key=value sein soll kriegt man halt 2x den selben wert, andernfalls muss man immer ausnehmen definieren
			} else if (elementData.id == '21' || elementData.id == '28' || elementData.id == '10' || elementData.id == '183' || elementData.id == '22' || elementData.id == '346' || elementData.id == '241' || elementData.id == '36' || elementData.id == '174'){//Währung und für alle ander mit fk
				return `<option value="${optionObject.key}" ${selectedAttribute}>${optionObject.value}</option>`;

			} else {
				return `<option value="${optionObject.value}" ${selectedAttribute}>${optionObject.value}</option>`;
			}
		}).join('');
	
		elementHTML = `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<label for="select_${elementData.label}" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label} ${textOnlineQuelle}</label>
				<div class="layout_element_speichern_select_input">
					<div class="input_element input_element_select width_90">
						<select name="${elementData.src_columnname}" id="select_${elementData.label}" class="dropdown_element width_100 fliesstext_14" onchange="${funktion_aufruf}">
							${optionsHTML}
							${optionAlle}
						</select>
					</div>
					<span class="container_saved_element_text layout_flex fliesstext_14 hide">
						<img src="../images/icon_saved.png" alt="Icon Gespeichert">
					</span>
				</div>
			</div>
		`;


    } else if (elementData.elementType === 'select(multiple)') {//mehrere werte auswaehlen (alte zv, extra popup) 
		if (typeof elementData.value === 'string') {
			// Konvertiere den durch Komma getrennten String in ein Array
			elementData.value = elementData.value.split(',');
		}
		var values = Array.isArray(elementData.value) ? elementData.value : [elementData.value];
		var layoutCheckboxes = '';
		var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];

		// Erzeuge die HTML für Checkboxen aus elementData.auswahl
		layoutCheckboxes = optionsArray.map(function(option) {
			var divID = ``;

			//if(elementData.id == '127' || elementData.id == '440' || elementData.id == '145' || elementData.id == '137' || elementData.id == '144' || elementData.id == '146'){
				// Bestimme, ob diese Checkbox markiert sein sollte
				var isChecked = values.includes(option.key.toString()) ? 'checked' : '';
				var onclick = `onclick="auswahl_multiple(this, '${elementData.src_columnname}', ${ziel_id}, '${type}')"`;	
				var inputID = `id="${elementData.src_columnname}_${option.key}"`;
				//divID = `id="${elementData.src_columnname}"`;			
	
			

			return `
				<div class="container_element_2_columns">
					<label class="fliesstext_13">
						<input type="checkbox" class="${elementData.src_columnname}" value="${option.key}" ${isChecked} ${inputID} ${onclick}> ${option.value}
					</label><br>
				</div>
			`;
		}).join('');

		if(elementData.id == '414' || elementData.id == '375' || elementData.id == '94') {
			var isExtraOptionChecked = elementData.value == "" ? 'checked' : '';
			var extraOption = `<div class="container_element_2_columns">
				<label class="fliesstext_13">
						<input type="checkbox" class="${elementData.src_columnname}" value="kein" ${isExtraOptionChecked} id="${elementData.src_columnname}_kein" onclick="auswahl_multiple(this, '${elementData.src_columnname}', ${ziel_id})"> kein
				</label><br>
			</div>`;			
		} else {
			var extraOption = '';
		}
		
		if(values.length > 10) {
			layoutCheckboxes = `<div>${layoutCheckboxes}</div>`;
		}

		// Erzeuge das gesamte HTML Element
		elementHTML = `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<label for="select_${elementData.label}" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
				<div class="layout_element_speichern_select_input" style="position: relative;">
					<div class="input_element input_element_select width_90 checkbox_multi_dropdown_btn" onchange="visuellesOnChangeFeedback(event)" onclick="toggleCheckboxList('dropdown_${elementData.label}')">
						Auswahl
						<span class="checkbox_multi_dropdown_icon"><img src="../images/icon_dropdown_arrow_down.png" alt="Icon Dropdown"></span>
						<div class="checkbox_multi_dropdown schatten" id="dropdown_${elementData.label}">
							${extraOption}
							${layoutCheckboxes}
						</div>
					</div>
					<span class="container_saved_element_text layout_flex fliesstext_14 hide">
						<img src="../images/icon_saved.png" alt="Icon Gespeichert">
					</span>
				</div>
			</div>
		`;
		

    } else if (elementData.elementType === 'input(radio)') {
		if(elementData.auswahl != '') { //wenn in auswahl_sql was ausgewertet wurde
			var optionsHTML = '';
			var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
			optionsHTML = optionsArray.map(option => {
			var isChecked = String(option.key) === String(elementData.value) ? 'checked="checked"' : '';
	
			return `
				<label for="${elementData.label}_${option.key}" class="radiobutton_element_container fliesstext_14">
					${option.value}
					<input type="radio" id="${elementData.label}_${option.key}" name="${elementData.src_columnname}" value="${option.key}" ${isChecked} onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)">
					<span class="radiobutton_element_checkmark"></span>
				</label>
			`;
			}).join('');
	
			elementHTML = `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<p class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</p>
				<div>
					${optionsHTML}
					<span class="container_saved_element_text layout_flex fliesstext_14 hide">
						<img src="../images/icon_saved.png" alt="Icon Gespeichert">
					</span>
				</div>
			</div>
			`;
		} else {
			var checked_ja = "";
			var checked_nein = "";
			if(elementData.id == '11' || elementData.id == '342'){// Elemente die Vertauscht sind. Bspw. heißt das Feld eigentlich inaktiv, ausgegeben wird aber aktiv
				if (elementData.value == "0"){
					checked_ja = 'checked="checked"';
				} else{
					checked_nein = 'checked="checked"';
				}
			} else {
				if (elementData.value == "1"){
					checked_ja = 'checked="checked"';
				} else{
					checked_nein = 'checked="checked"';
				}
			}

			var containerKlasse = ``;
			if(elementData.id == '155' || elementData.id == '156') {
				containerKlasse = `container_element_4_columns`;
			} else {
				containerKlasse = `container_element_2_columns`;

			}
			
			elementHTML = `
				<div class="${containerKlasse}" data-element-id="${elementData.id}">
					<p class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</p>
					<div>
						<label for="${elementData.label}_ja" class="radiobutton_element_container fliesstext_14">ja
							<input type="radio" id="${elementData.label}_ja" name="${elementData.src_columnname}" value="ja" ${checked_ja} onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)">
							<span class="radiobutton_element_checkmark"></span>
						</label>

						<label for="${elementData.label}_nein" class="radiobutton_element_container fliesstext_14">nein
							<input type="radio" id="${elementData.label}_nein" name="${elementData.src_columnname}" value="nein" ${checked_nein} onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)">
							<span class="radiobutton_element_checkmark"></span>
						</label>
						<span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
					</div>
				</div>
			`;
		}
    
    } else if(elementData.elementType === 'input(radio_suche_uebergeben)') {
		if(elementData.auswahl != '') { //wenn in auswahl_sql was ausgewertet wurde
			var optionsHTML = '';
			var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
			
			optionsHTML = optionsArray.map(option => {
			var isChecked = String(option.key) === String(elementData.value) ? 'checked="checked"' : '';
			var extraClass = String(option.key) === 'user_alle' ? 'margin_bottom_20' : '';
	
			return `
			<div class="layout_gridcolumn_2 ${extraClass}">
				<label for="${elementData.label}_${option.key}" class="radiobutton_element_container fliesstext_14">
					${option.value}
					<input type="radio" id="${elementData.label}_${option.key}" name="${elementData.src_columnname}" value="${option.key}" ${isChecked} onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)">
					<span class="radiobutton_element_checkmark"></span>
				</label>
			</div>
			`;
			}).join('');
	
			elementHTML = `
			<div class="container_element_2_columns" style="align-items: start" data-element-id="${elementData.id}">
				<p class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</p>
				<div>
					${optionsHTML}
					<span class="container_saved_element_text layout_flex fliesstext_14 hide">
						<img src="../images/icon_saved.png" alt="Icon Gespeichert">
					</span>
				</div>
			</div>
			`;
		}
	} 
	else if (elementData.elementType === 'input(checkbox)') {
        var checked = "";
            
        if (elementData.id == '124' || elementData.id == '408' || elementData.id == '372') { // Berechtigung Firma Land
			if(elementData.value == 'on' || elementData.value == "") { //wenn das recht beim kunden "on" ergibt, wenn das recht bei der gruppe "" dann waehle die checkbox an
				checked = 'checked';
			} 
            elementHTML = `
                <div class="container_element_2_columns" data-element-id="${elementData.id}">
					<label for="${elementData.label}" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label><br><br>
					<label class="checkbox_element_container fliesstext_14">
							<input type="checkbox" id="${elementData.label}" name="${elementData.src_columnname}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)" ${checked}>
							<span class="checkbox_element_checkmark">Alle</span>
					</label>
                    <div>
                        <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                    </div>
                </div>
            `;

			// elementHTML += `
            // <div class="container_element_1_column">
            //     <div class="market-options-kunden" id="berechtigung_firma_land_${elementData.src_columnname}">
            //     </div>
            // </div>
            // `;
			var selected_class;
			var input_selected;
			if(type === 'Kunde' || type === 'kunden') {
				selected_class = "market-options-kunden";
			} else if (type === 'User' || type === 'user') {
				selected_class = "market-options-user";
			} else if (type === 'Gruppe' || type === 'gruppen') {
				selected_class = "market-options-gruppen";
			}

            elementHTML += `
            <div class="container_element_1_column">
                <div class="${selected_class}" id="berechtigung_firma_land_${elementData.src_columnname}">`;

				var input_selected;
				var input_checked;
				for(var i=0;i<elementData.auswahl.length;i++){
					input_selected = "";
					
					var isCheckedd = elementData.value.includes(elementData.auswahl[i].value.toString());
					if(isCheckedd || elementData.value == 'on' || elementData.value == ""){
						if(type === 'Kunde' || type === 'kunden') {
							input_selected = "land_auswahl_icon_selected";
							input_checked = "checked";
						} else if (type === 'User' || type === 'user') {
							input_selected = "user_stellenmarkt_auswahl_icon_selected";
							input_checked = "checked";
						} else if (type === 'Gruppe' || type === 'gruppen') {
							input_selected = "gruppen_stellenmarkt_auswahl_icon_selected";
							input_checked = "checked";
						}
					}
					
					elementHTML += `
						<label id="label_markt_${elementData.src_columnname}_${elementData.auswahl[i].value}" onclick="auswahl_multiple(this, '${elementData.src_columnname}', ${elementData.ziel_id}, '${type}')" style="cursor:pointer" class="${input_selected}">
							<input type="checkbox" name="market" id="market_${elementData.src_columnname}_${elementData.auswahl[i].value}" value="${elementData.auswahl[i].value}" class="${elementData.src_columnname}" ${input_checked} style="font-weight: 400"> ${elementData.auswahl[i].value}
						</label>
					`;
				}
			
			elementHTML += `
				</div>
			</div>`;

        } else if (elementData.id == '208') {
            if(elementData.value == 0){
                checked = 'checked' ;
            }
            
            elementHTML = `
                <div class="container_element_2_columns" data-element-id="${elementData.id}">
                    <label class="fliesstext_14 element_schnelle_rechte_suche"></label>

                    <div>
                        <label class="checkbox_element_container fliesstext_14">
                            <input type="checkbox" id="${elementData.label}" name="${elementData.src_columnname}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)" ${checked}>
                            <span class="checkbox_element_checkmark">${elementData.label}</span>
                        </label>
                        <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                    </div>
                </div>
            `;

        } else if (elementData.id == '213' || elementData.id == '289' || elementData.id == '426' || elementData.id == '286' || elementData.id == '423' || elementData.id == '315') { //wenn Bundesweit dazuschalten oder Suche nur in Aufgaben/Anforderungen
			if(elementData.value == 1){
                checked = 'checked' ;
            }

            elementHTML = `
                <div class="container_element_2_columns" data-element-id="${elementData.id}">
                    <label class="checkbox_element_container fliesstext_14">
                        <input type="checkbox" id="${elementData.label}" name="${elementData.src_columnname}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)" ${checked}>
                        <span class="checkbox_element_checkmark">${elementData.label}</span>
                    </label> 
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            `;

        } else if(elementData.id == '316' || elementData.id == '54') { //wenn Letzte Ansprechperson der Firma, gefunden vor maximal oder Listung der einzelnen Boersen
			if(elementData.value == 1){
                checked = 'checked' ;
            }

            elementHTML = `
                <div class="container_element_2_columns" data-element-id="${elementData.id}">
				<div></div>
                    <label class="checkbox_element_container fliesstext_14">
                        <input type="checkbox" id="${elementData.label}" name="${elementData.src_columnname}" onchange="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)" ${checked}>
						<span class="checkbox_element_checkmark">${elementData.label}</span>
                    </label> 
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            `;

		} else if (elementData.id == '313' || elementData.id == '507'|| elementData.id == '66'){ //Befristungsarten (i), Beschäftigungsart (i), Mitarbeiter (MA) / Unternehmensgröße Filter
            if (typeof elementData.value === 'string') {
                elementData.value = elementData.value.split(',');
            }
            // Stelle sicher, dass es ein Array ist
            var values = Array.isArray(elementData.value) ? elementData.value : [elementData.value];
            var spansHTML = ``;
            var classNames = ``;
			
            if(values.length >= 2) {
                classNames = `container_element_2_columns padding_0`;
            }
			var spansHTML = '';
			var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
			
			spansHTML = optionsArray.map(option => {
				var isCheckedd = values.includes(option.key.toString());

				return `
				<label class="fliesstext_14 margin_bottom_5">
					<input type="checkbox" value="${option.key}" ${isCheckedd ? 'checked' : ''} class="${elementData.src_columnname}" onclick="auswahl_multiple(this, '${elementData.src_columnname}', ${elementData.ziel_id}, '${type}')"> ${option.value}
				</label>
				`;
			}).join('')
    
            elementHTML = `
                <div class="container_element_2_columns" data-element-id="${elementData.id}">
                    <p class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</p>
                    <div class="${classNames}">
                        ${spansHTML}
                    </div>
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            `;

		} else {
            if (typeof elementData.value === 'string') {
                elementData.value = elementData.value.split(',');
            }
            // Stelle sicher, dass es ein Array ist
            var values = Array.isArray(elementData.value) ? elementData.value : [elementData.value];
            var spansHTML = ``;
            var classNames = ``;
            if(values.length >= 2) {
                classNames = `container_element_2_columns padding_0`;
            } else {
                classNames = `layout_flex`;
    
            }


			var spansHTML = '';
			var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
			
			spansHTML = optionsArray.map(option => {
				var isCheckedd = values.includes(option.key.toString());

				return `
				<label class="fliesstext_14 margin_bottom_5">
					<input type="checkbox" value="${option.key}" ${isCheckedd ? 'checked' : ''}> ${option.value}
				</label>
				`;
			}).join('')
    
            elementHTML = `
                <div class="container_element_2_columns" data-element-id="${elementData.id}">
                    <p class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</p>
                    <div class="${classNames}">
                        ${spansHTML}
                    </div>
                    <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                </div>
            `;
        }         

    } else if (elementData.elementType === 'input(date)') {
		var dateResult='';
		if(elementData.value.length > 0){
			var date = new Date(elementData.value);
			var year = date.getFullYear();
			var month = String(date.getMonth() + 1).padStart(2, '0');
			var day = String(date.getDate()).padStart(2, '0');
			dateResult = `${year}-${month}-${day}`;
		}

        elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
            <label for="${elementData.label}" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <div class="layout_element_speichern_select_input">
                        <div class="width_100">
                            <input type="date" id="${elementData.label}" name="${elementData.src_columnname}" class="input_element width_100 fliesstext_14" value="${dateResult}" onblur="speichern_pruefen_${type}(this, ${elementData.ziel_id}); visuellesOnChangeFeedback(event)">
                        </div>
                        <span class="container_saved_element_text layout_flex fliesstext_14 hide"><img src="../images/icon_saved.png" alt="Icon Gespeichert"></span>
                    </div>
            </div>
        `;

    } else if (elementData.elementType === 'input(einsatzort)') {
		var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
		let optionsHTML = optionsArray.map(optionObject => {
			const selectedAttribute = String(optionObject.key) === String(elementData.value) ? 'selected' : '';
			return `<option value="${optionObject.key}" ${selectedAttribute}>${optionObject.value}</option>`;
		}).join('');
		
		elementHTML = `
		<div class="container_element_1_column" data-element-id="${elementData.id}">
			<div class="layout_element_speichern_select_input">
				<div class="input_element input_element_select">
					<select name="select_alle_einsatzorte" id="select_alle_einsatzorte" class="dropdown_element width_100 fliesstext_14" onchange="visuellesOnChangeFeedback(event)">
						${optionsHTML}
					</select>
				</div>
				<input type="text" name="input_alle_einsatzorte" id="input_alle_einsatzorte" class="input_element width_75" value="${elementData.inputValue || ''}">
			</div>
		</div>
		`;

	}else if(elementData.elementType === 'select_multibutton') { //Sonderfall (Länderauswahl, Sprachenauswahl), multiselect (alte zv)
        if (typeof elementData.value === 'string') {
            elementData.value = elementData.value.split(',');
        }

		var selected_class;
		if(type === 'Kunde' || type === 'kunden') {
			selected_class = "market-options-kunden"; // Setze CSS-Klasse für markierte Quelle
		} else if (type === 'User' || type === 'user') {
			selected_class = "market-options-user";
		} else if (type === 'Gruppe' || type === 'gruppen') {
			selected_class = "market-options-gruppen";
		}

        elementHTML = `
			<div class="container_element_1_column" data-element-id="${elementData.id}">
				<p class="fliesstext_14 padding_bottom_10 element_schnelle_rechte_suche">
					${elementData.label}
				</p>

				<div class="${selected_class}" id="semantische_stellenmaerkte_${elementData.src_columnname}">
            `;
        var input_selected;
		var input_checked;
        for(var i = 0; i < elementData.auswahl.length; i++){
            input_selected = "";
			input_checked = "";
            if (elementData.value.findIndex((element) => element == elementData.auswahl[i].key) >= 0) {
                
				if(type === 'Kunde' || type === 'kunden') {
					input_selected = "land_auswahl_icon_selected"; // Setze CSS-Klasse für markierte Quelle
					input_checked = "checked";
				} else if (type === 'User' || type === 'user') {
					input_selected = "user_stellenmarkt_auswahl_icon_selected";
					input_checked = "checked";
				} else if (type === 'Gruppe' || type === 'gruppen') { 
					input_selected = "gruppen_stellenmarkt_auswahl_icon_selected";
					input_checked = "checked";
				}
            }
            elementHTML += `
				<div>
					<label id="label_markt_${elementData.src_columnname}_${elementData.auswahl[i].key}" class="${input_selected}" for="market_${elementData.src_columnname}_${elementData.auswahl[i].key}" style="cursor:pointer">
						${elementData.auswahl[i].value}
					</label>
					<input type="checkbox" name="market" id="market_${elementData.src_columnname}_${elementData.auswahl[i].key}" class="${elementData.src_columnname}" ${input_checked} style="font-weight: 400" onchange="multiButtonAuswahl(this, '${elementData.src_columnname}', ${elementData.ziel_id}, '${type}')" value="${elementData.auswahl[i].key}">
				</div>
            `;
        }
        elementHTML += `</div>
            </div>`;

    } else if(elementData.elementType === 'button_ansprechpartner_km' || elementData.elementType === 'button_landwehr_speichern') {
		
        var text = ``;
        if(elementData.elementType === 'button_ansprechpartner_km') {
            text = 'Anlegen';
        }
        else if(elementData.elementType === 'button_landwehr_speichern') {
            text = 'Landwehr speichern';
        }

        elementHTML = `
            <div class="container_element_3_columns" data-element-id="${elementData.id}">
                <button id="${elementData.label}_button" type="button" class="button fliesstext_14 ${buttonClass}">${text}</button>
            </div>
        `;

    } else if(elementData.elementType === 'button(download_firmendaten)') {
		if(elementData.auswahl != '') {
			var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
			var optionValue = optionsArray.length > 0 ? optionsArray[0] : '';
			elementHTML = `
			<div class="container_element_2_columns_geschachtelt margin_left_20" data-element-id="${elementData.id}">
				<a href="./exporte/landwehr_abgleich_export.cfm?kundenuuid=${optionValue}" target="_blank">
					<button id="${elementData.label}_button" type="button" class="button button_download_firmendaten width_100">
						<img src="../images/icon_pdf_black.png" alt="Icon PDF" class="padding_right_10">
						${elementData.label}
					</button>
				</a>
            </div>
			`;
		}

	} else if(elementData.elementType === 'button') {
		elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <button id="${elementData.label}_button" type="button" class="button fliesstext_14 ${buttonClass}">test</button>
            </div>
        `;

	} else if(elementData.elementType === 'button_quellen'){
		var buttonsHTML = elementData.auswahl.map(function(button) {
			return `<button type="button" class="button fliesstext_14 margin_right_10 ${buttonClass}" onclick="${button.js_onclick}()">${button.key}</button>`;
		}).join('');

		elementHTML = `
		<div class="container_element_1_column" data-element-id="${elementData.id}">
			<label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
		</div>
		
		<div class="button_gruppe">
			${buttonsHTML}
		</div>
		`;
	} else if(elementData.elementType === 'popup_branchen') {
		if (typeof elementData.value === 'string') {
			elementData.value = elementData.value.split(',');
		}
		var elementePopUp = '';
		var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];
		var farben = ``;
		var selected = ``;
		elementePopUp = optionsArray.map(function(option) {			
			if (option.selected) {
				selected = `SELECTED`;
			} else {
				selected = ``;
			}
			
			if (option.key.length === 1) {
				farben = `background-color: #a2a2a2; color: var(--main-color);`;
			} else if(option.key.length === 3) {
				farben = `background-color: #e0e0e0; color: var(--main-color);`;
			} else if (option.abgearbeitet === true && elementData.id == '133') {
				farben = `background-color: #FF9999; color: var(--main-color);`;
			} else {
				farben = ``;
			}
			
			// Zusammengeführte Rückgabe
			return `
				<li data-value="${option.key}" onclick="togglePopupElement(event, this, '${elementData.src_columnname}', ${elementData.ziel_id}, '${type}')" class="${elementData.src_columnname}" style="${farben}" ${selected}>
					${option.key} ${option.value}
				</li>
			`;
			
		}).join('');
	
		elementHTML = `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<label for="select_${elementData.label}" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
				<div class="layout_element_speichern_select_input" style="position: relative;">
					<div class="input_element input_element_select width_90 checkbox_multi_dropdown_btn" onchange="visuellesOnChangeFeedback(event)" onclick="openPopup(${elementData.id})">
						Auswahl
						<span class="checkbox_multi_dropdown_icon"><img src="../images/icon_dropdown_arrow_down.png" alt="Icon Dropdown"></span>
					</div>
					<div class="popupOverlay invisible_popup">
						<div class="popup">
							<div class="layout_flex padding_top_20 padding_bottom_20" style="justify-content: space-between">
								<p style="text-align:center; flex:1 1 auto"><b>${elementData.label}</b></p>
								<p onclick="closePopup(event)" style="margin-left:auto">OK</p>
							</div>
							<ul class="popupList">
								${elementePopUp}
							</ul>
						</div>
					</div>
					<span class="container_saved_element_text layout_flex fliesstext_14 hide">
						<img src="../images/icon_saved.png" alt="Icon Gespeichert">
					</span>
				</div>
			</div>
		`;
	} else if(elementData.elementType === 'popup_berufsgruppen') {
		var values = Array.isArray(elementData.value) ? elementData.value : [elementData.value];
		var optionsArray = Array.isArray(elementData.auswahl) ? elementData.auswahl : [];

		// Korrekt positionierte Map zum Verwalten der Hierarchie
		const hierarchyMap = {};

		// Checkboxen mit entsprechenden Einrückungen
		optionsArray.forEach(option => {
			const isChecked = option.selected ? 'checked' : '';
			let marginStyle = '';

			if (option.kldb.length === 2) {
				marginStyle = 'style="margin-left: 20px;"'; // Subkategorie
			} else if (option.kldb.length === 3) {
				marginStyle = 'style="margin-left: 40px;"'; // Sub-Sub-Elemente
			}

			const checkboxItem = `
				<li data-ebene="${option.kldb.length}" ${marginStyle}>
					<label class="fliesstext_13">
						<input type="checkbox" 
							value="${option.key}" 
							data-kldb="${option.kldb}"
							class="${elementData.src_columnname} ${option.kldb.length === 1 ? 'oberkategorie' : option.kldb.length === 2 ? 'subkategorie' : 'element'}" 
							${isChecked} 
							onchange="handleCheckboxChangePopupBerufsgruppen(this); auswahl_multiple(this, '${elementData.src_columnname}', ${elementData.ziel_id}, '${type}')"> 
						${option.kldb} ${option.value}
					</label>
				</li>
			`;
			hierarchyMap[option.kldb] = checkboxItem;
		});

		layoutCheckboxes = '<ul>';

		// Hauptkategorien iterieren
		Object.keys(hierarchyMap).forEach(kldb => {
			if (kldb.length === 1) { // Hauptkategorie
				layoutCheckboxes += hierarchyMap[kldb];
				layoutCheckboxes += '<ul>';
				// Subkategorien und Elemente iterieren
				Object.keys(hierarchyMap).forEach(subKldb => {
					if (subKldb.startsWith(kldb) && subKldb.length === 2) { // Subkategorie
						layoutCheckboxes += hierarchyMap[subKldb];
						layoutCheckboxes += '<ul>';
						// Elemente der Subkategorie iterieren
						Object.keys(hierarchyMap).forEach(elemKldb => {
							if (elemKldb.startsWith(subKldb) && elemKldb.length === 3) {
								layoutCheckboxes += hierarchyMap[elemKldb];
							}
						});
						layoutCheckboxes += '</ul>';
					}
				});
				layoutCheckboxes += '</ul>';
			}
		});

		layoutCheckboxes += '</ul>';

		// Erzeuge das gesamte HTML Element
		elementHTML = `
			<div class="container_element_2_columns" data-element-id="${elementData.id}">
				<label for="select_${elementData.label}" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
				<div class="layout_element_speichern_select_input" style="position: relative;">
					<div class="input_element input_element_select width_90 checkbox_multi_dropdown_btn" onclick="openPopup(${elementData.id})">
						Auswahl
						<span class="checkbox_multi_dropdown_icon"><img src="../images/icon_dropdown_arrow_down.png" alt="Icon Dropdown"></span>
					</div>
					<div class="popupOverlay invisible_popup">
						<div class="popup">
							<div class="layout_flex padding_top_20 padding_bottom_20" style="justify-content: space-between">
								<p style="text-align:center; flex:1 1 auto"><b>${elementData.label}</b></p>
								<p onclick="closePopup(event)" style="margin-left:auto">OK</p>
							</div>
							<ul id="popupList">
								${layoutCheckboxes}
							</ul>
						</div>
					</div>
					<span class="container_saved_element_text layout_flex fliesstext_14 hide">
						<img src="../images/icon_saved.png" alt="Icon Gespeichert">
					</span>
				</div>
			</div>
		`;

	} else {
        elementHTML = `
            <div class="container_element_2_columns" data-element-id="${elementData.id}">
                <label for="${elementData.label}_id" class="fliesstext_14 element_schnelle_rechte_suche">${elementData.label}</label>
                <div class="layout_element_speichern_select_input">
                    <p style="color:red">${elementData.elementType} noch nicht vorhanden.</p>
                </div>
            </div>
        `;

    }
    return elementHTML;
}

function fuegeAndZuTextfeldHinzu(element_id) {
	var textElement = element_id;
	var textElementValue = element_id.value;
	
	if (textElementValue != "" && !textElementValue.trim().endsWith("AND")) {
		textElement.value = textElementValue.trim() + " AND";
	}
}

function fuegeOrZuTextfeldHinzu(element_id) {
	var textElement = element_id;
	var textElementValue = element_id.value;
	
	if (textElementValue != "" && !textElementValue.trim().endsWith("OR")) {
		textElement.value = textElementValue.trim() + " OR";
	}
}

function openPopup(element_id) {
	var el = $(`[data-element-id="${element_id}"] .popupOverlay`).get(0);
	el.classList.add('schatten');
    el.classList.remove('invisible_popup');
}

function closePopup(event) {
	var el = $(event.target).parents('.popupOverlay').get(0);
	el.classList.remove('schatten');
    el.classList.add('invisible_popup');
}

function togglePopupElement(event, el, columnname, ziel_id, type) {
	var element = event.target || this;

    // Überprüfe und ändere das 'selected' Attribut
    if (element.hasAttribute('selected')) {
        element.removeAttribute('selected');
    } else {
        element.setAttribute('selected', '');
    }

    // Wenn zuvor keine Originalfarbe gespeichert wurde, speichere die aktuelle Farbe
    if (!element.dataset.originalBg) {
        element.dataset.originalBg = el.style.backgroundColor || 'var(--white)';
        element.dataset.originalColor = el.style.color || 'inherit';
    }

    // Basierend auf dem 'selected'-Attribut die Farben anpassen
    if (element.hasAttribute('selected')) {
        element.style.backgroundColor = '#1967D2';
        element.style.color = 'var(--white)';
    } else {
        element.style.backgroundColor = element.dataset.originalBg;
        element.style.color = element.dataset.originalColor;
    }

	var element_id = $(el).parents('[data-element-id]').data().elementId;

	var selectedValues = Array.from(document.querySelectorAll('.'+columnname+'[selected]'))
	.map(function(el) {
		return el.dataset.value;
	})
	.join(',');

	speichern_kunden(columnname, selectedValues, ziel_id, element_id);
}

function handleCheckboxChangePopupBerufsgruppen(checkbox) {
	const kldb = checkbox.getAttribute('data-kldb');
    const isChecked = checkbox.checked;

    const childCheckboxes = document.querySelectorAll(`input[type="checkbox"][data-kldb^="${kldb}"]`);

    childCheckboxes.forEach(child => {
        if (child.getAttribute('data-kldb').startsWith(kldb) && child.getAttribute('data-kldb').length > kldb.length) {
            child.checked = isChecked;
        }
    });
}

function lookupGeoData(kunden_fk) {
	var land = document.getElementById("select_Land").value;
	if (land == "A") {
		land = "AT";
	}
	if (land == "D") {
		land = "DE";
	}
	if (land == "F") {
		land = "FR";
	}

	var ort = document.getElementById("ort_id").value;
	var plz = document.getElementById("plz_id").value;
	
	var parameter = {
		"ort" : ort,
		"plz": plz,
		"land": land
	};

	$.ajax({
		data:  parameter,
		type: "post",
		url: "openmaps_laden.cfm",
		dataType: "json",
		success: function(response){
			if (response == "error") {
				alert ("Nich gefunden");
			}
			else {
				var weiter = 0;
				if (response[0].lat.toString().length > 0){
					weiter++;	
				}										
				if (response[0].lon.toString().length > 0){
					weiter++;
				}
				if (weiter == 2) {
					var lat = response[0].lat + "";
					var lng = response[0].lon + "";
					lat = lat.substr(0, 15);
					lng = lng.substr(0, 15);	
					
					$.get(`geodaten_speichern.cfm?id=${kunden_fk}&b=${lat}&l=${lng}`,
					function(){
						var latEle = document.querySelector('[data-element-id="8"] input[type="number"]');
						var lngEle = document.querySelector('[data-element-id="9"] input[type="number"]');
						latEle.value = lat;
						lngEle.value = lng;
						visuellesOnChangeFeedback({currentTarget: latEle});
						visuellesOnChangeFeedback({currentTarget: lngEle});
					},'html').fail(function(){
						alert('Fehler beim Speichern der Geokoordinaten');
					});
				}
			}
		},
		error: function (xhr,status,error){
			alert(error);
		}	
	});
}

function multiButtonAuswahl(objekt, columnname, ziel_id, type) {
	if (!objekt) {
        alert("Error(1)");
        return;
    }

	objekt = $(objekt);
	var element_id = objekt.parents('[data-element-id]').data().elementId;

	var selectedValues = "";
	objekt.parents('[data-element-id]').find('input[type="checkbox"]:checked').each((index, ele) => {
		if(selectedValues.length <= 0){
			selectedValues = ele.value;
			return;
		}
		selectedValues = `${selectedValues},${ele.value}`;
	});

	var labelEle = objekt.parent().find(`[for="${objekt.attr('id')}"]`);
	if(objekt.prop('checked')){
		labelEle.addClass('user_stellenmarkt_auswahl_icon_selected');
	}else{
		labelEle.removeClass('user_stellenmarkt_auswahl_icon_selected');
	}

	if(type === 'Kunde' || type === 'kunden') {
		speichern_kunden(columnname, selectedValues, ziel_id, element_id);
	} else if (type === 'User' || type === 'user') {
		speichern_user(columnname, selectedValues, ziel_id, element_id);
	} else if (type === 'Gruppe' || type === 'gruppen') {
		speichern_gruppen(columnname, selectedValues, ziel_id, element_id);
	}
}

// ToDo
function auswahl_multiple(objekt, columnname, ziel_id, type) {
    if (!objekt) {
        alert("Error(1)");
        return;
    }

	if(type === 'Kunde' || type === 'kunden') {
		var input_selected = "land_auswahl_icon_selected"; // Setze CSS-Klasse für markierte Quelle
	} else if (type === 'User' || type === 'user') {
		var input_selected = "user_stellenmarkt_auswahl_icon_selected";
	} else if (type === 'Gruppe' || type === 'gruppen') { 
		var input_selected = "gruppen_stellenmarkt_auswahl_icon_selected";
	}

	var selectedValues = $('.'+columnname+':checked').map(function() {

		if(columnname == 'r_firmen_land' || columnname== 'r_semantic_1' || columnname== 'r_semantic_2' || columnname== 'r_semantic_3' || columnname== 'r_semantic_4' || columnname== 'r_semantic_5'){
			$("#" + objekt.id).addClass(input_selected);
		}
		
        return this.value;
    }).get().join(',');
	console.log("selectedValues : " + selectedValues);

	var element_id = $(objekt).parents('[data-element-id]').data().elementId;
	console.log("element_id : " + element_id);

	if(columnname == 'r_exportfelder' || columnname== 'r_exportformate'){ //Werte in DB als Array z.B.: {1,2,3,4,.....}
		selectedValues = '{'+selectedValues+'}';
	}

	if(type === 'Kunde' || type === 'kunden') {
		speichern_kunden(columnname, selectedValues, ziel_id, element_id);
	} else if (type === 'User' || type === 'user') {
		speichern_user(columnname, selectedValues, ziel_id, element_id);
	} else if (type === 'Gruppe' || type === 'gruppen') {
		speichern_gruppen(columnname, selectedValues, ziel_id, element_id);
	}
}


function bestaetigung_praefix(){
	if ($('#bestaetigung_praefix').is(':checked')) {
		$('#bestaetigung_praefix_weiter').prop('disabled',false);
	}else{
		$('#bestaetigung_praefix_weiter').prop("disabled",true);
	}
};

// ToDo Präfix Dialog aus den alten ZV
function praefix_pruefen_existenz_bearbeiten(){	
	if ($('#user_praefix_id').val().length) {
		$.ajax({
			data: {'wert' : $('#user_praefix_id').val(), 'kunde' : 'neu_angelegt'},
			async: false,
			type: "post",
			cache: "false",
			url: "praefix_pruefen_existenz.cfm",
			dataType: "html",
			success: function(response){
				if (response.trim() != 'OK') {
					$("#meldung_praefix_bearbeiten_existenz").removeClass("meldung_ausblenden");
					$("#idokneukunde").prop('disabled',true);
					
				}else{
					$("#meldung_praefix_bearbeiten_existenz").addClass("meldung_ausblenden");
					$("#idokneukunde").prop('disabled',false);
				}
			}
		});
	}
}


// KUNDE Speichern
function speichern_pruefen_kunden(object, ziel_id) {
    if (object) {
		var element_id = $(object).parents('[data-element-id]').data().elementId;
		// ToDo Präfix Dialog aus den alten ZV
		if (object.name == "user_praefix") {
			$('#dialog_praefix_bearbeiten').removeClass('invisible_popup'); // Dialog anzeigen
			return;
		}

        if (object.name == "plz" && isNaN(object.value)) {
            alert('Bitte nur Ziffern eingeben.');
            object.value = "";
            return;
        }

		// Aktiv/Inaktiv
		if (object.name == "inaktiv") {   
			if(object.value == 'nein'){
            	object.value = 'ja';
			} else if(object.value == 'ja'){
				object.value ='nein';
			}
        }

		//r_regierungsbezirk
		if (object.name == "r_regierungsbezirk") {  
			if (object.checked) {
				object.value = 0;
			}
			else {
				object.value = 1;
			}
		}

		//r_regierungsbezirk
		if (object.name == "r_bundesweit_dazuschalten") {  
			if (object.checked) {
				object.value = 1;
			}
			else {
				object.value = 0;
			}
		}

		//r_regierungsbezirk
		if (object.name == "ausschluss_persdienst_voreinstellung" || object.name == "ausschluss_bg_bhg_voreinstellung") {  
			if(object.value == 'nein'){
            	object.value = 'off';
			} else if(object.value == 'ja'){
				object.value ='on';
			}
		}
		
        var wert = object.value.trim();

		// Für Radio-Buttons (ja/nein)
		if(wert == 'nein'){
			wert = 0;
		} else if(wert == 'ja'){
			wert = 1;
		}
        object.value = wert;


        speichern_kunden(object.name, wert, ziel_id, element_id);
    } else {
        alert("Error(2)");
    }
}

function speichern_kunden(feld, wert, ziel_id, element_id) {
    var url = "kunden_bearbeiten_speichern.cfm?id="+ziel_id;

    var data = {
        "feld": feld,
        "wert": wert,
        "element_id": element_id
    };

    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        dataType: "html",
        success: function(data) {
        },
        error: function(xhr, status, error) {
			$('#error_container').html(xhr.responseText);
        }
    });
}

// USER Speichern
function speichern_pruefen_user(object, ziel_id) {
    if (object) {
		var element_id = $(object).parents('[data-element-id]').data().elementId;
        if (object.name == "plz" && isNaN(object.value)) {
            alert('Bitte nur Ziffern eingeben.');
            object.value = "";
            return;
        }

        var wert = object.value.trim();
		// Für Radio-Buttons (ja/nein)
		if(wert == 'nein'){
			wert = 0;
		} else if(wert == 'ja'){
			wert = 1;
		}
        object.value = wert;

        speichern_user(object.name, wert, ziel_id, element_id);
    } else {
        alert("Error(2)");
    }
}
function speichern_user(feld, wert, ziel_id, element_id) {
    var url = "user_bearbeiten_speichern.cfm?id="+ziel_id;

    var data = {
        "feld": feld,
        "wert": wert,
        "element_id": element_id
    };

    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        dataType: "html",
        success: function(data) {
        },
        error: function(xhr, status, error) {
			$('#error_container').html(xhr.responseText);
        }
    });
}




// Globale Variablen
let selectedLetters = new Set();

// Funktion zum Umschalten der ausgewählten Buchstaben
function toggleLetter(letterElement) {
    var letter = letterElement.textContent;
    if (selectedLetters.has(letter)) {
        selectedLetters.delete(letter);
        letterElement.classList.remove('selected_checkbox_item_quellen');
    } else {
        selectedLetters.add(letter);
        letterElement.classList.add('selected_checkbox_item_quellen');
    }
    filterCheckboxesPrint(); // Nach dem Umschalten den Filter aufrufen
}
// Hauptfilterfunktion
function filterCheckboxesPrint() {
	var checkboxes = document.querySelectorAll('.checkbox_item_quellen_print');
    var searchInput = document.getElementById('printquellen_suche');
    var countrySelect = document.getElementById('select_Stellenmarktauswahl');
    var searchValue = searchInput.value.toLowerCase();
    var selectedCountry = countrySelect.value;

    checkboxes.forEach(label => {
        var labelValue = label.dataset.quelle.toLowerCase();
        var labelCountry = label.dataset.land;
        var startsWithSelected = Array.from(selectedLetters).some(letter => labelValue.startsWith(letter.toLowerCase()));

        if ((selectedLetters.size === 0 || startsWithSelected) &&
            (searchValue === '' || labelValue.includes(searchValue)) &&
            (selectedCountry === 'Alle' || labelCountry === selectedCountry)) {
			$(label).removeClass('checkbox_item_quellen_display_none');

        } else {
            $(label).addClass('checkbox_item_quellen_display_none');
        }
    });
}


// Globale Variablen
let selectedArt_kurzs = new Set();

// Funktion zum Umschalten der Art
function toggleArt(art_kurzElement) {

    var art_kurz = art_kurzElement.dataset.value;
    if (selectedArt_kurzs.has(art_kurz)) {
        selectedArt_kurzs.delete(art_kurz);
        art_kurzElement.classList.remove('selected_checkbox_item_quellen');
    } else {
        selectedArt_kurzs.add(art_kurz);
        art_kurzElement.classList.add('selected_checkbox_item_quellen');
    }
    filterCheckboxesOnline(); // Nach dem Umschalten den Filter aufrufen
}

// Hauptfilterfunktion
function filterCheckboxesOnline() {
    var checkboxes = document.querySelectorAll('.checkbox_item_quellen_online');
    var searchInput = document.getElementById('onlinequellen_suche');
    var countrySelect = document.getElementById('select_Stellenmarktauswahl inkl. o-sis, o-home%');
    var searchValue = searchInput.value.toLowerCase();
    var selectedCountry = countrySelect.value;

    checkboxes.forEach(label => {
        var labelValue = label.dataset.quelle.toLowerCase();
        var labelCountry = label.dataset.land;
        var labelArt = label.dataset.art_kurz;

        var artSelected = selectedArt_kurzs.has(labelArt);

        if ( (selectedArt_kurzs.size === 0 || artSelected || selectedArt_kurzs.has('alle')) && (searchValue === '' || labelValue.includes(searchValue)) &&
            (selectedCountry === 'Alle' || labelCountry === selectedCountry)) {
            $(label).removeClass('checkbox_item_quellen_display_none');

        } else {
            $(label).addClass('checkbox_item_quellen_display_none');
        }
    });
}

function zugangsdaten_verschicken_user(kunden_id,login_id) {
	var r = confirm("Wollen Sie wirklich eine E-Mail mit den Zugangsdaten verschicken?");
	if (r == true) {
		$.ajax({
			type: "get",
			url: `cronjobs/zugangsdaten_verschicken.cfm?kunden_fk=${kunden_id}&login_id=${login_id}`,
			dataType: "html",
			success: function(response) {alert("E-Mail wurde an " + response.trim() + " User verschickt")},
			error: function (xhr,status,error) {alert("Error")},
			cache: false
		});
	}
}	