// Development mode detection and PIN namespace setup
if (typeof Type !== 'undefined' && Type.registerNamespace) {
    // SharePoint Classic uses Type.registerNamespace
    Type.registerNamespace('PIN.Utilities');
} else if (typeof Function !== 'undefined' && Function.registerNamespace) {
    // Some SharePoint versions use Function.registerNamespace
    Function.registerNamespace('PIN.Utilities');
} else {
    // Create PIN namespace if SharePoint functions aren't available
    window.PIN = window.PIN || {};
    window.PIN.Utilities = window.PIN.Utilities || {};
}

// SharePoint Classic site URL
var siteUrl = '';
if (typeof _spPageContextInfo !== 'undefined') {
    siteUrl = _spPageContextInfo.siteServerRelativeUrl || _spPageContextInfo.webServerRelativeUrl || '';
}

// Define missing SharePoint function if not present
if (typeof window !== 'undefined' && typeof window.runtheactualscriptdotdk === 'undefined') {
    window.runtheactualscriptdotdk = function() {
        console.log('SharePoint script ready - YearWheel loading...');
    };
}


// TODO move this to a config file
// Radius of the year wheel
export const monthCircleOutterRadius = 220;
export const monthCirlceInnerRadius = 200;
export const driftCircleRadius = 195;
export const økonomiCircleRadius = 170;
export const produktionCircleRadius = 145;
export const ferieCircleRadius = 120;
export const mønstringCircleRadius = 95;
export const uTCircleRadius = 70;

// Center of the year wheel
export const Cx = 500;
export const Cy = 500;
const R = monthCircleOutterRadius;

// Colors of circles
export const monthCircleColor = "#ececec";
export const driftCircleColor = "#faf7f2";
export const økonomiCircleColor = "#ece7f2";
export const produktionCircleColor = "#e1f2f9";
export const ferieCircleColor = "#eaf5dc";
export const mønstringCircleColor = "#faf2f3";
export const uTCircleColor = "#e5f5fc";

// Colors of the stroke of the circles
export const monthCircleStrokeColor = "#d6d6d6";
export const whiteStrokeColor = "white";

// Colors of the text
export const textColor = "black";
export const dateColor = "white";

// Stroke width
export const strokeWidth_1 = 1;
export const strokeWidth_2 = 2;
export const strokeWidth_4 = 4;
export const strokeWidth_15 = 15;

// Font size
export const fontSize_10 = 10;
export const fontSize_12 = 12;
export const fontSize_13 = 13;
export const fontSize_22 = 22;

// Font family
export const fontFamily = "Arial";

export const onHoverColor = "#0044CC";

let Nx = 0;
let Ny = 0;

export const months = {
    jan: {
        value: 0,
        days: [...Array(32).keys()],
        areas: {}
    },
    feb: {
        value: 1,
        days: [...Array(32).keys()],
        areas: {}
    },
    mar: {
        value: 2,
        days: [...Array(32).keys()],
        areas: {}
    },
    apr: {
        value: 3,
        days: [...Array(32).keys()],
        areas: {}
    },
    maj: {
        value: 4,
        days: [...Array(32).keys()],
        areas: {}
    },
    jun: {
        value: 5,
        days: [...Array(32).keys()],
        areas: {}
    },
    jul: {
        value: 6,
        days: [...Array(32).keys()],
        areas: {}
    },
    aug: {
        value: 7,
        days: [...Array(32).keys()],
        areas: {}
    },
    sep: {
        value: 8,
        days: [...Array(32).keys()],
        areas: {}
    },
    okt: {
        value: 9,
        days: [...Array(32).keys()],
        areas: {}
    },
    nov: {
        value: 10,
        days: [...Array(32).keys()],
        areas: {}
    },
    dec: {
        value: 11,
        days: [...Array(32).keys()],
        areas: {}
    }
};

