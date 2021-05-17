/**
 * This script contains functions that need to be run in the context of the webpage
 */

if (!window.Store) {
    (function () {
        function getStore(modules) {
        let foundCount = 0;
		let neededObjects = [
                { id: "Store", conditions: (module) => (module.default && module.default.Chat && module.default.Msg) ? module.default : null },
                { id: "MediaCollection", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.processAttachments) ? module.default : null },
                { id: "MediaProcess", conditions: (module) => (module.BLOB) ? module : null },
                { id: "Wap", conditions: (module) => (module.createGroup) ? module : null },
                { id: "ServiceWorker", conditions: (module) => (module.default && module.default.killServiceWorker) ? module : null },
                { id: "State", conditions: (module) => (module.STATE && module.STREAM) ? module : null },
                { id: "WapDelete", conditions: (module) => (module.sendConversationDelete && module.sendConversationDelete.length == 2) ? module : null },
                { id: "Conn", conditions: (module) => (module.default && module.default.ref && module.default.refTTL) ? module.default : null },
                { id: "WapQuery", conditions: (module) => (module.queryExist) ? module : ((module.default && module.default.queryExist) ? module.default : null) },
                { id: "CryptoLib", conditions: (module) => (module.decryptE2EMedia) ? module : null },
                { id: "OpenChat", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.openChat) ? module.default : null },
                { id: "UserConstructor", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null },
                { id: "SendTextMsgToChat", conditions: (module) => (module.sendTextMsgToChat) ? module.sendTextMsgToChat : null },
                { id: "SendSeen", conditions: (module) => (module.sendSeen) ? module.sendSeen : null },
                { id: "sendDelete", conditions: (module) => (module.sendDelete) ? module.sendDelete : null },
                { id: "Label", conditions: module => (module.LABEL_PROPERTIES) ? module.default: null }
            ];
        for (let idx in modules) {
            if ((typeof modules[idx] === "object") && (modules[idx] !== null)) {
                neededObjects.forEach((needObj) => {
                    if (!needObj.conditions || needObj.foundedModule)
                        return;
                    let neededModule = needObj.conditions(modules[idx]);
                    if (neededModule !== null) {
                        foundCount++;
                        needObj.foundedModule = neededModule;
                    }
                });

                if (foundCount == neededObjects.length) {
                    break;
                }
            }
        }

        let neededStore = neededObjects.find((needObj) => needObj.id === "Store");
        window.Store = neededStore.foundedModule ? neededStore.foundedModule : {};
        neededObjects.splice(neededObjects.indexOf(neededStore), 1);
        neededObjects.forEach((needObj) => {
            if (needObj.foundedModule) {
                window.Store[needObj.id] = needObj.foundedModule;
            }
        });
		
		window.Store.Chat.modelClass.prototype.sendMessage = function (e) {
			window.Store.SendTextMsgToChat(this, ...arguments);
		}		
		
        return window.Store;
    }

        if (typeof webpackJsonp === 'function') {
            webpackJsonp([], {'parasite': (x, y, z) => getStore(z)}, ['parasite']);
        } else {
            let tag = new Date().getTime();
			webpackChunkbuild.push([
				["parasite" + tag],
				{

				},
				function (o, e, t) {
					let modules = [];
					for (let idx in o.m) {
						let module = o(idx);
						modules.push(module);
					}
					getStore(modules);
				}
			]);
        }

    })();
}


window._X_ = {
    lastRead: {}
};

window._X_._serializeRawObj = (obj) => {
    if (obj) {
        return obj.toJSON();
    }
    return {}
};

window._X_._serializeChatObj = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign(window._X_._serializeRawObj(obj), {
        kind: obj.kind,
        isGroup: obj.isGroup,
        contact: obj['contact'] ? window._X_._serializeContactObj(obj['contact']) : null,
        groupMetadata: obj["groupMetadata"] ? window._X_._serializeRawObj(obj["groupMetadata"]) : null,
        presence: obj["presence"] ? window._X_._serializeRawObj(obj["presence"]) : null,
        msgs: null
    });
};

window._X_._serializeContactObj = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign(window._X_._serializeRawObj(obj), {
        formattedName: obj.formattedName,
        isHighLevelVerified: obj.isHighLevelVerified,
        isMe: obj.isMe,
        isMyContact: obj.isMyContact,
        isPSA: obj.isPSA,
        isUser: obj.isUser,
        isVerified: obj.isVerified,
        isWAContact: obj.isWAContact,
        profilePicThumbObj: obj.profilePicThumb ? _X_._serializeProfilePicThumb(obj.profilePicThumb) : {},
        statusMute: obj.statusMute,
        msgs: null
    });
};