export const areaLabel = {
    Mønstring: {
        radius: 190 / 2,
        position: 0.125,
        color: "#Eec8cf",
        label: '',
        radius: 190 / 2,
        lineColor: "#e7b2bc"
    },

    Ferie:
    {
        radius: 240 / 2,
        position: 0.1,
        color: "#70A032",
        label: '',
        radius: 240 / 2,
        lineColor: "#71b24d"
    },

    Produktion:
    {
        radius: 290 / 2,
        position: 0.10,
        color: '#4489a4',
        label: '',
        radius: 290 / 2,
        lineColor: "#24addb"
    },

    Økonomi: {
        radius: 340 / 2,
        position: 0.08,
        color: '#A97ae0',
        label: '',
        radius: 340 / 2,
        lineColor: "#8147b8"
    },

    Drift: {
        radius: 390 / 2,
        position: 0.06,
        color: '#F3C67C',
        label: '',
        radius: 390 / 2,
        lineColor: "#ccb433"
    }
};

// This should simulate the dates from the database/ SP LIST    
export const dates = {
}

// This should simulate the links from the database/ SP LIST
export const links = {
    Aktiviteter: [],
    Bestemmelser: [],
    Blanketter: [],
    Info: [],
    Loggen: [],
}

export const labelsAndLinks = [];
var collListItemProcesser;
var collListItemPaneler;
var collListItemLinks;

// Create a list if it does not exist. If it does exist, then call the callback function
// Example: PIN.Utilities.createList('PINCountdown', SP.ListTemplateType.genericList, '["Dato", "date"]');
// Note: customFieledName is an array of tuples <fieldName: string, fieldType: string>
if (typeof PIN !== 'undefined') {
    PIN.Utilities = PIN.Utilities || {};
}
var createList = async function (listTitle, listTemplate, customFieldTuple) {
    var ctx = SP.ClientContext.get_current();
    var web = ctx.get_web();
    var lists = web.get_lists();
    ctx.load(lists);

    // Wrap executeQueryAsync in a promise
    const executeQuery = () => new Promise((resolve, reject) => {
        ctx.executeQueryAsync(resolve, (sender, args) => reject(args.get_message()));
    });

    try {
        await executeQuery();

        var listExists = false;
        var le = lists.getEnumerator();
        var existingList = null;
        while (le.moveNext()) {
            var list = le.get_current();
            // Check if the list exists
            if (list.get_title() == listTitle) {
                listExists = true;
                console.info(`List "${listTitle}" already exists.`)
                existingList = list;
                break;
            }
        }

        if (!listExists) {
            await executeListCreation(listTitle, listTemplate, customFieldTuple);
        } else {
            // Load the fields of the existing list
            var fields = existingList.get_fields();
            ctx.load(fields);

            try {
                await executeQuery();

                // Check if each field in customFieldTuple exists in the list and has the correct type
                for (let fieldTuple of customFieldTuple) {
                    var fieldName = fieldTuple[0];
                    var fieldType = fieldTuple[1];
                    var fieldExists = false;
                    var fieldEnumerator = fields.getEnumerator();
                    var fieldTypeParsed = fieldType;
                    
                    while (fieldEnumerator.moveNext()) {
                        var field = fieldEnumerator.get_current();
                        var title = field.get_title()
                        var type = field.get_fieldTypeKind()

                        if (fieldTypeParsed === 'DateTime') {
                            fieldTypeParsed = 'dateTime'
                        } else if (fieldTypeParsed === 'Choice') {
                            fieldTypeParsed = 'choice'
                        } else if (fieldTypeParsed === 'Lookup') {
                            fieldTypeParsed = 'lookup'
                        }
                        // Check if the field exists and has the correct type
                        if (title === fieldName && type === SP.FieldType.parse(fieldTypeParsed)) {
                            fieldExists = true;
                            break;
                        }
                    }

                    if (!fieldExists) {
                        var fieldSchema = await determineFieldSchema(fieldName, fieldType);
                        var field = list.get_fields().addFieldAsXml(fieldSchema, true, SP.AddFieldOptions.addFieldInternalNameHint);
                        ctx.load(field);

                        try {
                            await executeQuery();
                            console.info(`Field "${fieldName}" created successfully.`);
                        } catch (error) {
                            console.error('Request failed. ' + error);
                        }
                    }
                }

                console.log(`"${listTitle}": All fields exist in the list and have the correct type.`);
            } catch (error) {
                console.log('Error: ' + error);
            }
        }
    } catch (error) {
        console.log("Error in getting Lists: " + error);
    }
}

// Assign to PIN.Utilities (create if needed)
if (typeof window !== 'undefined') {
    window.PIN = window.PIN || {};
    window.PIN.Utilities = window.PIN.Utilities || {};
    window.PIN.Utilities.createList = createList;
} else if (typeof PIN !== 'undefined') {
    PIN.Utilities = PIN.Utilities || {};
    PIN.Utilities.createList = createList;
}

var executeListCreation = async function (listTitle, listTemplate, customFieldTuple) {
    var ctx = new SP.ClientContext.get_current();
    var web = ctx.get_web();
    var rootWeb = ctx.get_site().get_rootWeb();
    var allContentTypeColl = rootWeb.get_contentTypes();

    var listInfo = new SP.ListCreationInformation();
    listInfo.set_title(listTitle);
    listInfo.set_templateType(listTemplate); // SP.ListTemplateType.genericList

    var list = web.get_lists().add(listInfo);

    ctx.load(list);
    ctx.load(allContentTypeColl);

    // Wrap executeQueryAsync in a promise
    const executeQuery = () => new Promise((resolve, reject) => {
        ctx.executeQueryAsync(resolve, (sender, args) => reject(args.get_message()));
    });

    try {
        await executeQuery();

        // Add custom field
        if (customFieldTuple) {
            for (let fieldTuple of customFieldTuple) {
                var customFieldName = fieldTuple[0];
                var customFieldType = fieldTuple[1];

                var fieldSchema = await determineFieldSchema(customFieldName, customFieldType);

                var field = list.get_fields().addFieldAsXml(fieldSchema, true, SP.AddFieldOptions.addFieldInternalNameHint);
                ctx.load(field);

                try {
                    await executeQuery();
                    console.info(`Field "${customFieldName}" created successfully.`);
                } catch (error) {
                    console.error('Request failed. ' + error);
                }
            }

            console.info('All fields created successfully.');
        }
    } catch (error) {
        console.log("Error in creating list: " + error);
    }
}