window._X_._serializeMessageObj = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign(window._X_._serializeRawObj(obj), {
        id: obj.id._serialized,
        sender: obj["senderObj"] ? _X_._serializeContactObj(obj["senderObj"]) : null,
        timestamp: obj["t"],
        content: obj["body"],
        isGroupMsg: obj.isGroupMsg,
        isLink: obj.isLink,
        isMMS: obj.isMMS,
        isMedia: obj.isMedia,
        isNotification: obj.isNotification,
        isPSA: obj.isPSA,
        type: obj.type,
        chat: _X_._serializeChatObj(obj['chat']),
        chatId: obj.id.remote,
        quotedMsgObj: _X_._serializeMessageObj(obj['_quotedMsgObj']),
        mediaData: window._X_._serializeRawObj(obj['mediaData'])
    });
};


window._X_._serializeProfilePicThumb = (obj) => {
    if (obj == undefined) {
        return null;
    }

    return Object.assign({}, {
        eurl: obj.eurl,
        id: obj.id,
        img: obj.img,
        imgFull: obj.imgFull,
        raw: obj.raw,
        tag: obj.tag
    });
}

window._X_.getAllChats = function (done) {
    const chats = window.Store.Chat.map((chat) => _X_._serializeChatObj(chat));

    if (done !== undefined) done(chats);
    return chats;
};