function determineFieldSchema(customFieldName, customFieldType) {
    return new Promise((resolve, reject) => {
        var fieldSchema = '';

        switch (customFieldType) {
            case 'DateTime':
                fieldSchema = `<Field DisplayName="${customFieldName}" Type="${customFieldType}" />`;
                resolve(fieldSchema);
                break;
            case 'URL':
                fieldSchema = `<Field DisplayName="${customFieldName}" Type="${customFieldType}" />`;
                resolve(fieldSchema);
                break;
            case 'Choice':
                if (customFieldName === 'Prioritet') {
                    var choices = '';
                    for (var i = 0; i <= 5; i++) {
                        choices += `<CHOICE>${i}</CHOICE>`;
                    }
                    fieldSchema = `<Field DisplayName="${customFieldName}" Type="${customFieldType}" Indexed="TRUE" EnforceUniqueValues="TRUE"><CHOICES>${choices}</CHOICES></Field>`;
                } else if (customFieldName === 'Panel') {
                    var choices = '';
                    var options = ["Aktiviteter", "Blanketter", "Info", "Loggen", "Bestemmelser"];
                    for (var i = 0; i < options.length; i++) {
                        choices += `<CHOICE>${options[i]}</CHOICE>`;
                    }
                    fieldSchema = `<Field DisplayName="${customFieldName}" Type="${customFieldType}"><CHOICES>${choices}</CHOICES></Field>`;
                }
                resolve(fieldSchema);
                break;
            case 'Lookup':
                var clientContext = new SP.ClientContext(siteUrl);
                var oList = clientContext.get_web().get_lists().getByTitle('HjuletsLinks');
                clientContext.load(oList, 'Id');
                clientContext.executeQueryAsync(
                    Function.createDelegate(this, function () {
                        var listId = oList.get_id();
                        fieldSchema = `<Field ID='0d41e3db-4e12-4d11-be1f-e9bf857dad19' Type='Lookup' Name='Hjul' StaticName='Hjul' DisplayName='Hjul' List='${listId}' ShowField='Title' />`;
                        resolve(fieldSchema);
                    }),
                    Function.createDelegate(this, function (sender, args) {
                        reject('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
                    })
                );
                break;
            default:
                reject(`Unsupported field type: ${customFieldType}`);
                break;
        }
    });
}

// Retreive the list called 'HjuletsLinks'
export function retrieveLinks() {
    return new Promise((resolve, reject) => {
        var clientContext = new SP.ClientContext(siteUrl);
        var oList = clientContext
            .get_web()
            .get_lists()
            .getByTitle('HjuletsLinks');

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><RowLimit>100</RowLimit></View>');
        collListItemLinks = oList.getItems(camlQuery);
        clientContext.load(collListItemLinks);

        clientContext.executeQueryAsync(
            Function.createDelegate(this, (sender, args) => {
                onLinksQuerySucceeded(sender, args);
                resolve(); // Resolve the promise when the operation is successful
            }),
            Function.createDelegate(this, (sender, args) => {
                onQueryFailed(sender, args);
                reject(); // Reject the promise when the operation fails
            })
        );
    });
}


function onLinksQuerySucceeded(sender, args) {
    var listItemInfo = {};
    var listItemEnumerator = collListItemLinks.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        listItemInfo = {
            Title: oListItem.get_item('Title'),
            Priority: oListItem.get_item('Prioritet'),
            Url: {
                text: oListItem.get_item('Link').get_description(),
                url: oListItem.get_item('Link').get_url()
            },
        }
        labelsAndLinks.push(listItemInfo);
    }
    // Sort the labels and links by priority
    labelsAndLinks.sort((a, b) => parseInt(a.Priority) - parseInt(b.Priority));
    const newLabels = labelsAndLinks.slice(1).map(item => item.Title);
    // Insert the labels and links into the months object
    for (const month in months) {
        insertKeysWithLabels(months[month].areas, newLabels);
    }

    changeDatesWithLabel(dates, newLabels);
    changeKeysWithLabels(areaLabel, newLabels);
}

export function retrievePaneler() {
    return new Promise((resolve, reject) => {
        var clientContext = new SP.ClientContext(siteUrl);
        var oList = clientContext
            .get_web()
            .get_lists()
            .getByTitle('HjuletsPaneler');

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><RowLimit>100</RowLimit></View>');
        collListItemPaneler = oList.getItems(camlQuery);
        clientContext.load(collListItemPaneler);

        clientContext.executeQueryAsync(

            Function.createDelegate(this, (sender, args) => {
                onPanelerQuerySucceeded(sender, args);
                resolve(); // Resolve the promise when the operation is successful 
            }),
            Function.createDelegate(this, (sender, args) => {
                onQueryFailed(sender, args);
                reject(); // Reject the promise when the operation fails
            })
        );
    });
}

function onPanelerQuerySucceeded(sender, args) {
    var listItemInfo = {};
    var listItemEnumerator = collListItemPaneler.getEnumerator();
    let arr = [];
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        listItemInfo = {
            Title: oListItem.get_item('Title'),
            Panel: oListItem.get_item('Panel'),
            Url: {
                text: oListItem.get_item('Url').get_description(),
                url: oListItem.get_item('Url').get_url()
            },
        }
        arr.push(listItemInfo);
    }
    createNintexLink(arr)
}



export function retrieveProcesser() {
    return new Promise((resolve, reject) => {
        var clientContext = new SP.ClientContext(siteUrl);
        var oList = clientContext
            .get_web()
            .get_lists()
            .getByTitle('HjuletsProcesser');

        var camlQuery = new SP.CamlQuery();
        camlQuery.set_viewXml('<View><RowLimit>100</RowLimit></View>');
        collListItemProcesser = oList.getItems(camlQuery);
        clientContext.load(collListItemProcesser);

        clientContext.executeQueryAsync(
            Function.createDelegate(this, (sender, args) => {
                onProcesserQuerySucceeded(sender, args);
                resolve(); // Resolve the promise when the operation is successful
            }),

            Function.createDelegate(this, (sender, args) => {
                onQueryFailed(sender, args)
                reject(); // Reject the promise when the operation fails 
            })
        );
    });
}

function onProcesserQuerySucceeded(sender, args) {
    var listItemInfo = {};
    var listItemEnumerator = collListItemProcesser.getEnumerator();
    let arr = [];
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        listItemInfo = {
            Title: oListItem.get_item('Title'),
            Hjul: oListItem.get_item('Hjul').get_lookupValue(),
            NotifikationDato: oListItem.get_item('NotifikationDato'),
            DeadlineDato: oListItem.get_item('DeadlineDato'),
            Beskrivelse: oListItem.get_item('Beskrivelse'),
            NotifikationMail: oListItem.get_item('NotifikationMail')
        }
        arr.push(listItemInfo);
    }

    createDatesForAreas(arr)
}


function onQueryFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

// getDatesInAreas
const createDatesForAreas = (arr) => {
    arr.forEach(item => {
        let date = item.DeadlineDato;
        let area = item.Hjul;
        let title = item.Title;
        let description = item.Beskrivelse;
        let notificationMail = item.NotifikationMail;
        let notificationDate = item.NotifikationDato;

        if (date != null && area != null && date != "" && area != "" && dates[area]) {
            date = new Date(date)
            dates[area].push({
                title,
                date,
                description: description || '',
                notificationMail: notificationMail || '',
                notificationDate: notificationDate ? new Date(notificationDate) : null
            });

        } else {
            console.log('DeadlineDato eller hjul er null eller tom')
        }
    });
}


const createNintexLink = (arr) => {
    arr.forEach(item => {
        let url = item.Url;
        let panel = item.Panel;

        if (url != null && panel != null && url != "" && panel != "") {

            url.url != "" && item.Title != "" ? links[panel].push({
                url: url.url,
                title: item.Title
            }) :
                links[panel].push({
                    url: 'facebook.com',
                    title: 'undefined'
                })
        } else {
            console.log('Url eller panel er null eller tom')
        }
    });
}

// Insert the labels and links into the months object
function insertKeysWithLabels(obj, labels) {
    labels.forEach(element => {
        obj[element] = { dates: { dates: [], text: "" } };
    });
}

// Change the keys in the object to the labels
function changeKeysWithLabels(obj, labels) {
    // Create a copy of the object
    let objCopy = Object.assign({}, { ...obj });
    const keys = Object.keys(objCopy);
    labels.forEach((element, index) => {
        const oldKey = keys[index];
        // Making a deep copy of the object
        obj[element] = Object.assign({}, objCopy[oldKey]);
        obj[element].label = element;
    });
}

// Change the keys in the object to the labels
function changeDatesWithLabel(obj, labels) {
    labels.forEach(element => {
        obj[element] = [];
    });
}


// Update the dates in the months object
const updateDates = (month, datearray) => {
    for (const area in month.areas) {
        const dates = datearray
            .filter(date => date.date.getMonth() === month.value)
            .map(date => ({
                text: date.title,
                date: date.date
            }));

        month.areas[area].dates = dates;
    }
};


// p is the array of months
export const calcLineCoord = (p) => {

    let retVal = [] // Result
    p.forEach((n, index) => {
        let A = (-90 + (360 / p.length) * (index)) * (Math.PI / 180); // retValult in radians 
        Nx = Cx + R * Math.cos(A); // X = Cx + R * cos(A)
        Ny = Cy + R * Math.sin(A); // Y = Cy + R * sin(A) 

        retVal.push({ month: n, x1: Cx, y1: Cy, x2: Nx, y2: Ny });
    });

    return retVal;
};