window._X_.isoCountries = {
    'AF' : 'Afghanistan',
    'AX' : 'Aland Islands',
    'AL' : 'Albania',
    'DZ' : 'Algeria',
    'AS' : 'American Samoa',
    'AD' : 'Andorra',
    'AO' : 'Angola',
    'AI' : 'Anguilla',
    'AQ' : 'Antarctica',
    'AG' : 'Antigua And Barbuda',
    'AR' : 'Argentina',
    'AM' : 'Armenia',
    'AW' : 'Aruba',
    'AU' : 'Australia',
    'AT' : 'Austria',
    'AZ' : 'Azerbaijan',
    'BS' : 'Bahamas',
    'BH' : 'Bahrain',
    'BD' : 'Bangladesh',
    'BB' : 'Barbados',
    'BY' : 'Belarus',
    'BE' : 'Belgium',
    'BZ' : 'Belize',
    'BJ' : 'Benin',
    'BM' : 'Bermuda',
    'BT' : 'Bhutan',
    'BO' : 'Bolivia',
    'BA' : 'Bosnia And Herzegovina',
    'BW' : 'Botswana',
    'BV' : 'Bouvet Island',
    'BR' : 'Brazil',
    'IO' : 'British Indian Ocean Territory',
    'BN' : 'Brunei Darussalam',
    'BG' : 'Bulgaria',
    'BF' : 'Burkina Faso',
    'BI' : 'Burundi',
    'KH' : 'Cambodia',
    'CM' : 'Cameroon',
    'CA' : 'Canada',
    'CV' : 'Cape Verde',
    'KY' : 'Cayman Islands',
    'CF' : 'Central African Republic',
    'TD' : 'Chad',
    'CL' : 'Chile',
    'CN' : 'China',
    'CX' : 'Christmas Island',
    'CC' : 'Cocos (Keeling) Islands',
    'CO' : 'Colombia',
    'KM' : 'Comoros',
    'CG' : 'Congo',
    'CD' : 'Congo, Democratic Republic',
    'CK' : 'Cook Islands',
    'CR' : 'Costa Rica',
    'CI' : 'Cote D\'Ivoire',
    'HR' : 'Croatia',
    'CU' : 'Cuba',
    'CY' : 'Cyprus',
    'CZ' : 'Czech Republic',
    'DK' : 'Denmark',
    'DJ' : 'Djibouti',
    'DM' : 'Dominica',
    'DO' : 'Dominican Republic',
    'EC' : 'Ecuador',
    'EG' : 'Egypt',
    'SV' : 'El Salvador',
    'GQ' : 'Equatorial Guinea',
    'ER' : 'Eritrea',
    'EE' : 'Estonia',
    'ET' : 'Ethiopia',
    'FK' : 'Falkland Islands (Malvinas)',
    'FO' : 'Faroe Islands',
    'FJ' : 'Fiji',
    'FI' : 'Finland',
    'FR' : 'France',
    'GF' : 'French Guiana',
    'PF' : 'French Polynesia',
    'TF' : 'French Southern Territories',
    'GA' : 'Gabon',
    'GM' : 'Gambia',
    'GE' : 'Georgia',
    'DE' : 'Germany',
    'GH' : 'Ghana',
    'GI' : 'Gibraltar',
    'GR' : 'Greece',
    'GL' : 'Greenland',
    'GD' : 'Grenada',
    'GP' : 'Guadeloupe',
    'GU' : 'Guam',
    'GT' : 'Guatemala',
    'GG' : 'Guernsey',
    'GN' : 'Guinea',
    'GW' : 'Guinea-Bissau',
    'GY' : 'Guyana',
    'HT' : 'Haiti',
    'HM' : 'Heard Island & Mcdonald Islands',
    'VA' : 'Holy See (Vatican City State)',
    'HN' : 'Honduras',
    'HK' : 'Hong Kong',
    'HU' : 'Hungary',
    'IS' : 'Iceland',
    'IN' : 'India',
    'ID' : 'Indonesia',
    'IR' : 'Iran, Islamic Republic Of',
    'IQ' : 'Iraq',
    'IE' : 'Ireland',
    'IM' : 'Isle Of Man',
    'IL' : 'Israel',
    'IT' : 'Italy',
    'JM' : 'Jamaica',
    'JP' : 'Japan',
    'JE' : 'Jersey',
    'JO' : 'Jordan',
    'KZ' : 'Kazakhstan',
    'KE' : 'Kenya',
    'KI' : 'Kiribati',
    'KR' : 'Korea',
    'KW' : 'Kuwait',
    'KG' : 'Kyrgyzstan',
    'LA' : 'Lao People\'s Democratic Republic',
    'LV' : 'Latvia',
    'LB' : 'Lebanon',
    'LS' : 'Lesotho',
    'LR' : 'Liberia',
    'LY' : 'Libyan Arab Jamahiriya',
    'LI' : 'Liechtenstein',
    'LT' : 'Lithuania',
    'LU' : 'Luxembourg',
    'MO' : 'Macao',
    'MK' : 'Macedonia',
    'MG' : 'Madagascar',
    'MW' : 'Malawi',
    'MY' : 'Malaysia',
    'MV' : 'Maldives',
    'ML' : 'Mali',
    'MT' : 'Malta',
    'MH' : 'Marshall Islands',
    'MQ' : 'Martinique',
    'MR' : 'Mauritania',
    'MU' : 'Mauritius',
    'YT' : 'Mayotte',
    'MX' : 'Mexico',
    'FM' : 'Micronesia, Federated States Of',
    'MD' : 'Moldova',
    'MC' : 'Monaco',
    'MN' : 'Mongolia',
    'ME' : 'Montenegro',
    'MS' : 'Montserrat',
    'MA' : 'Morocco',
    'MZ' : 'Mozambique',
    'MM' : 'Myanmar',
    'NA' : 'Namibia',
    'NR' : 'Nauru',
    'NP' : 'Nepal',
    'NL' : 'Netherlands',
    'AN' : 'Netherlands Antilles',
    'NC' : 'New Caledonia',
    'NZ' : 'New Zealand',
    'NI' : 'Nicaragua',
    'NE' : 'Niger',
    'NG' : 'Nigeria',
    'NU' : 'Niue',
    'NF' : 'Norfolk Island',
    'MP' : 'Northern Mariana Islands',
    'NO' : 'Norway',
    'OM' : 'Oman',
    'PK' : 'Pakistan',
    'PW' : 'Palau',
    'PS' : 'Palestinian Territory, Occupied',
    'PA' : 'Panama',
    'PG' : 'Papua New Guinea',
    'PY' : 'Paraguay',
    'PE' : 'Peru',
    'PH' : 'Philippines',
    'PN' : 'Pitcairn',
    'PL' : 'Poland',
    'PT' : 'Portugal',
    'PR' : 'Puerto Rico',
    'QA' : 'Qatar',
    'RE' : 'Reunion',
    'RO' : 'Romania',
    'RU' : 'Russian Federation',
    'RW' : 'Rwanda',
    'BL' : 'Saint Barthelemy',
    'SH' : 'Saint Helena',
    'KN' : 'Saint Kitts And Nevis',
    'LC' : 'Saint Lucia',
    'MF' : 'Saint Martin',
    'PM' : 'Saint Pierre And Miquelon',
    'VC' : 'Saint Vincent And Grenadines',
    'WS' : 'Samoa',
    'SM' : 'San Marino',
    'ST' : 'Sao Tome And Principe',
    'SA' : 'Saudi Arabia',
    'SN' : 'Senegal',
    'RS' : 'Serbia',
    'SC' : 'Seychelles',
    'SL' : 'Sierra Leone',
    'SG' : 'Singapore',
    'SK' : 'Slovakia',
    'SI' : 'Slovenia',
    'SB' : 'Solomon Islands',
    'SO' : 'Somalia',
    'ZA' : 'South Africa',
    'GS' : 'South Georgia And Sandwich Isl.',
    'ES' : 'Spain',
    'LK' : 'Sri Lanka',
    'SD' : 'Sudan',
    'SR' : 'Suriname',
    'SJ' : 'Svalbard And Jan Mayen',
    'SZ' : 'Swaziland',
    'SE' : 'Sweden',
    'CH' : 'Switzerland',
    'SY' : 'Syrian Arab Republic',
    'TW' : 'Taiwan',
    'TJ' : 'Tajikistan',
    'TZ' : 'Tanzania',
    'TH' : 'Thailand',
    'TL' : 'Timor-Leste',
    'TG' : 'Togo',
    'TK' : 'Tokelau',
    'TO' : 'Tonga',
    'TT' : 'Trinidad And Tobago',
    'TN' : 'Tunisia',
    'TR' : 'Turkey',
    'TM' : 'Turkmenistan',
    'TC' : 'Turks And Caicos Islands',
    'TV' : 'Tuvalu',
    'UG' : 'Uganda',
    'UA' : 'Ukraine',
    'AE' : 'United Arab Emirates',
    'GB' : 'United Kingdom',
    'US' : 'United States',
    'UM' : 'United States Outlying Islands',
    'UY' : 'Uruguay',
    'UZ' : 'Uzbekistan',
    'VU' : 'Vanuatu',
    'VE' : 'Venezuela',
    'VN' : 'Viet Nam',
    'VG' : 'Virgin Islands, British',
    'VI' : 'Virgin Islands, U.S.',
    'WF' : 'Wallis And Futuna',
    'EH' : 'Western Sahara',
    'YE' : 'Yemen',
    'ZM' : 'Zambia',
    'ZW' : 'Zimbabwe'
};