// p is the array of months
export const calcTextCoord = (p) => {

    let retVal = [] // Result
    p.forEach((n, index) => {
        //  
        let A = (-90 + (360 / p.length) * (index) + (360 / p.length) / 2) * (Math.PI / 180);// retValult in radians 
        Nx = Cx + R * Math.cos(A); // X = Cx + R * cos(A)
        Ny = Cy + R * Math.sin(A); // Y = Cy + R * sin(A) 

        retVal.push({ month: n, x1: Cx, y1: Cy, x2: Nx, y2: Ny });
    });
    return retVal;
}

export const calcTimelineCoord = (p) => {

    // Get the current date
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const lastDayInYear = new Date(currentYear, 11, 31);


    // Check if the year is a leap year 
    // return how many days there are in the year
    function daysInYear(year) {
        return ((year % 4 === 0 && year % 100 > 0) || year % 400 == 0) ? 366 : 365;
    }

    const daysInCurrentYear = daysInYear(currentYear);

    function dateDiffInDays(a, b) {
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        const date1 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
        const date2 = new Date(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((date2 - date1) / _MS_PER_DAY);
    }


    let x = Cx;
    let y = Cy;


    // Check that currentDate is part of the wheel
    let isInMonth = p.length - 1 >= currentMonth
    if (!isInMonth) {
        return [x, y];
    }

    const avgDaysInMonth = daysInCurrentYear / 12;
    const startDateInYear = new Date(currentYear, 0, 1);

    // The denumorator is the amount of milliseconds in a day
    // avgMonths * p.length is the amount of days in a year.
    // We subtract 90 to get the line to start at the top 
    const daysLeftInYear = dateDiffInDays(currentDate, lastDayInYear);
    const daysPassedInYear = Math.abs(daysInCurrentYear - daysLeftInYear);
    const angleDate = (daysPassedInYear / (avgDaysInMonth * p.length)) * 360 - 90;

    // Calculate the end point of the line
    x = Cx + Cy * Math.cos(angleDate * Math.PI / 180);
    y = Cx + Cy * Math.sin(angleDate * Math.PI / 180);
    x = x + (Cx - x) * 0.56;
    y = y + (Cy - y) * 0.56;

    return [x, y];
}

// Radius determines which
// circle (area/color) the dots are placed on
// p is the array of months
export const calcBubbelDates = (p, month, area) => {
    let A_global = 0;
    const areaPosition = area.position;
    const areaLabel = area.label

    updateDates(month, dates[area.label]);

    const allMonths = [
        "jan",
        "feb",
        "mar",
        "apr",
        "maj",
        "jun",
        "jul",
        "aug",
        "sep",
        "okt",
        "nov",
        "dec"
    ];

    const monthValue = p.findIndex(monthItem => allMonths.indexOf(monthItem) === month.value)
    const shiftMonth = monthValue * (360 / p.length);

    for (let index = 0; index < 2; index++) {
        // If the month is december, then the angle is 0
        A_global = (-90 + (360 / p.length) * (monthValue)) * (Math.PI / 180); // in radians 
        A_global += shiftMonth
    }

    //Goal: x1 == retVal.x2
    // x1 + c = retVal.x2
    // c = retVal.x2 - x1

    let Ccolor = area.color  // Color of the bubble


    let bubblesDates = month.areas[areaLabel] && month.areas[areaLabel].dates.length > 0 &&
        month.areas[areaLabel].dates.map((date) => {
            let A = (-90 + (A_global + 2 + ((360 / p.length - 6.5) / month.days.length) * date.date.getDate())) * (Math.PI / 180);
            let Bx = Cx + area.radius * Math.cos(A);
            let By = Cy + area.radius * Math.sin(A);
            Bx = Bx + (Cx - Bx) * areaPosition;
            By = By + (Cy - By) * areaPosition;


            return {
                Bx,
                By,
                Ccolor,
                date,
            };
        });

    return bubblesDates
}