var TRIAL = true;
var FORMAT_NUMBERS = true;
var COUNTRY_NAME = true;
var EXCLUDE_SELF = false;

window._X_.createRow = function(row){
    row = row.map(el => `"${el}"`);
    row = row.join(",").concat("\n");
    return row;
}

window._X_.downloadAsCSV = function (groupName, contacts){
    var fileName = groupName.replace(/[^\d\w\s]/g,'') ? groupName.replace(/[^\d\w\s]/g,'') : 'WAXP-group-members';
    const d = new Date();
    fileName = `${fileName} ${d.getDate()}-${d.getMonth()}-${d.getFullYear()}.csv`;

    // CSV Header
    var csvHeader = ['Name', 'Phone'];
    if (COUNTRY_NAME) csvHeader.push('Country');
    var data  = window._X_.createRow(csvHeader);

    // const maxLen = TRIAL ? contacts.length/2 : contacts.length; 
    for (i = 0, j = 0;i < contacts.length; ++i) {
        var row = [], phone;
        var name = contacts[i][0];
        var phone_num = contacts[i][1];

        if (name === "undefined"){
            name = `Unknown Contact ${++j}`;
        }

        try {
            if (FORMAT_NUMBERS) {
                phone = libphonenumber.parsePhoneNumber("+" + phone_num);
                phone_num = phone.formatInternational();
            }
        } catch (error) {
            console.log("Failed to parse phone number. Defaulting to non formatted number.")
        }
        row.push(name, phone_num);

        try {
            if (COUNTRY_NAME) {
                var countryCode = phone.country;
                var countryName = window._X_.isoCountries[countryCode];
                row.push(countryName);
            }
        } catch (error) {
            console.log("Failed to get country code.")
            row.push("-");
        }

        data += window._X_.createRow(row);
    }
    var a = document.createElement('a');
    a.style.display = "none";   
    var url = window.URL.createObjectURL(new Blob([data], {
        type: "data:attachment/text"
    }));
    a.setAttribute("href", url);
    a.setAttribute("download", fileName);
    document.body.append(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    hideLoading();
}

function exportContactsFromSelectedLabel(label , allOrUnsaved, namePrefix) {
    var contactsForExport = [];
    showLoading();
    window.Store.WapQuery.queryLabels()
        .then(res => (res.labels.filter(l => l.name == label)))
        .then(res => {
			var y = window.Store.Label._models.filter(t => t.id == res[0].id)[0];
            var groups = new RegExp(/(?<phone_g>[\d]+)-[\d]+@g.us/);
            var chat = new RegExp(/(?<phone_c>[\d]+)@c.us/);
            var finalRe = new RegExp(groups.source + "|" + chat.source);
            var contacts = Array.from(
                new Set(
                    y.labelItemCollection._models.map(
                        m => {
                            var id = m.__x_parentId;
                            if (id.includes("@broadcast")) return false;
                            var e = id.match(finalRe).groups;
                            return e.phone_g || e.phone_c;
                        }
                    )
                )
            );
            // Remove falsy values from array
            contacts = contacts.filter(Boolean);
            
            if (EXCLUDE_SELF) {
                let self = window.Store.Contact._models.filter(t => t.isMe).map(t => t.id.user)[0];
                contacts = contacts.filter(c => c !== self);
            }

            if(allOrUnsaved == 'all'){
                contacts.forEach(c => {
				    var x = window.Store.Contact._models.filter(t => t.id.user === c);
                    let name = namePrefix + (x[0].name || x[0].__x_pushname);
                    contactsForExport.push([name, c])
                });
            }else{
                var un = window.Store.Contact._models.filter(t => !t.isMyContact && !t.isGroup);
                contacts.forEach(c => {
                    var x = un.filter(t => t.id.user === c);
                    if(x.length > 0) { 
                        let name = namePrefix + (x[0].name || x[0].__x_pushname);
                        contactsForExport.push([name, c])
                    }
                });
            }

            if (contactsForExport.length > 0) {
                let fileName = `Label_${label}_${allOrUnsaved}`;
                window._X_.downloadAsCSV(fileName, contactsForExport);
            } else {
                hideLoading();
                alert("No contacts found");
            }
        })
        .catch(err => (
            alert(
                "An error occured when extracting contacts from labels\n" + 
                "If this happens again, contact codegenasite@gmail.com for help with the following details\n\n" + 
                err.stack
            ), 
            hideLoading(),
            console.log(err))
        )   
}

window.addEventListener("message", function (event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {

        TRIAL = event.data.isUsingTrial;
      
        var groupID = window._X_.getAllChats().find(val => val.contact.formattedName.includes(event.data.groupName)).id._serialized;
        var allOrUnsavedLabel = event.data.text.includes('all') ? 'all' : 'unsaved';
        switch(event.data.text){
            case "instant-export-chatlist-all":
            case "instant-export-chatlist-unsaved": (function(){
                var i = 0,
                contacts = window._X_.getAllChats().filter(val => val.id.server == 'c.us');
                if(event.data.text.includes('unsaved')){
                    contacts = contacts.filter(val => !val.contact.isMyContact);
                }
                contacts = contacts.map(e => [event.data.namePrefix + (e.name || e.contact.pushname || `Unknown Contact ${++i}`), e.id.user]);
                window._X_.downloadAsCSV(`ChatList_${allOrUnsavedLabel}`, contacts);
            })()
                break;
            case "instant-export-group-all": 
            case "instant-export-group-unsaved": (function(){
                if(!window.Store.Contact.get(groupID).isGroup)alert("Please select a group to continue.")
                var contacts = window.Store.GroupMetadata.get(groupID).participants;
                if(event.data.text.includes('unsaved')){
                    contacts = contacts.filter(p => !p.contact.__x_isMyContact && !p.contact.__x_isMe)
                }
                contacts = contacts.map((participant) => [event.data.namePrefix + participant.contact.__x_displayName, participant.id.user]);
                if (contacts.length < 1) alert("Couldn't find any unsaved contacts in this group!")
                else (window._X_.downloadAsCSV(`Group_${event.data.groupName}_${allOrUnsavedLabel}`, contacts));
            })() 
                break;
            case "instant-export-label-unsaved":
            case "instant-export-label-all": 
                try {
                    var label = document.querySelector("span[data-icon='label']").parentNode.nextElementSibling.innerText;
                    if(label) exportContactsFromSelectedLabel(label,allOrUnsavedLabel,event.data.namePrefix);
                } catch (error) {
                    alert("Please open the label drawer to continue");
                }
                break;
        }
        window.postMessage({"incrementTrial": true}, "*");
   
    }
});