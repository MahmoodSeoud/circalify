import {
    calcBubbelDates, calcLineCoord, calcTextCoord, areaLabel, months, calcTimelineCoord, monthCircleOutterRadius,
    monthCirlceInnerRadius, driftCircleRadius, driftInnerRadius, økonomiCircleRadius, økonomiInnerRadius,
    produktionCircleRadius, produktionInnerRadius, ferieCircleRadius, ferieInnerRadius, mønstringCircleRadius,
    mønstringInnerRadius, uTCircleRadius, Cx, Cy, monthCircleColor, driftCircleColor, økonomiCircleColor,
    produktionCircleColor, ferieCircleColor, mønstringCircleColor, uTCircleColor, monthCircleStrokeColor,
    whiteStrokeColor, textColor, dateColor, strokeWidth_1, strokeWidth_4, fontSize_10, fontSize_12, fontSize_13,
    fontSize_22, fontFamily, links, onHoverColor, labelsAndLinks,
    updateCenterCoordinates
} from "./utils.js"

// Conditionally import SharePoint functions
let retrievePaneler, retrieveProcesser, retrieveLinks;

async function loadDataFunctions() {
    if (isDevelopmentMode) {
        // Use mock functions from utils.js
        const mockFunctions = await import('./utils.js');
        retrievePaneler = mockFunctions.retrievePaneler;
        retrieveProcesser = mockFunctions.retrieveProcesser;
        retrieveLinks = mockFunctions.retrieveLinks;
        console.log('YearWheel: Loaded mock data functions');
    } else {
        // Use inline SharePoint functions - no separate file needed
        console.log('YearWheel: Loading inline SharePoint data functions');

        retrieveLinks = function() {
            return new Promise((resolve, reject) => {
                console.log('YearWheel: Retrieving HjuletsLinks...');
                try {
                    if (!window.SP || !window.SP.ClientContext) {
                        console.warn('YearWheel: SharePoint client context not available');
                        resolve(); // Don't fail, just continue without data
                        return;
                    }
                    const clientContext = new SP.ClientContext();
                    const oList = clientContext.get_web().get_lists().getByTitle('HjuletsLinks');
                    const camlQuery = new SP.CamlQuery();
                    camlQuery.set_viewXml('<View><RowLimit>100</RowLimit></View>');
                    const items = oList.getItems(camlQuery);
                    clientContext.load(items);

                clientContext.executeQueryAsync(
                    function() {
                        console.log('YearWheel: HjuletsLinks retrieved successfully');
                        labelsAndLinks.length = 0; // Clear existing
                        const enumerator = items.getEnumerator();
                        while (enumerator.moveNext()) {
                            const item = enumerator.get_current();
                            labelsAndLinks.push({
                                Title: item.get_item('Title'),
                                Priority: item.get_item('Prioritet'),
                                Url: {
                                    url: item.get_item('Link').get_url(),
                                    description: item.get_item('Link').get_description()
                                }
                            });
                        }
                        // Sort by priority
                        labelsAndLinks.sort((a, b) => parseInt(a.Priority) - parseInt(b.Priority));
                        console.log('YearWheel: Processed', labelsAndLinks.length, 'links');
                        resolve();
                    },
                    function(sender, args) {
                        console.warn('YearWheel: Error retrieving HjuletsLinks, continuing without data:', args.get_message());
                        resolve(); // Don't break the app, just continue
                    }
                );
                } catch (error) {
                    console.warn('YearWheel: Exception in retrieveLinks, continuing without data:', error);
                    resolve(); // Don't break the app
                }
            });
        };

        retrieveProcesser = function() {
            return new Promise((resolve, reject) => {
                console.log('YearWheel: Retrieving HjuletsProcesser...');
                const clientContext = new SP.ClientContext();
                const oList = clientContext.get_web().get_lists().getByTitle('HjuletsProcesser');
                const camlQuery = new SP.CamlQuery();
                camlQuery.set_viewXml('<View><RowLimit>500</RowLimit></View>');
                const items = oList.getItems(camlQuery);
                clientContext.load(items);

                clientContext.executeQueryAsync(
                    function() {
                        console.log('YearWheel: HjuletsProcesser retrieved successfully');

                        // Clear existing data in months
                        Object.keys(months).forEach(monthKey => {
                            if (months[monthKey].areas) {
                                Object.keys(months[monthKey].areas).forEach(areaKey => {
                                    months[monthKey].areas[areaKey] = [];
                                });
                            }
                        });

                        const enumerator = items.getEnumerator();
                        while (enumerator.moveNext()) {
                            const item = enumerator.get_current();
                            const deadlineDate = item.get_item('DeadlineDato');
                            const hjulLookup = item.get_item('Hjul');

                            if (deadlineDate && hjulLookup) {
                                const date = new Date(deadlineDate);
                                const monthKey = Object.keys(months)[date.getMonth()];
                                const areaName = hjulLookup.get_lookupValue();

                                if (months[monthKey] && months[monthKey].areas && months[monthKey].areas[areaName]) {
                                    months[monthKey].areas[areaName].push({
                                        date: date,
                                        text: item.get_item('Title'),
                                        description: item.get_item('Beskrivelse') || '',
                                        notificationEmail: item.get_item('NotifikationMail') || '',
                                        notificationDate: item.get_item('NotifikationDato'),
                                        deadlineDate: deadlineDate
                                    });
                                }
                            }
                        }
                        console.log('YearWheel: Processed process data for months');
                        resolve();
                    },
                    function(sender, args) {
                        console.error('YearWheel: Failed to retrieve HjuletsProcesser:', args.get_message());
                        console.warn('YearWheel: Error in SharePoint operation, continuing without data:', args.get_message());
                        resolve(); // Don't break the app
                    }
                );
            });
        };

        retrievePaneler = function() {
            return new Promise((resolve, reject) => {
                console.log('YearWheel: Retrieving HjuletsPaneler...');
                const clientContext = new SP.ClientContext();
                const oList = clientContext.get_web().get_lists().getByTitle('HjuletsPaneler');
                const camlQuery = new SP.CamlQuery();
                camlQuery.set_viewXml('<View><RowLimit>100</RowLimit></View>');
                const items = oList.getItems(camlQuery);
                clientContext.load(items);

                clientContext.executeQueryAsync(
                    function() {
                        console.log('YearWheel: HjuletsPaneler retrieved successfully');

                        // Clear existing links
                        Object.keys(links).forEach(key => {
                            links[key] = [];
                        });

                        const enumerator = items.getEnumerator();
                        while (enumerator.moveNext()) {
                            const item = enumerator.get_current();
                            const panel = item.get_item('Panel');
                            const url = item.get_item('Url');

                            if (panel && url && links[panel]) {
                                links[panel].push({
                                    title: item.get_item('Title'),
                                    url: url.get_url()
                                });
                            }
                        }
                        console.log('YearWheel: Processed panel data');
                        resolve();
                    },
                    function(sender, args) {
                        console.error('YearWheel: Failed to retrieve HjuletsPaneler:', args.get_message());
                        console.warn('YearWheel: Error in SharePoint operation, continuing without data:', args.get_message());
                        resolve(); // Don't break the app
                    }
                );
            });
        };

        console.log('YearWheel: Inline SharePoint functions loaded');
    }
}

import { SVG } from './lib/svg.esm.js';
import './lib/svg-panzoom.js'


// Development mode detection - check if SharePoint is available
const isDevelopmentMode = typeof _spPageContextInfo === 'undefined' || typeof SP === 'undefined';

// CRITICAL: Detect SharePoint operations that should prevent YearWheel initialization
const isSharePointOperation =
    // Check if we're in an edit mode that should block initialization
    window.location.href.includes('ControlMode=Edit') ||
    window.location.href.includes('DisplayMode=Design') ||
    // Check if there are any active SharePoint operations (only when actually submitting)
    (window._spFormOnSubmitCalled === true);

// Define missing SharePoint function if not present - must be available immediately
if (typeof window !== 'undefined') {
    window.runtheactualscriptdotdk = function() {
        console.log('SharePoint script ready - YearWheel loading...');
    };

    // Also define sharePointReady function to handle the SP ready event
    window.sharePointReady = function() {
        console.log('SharePoint ready event triggered');
        if (typeof window.runtheactualscriptdotdk === 'function') {
            window.runtheactualscriptdotdk();
        }
    };
}

if (!isSharePointOperation) {

// Create PIN namespace if it doesn't exist - only for compatibility
if (typeof window !== 'undefined' && typeof window.PIN === 'undefined') {
    window.PIN = {};
    window.PIN.Utilities = {
        createList: function(listName, listTemplate, fields) {
            console.log(`PIN.Utilities.createList called for ${listName} - list creation handled by ensureLists function`);
            return Promise.resolve();
        }
    };
}

if (isDevelopmentMode) {
    console.log('Development mode detected - using dummy data');
    // Delay execution to ensure all functions are defined
    setTimeout(async () => {
        await loadDataFunctions();
        // Call data retrieval functions to populate dummy data
        await retrieveData();
        drawYearWheel();
        drawZoomPercentage();
    }, 0);
} else {
    // CRITICAL: Prevent multiple initializations that interfere with SharePoint postbacks
    if (window.YearWheelInitialized) {
        console.log('YearWheel: Already initialized, skipping to prevent SharePoint interference');
    } else {
        window.YearWheelInitialized = true;

    console.log('SharePoint mode detected - loading data from SharePoint lists');

    // Initialize immediately if CreateSpinningWheelContainer exists
    if (typeof CreateSpinningWheelContainer === 'function') {
        try {
            CreateSpinningWheelContainer();
            console.log('YearWheel: Called CreateSpinningWheelContainer');
        } catch (e) {
            console.error('YearWheel: Error calling CreateSpinningWheelContainer', e);
        }
    }

    // Use a more reliable SharePoint initialization
    const initializeSharePointMode = async () => {
        try {
            console.log('YearWheel: Starting SharePoint initialization...');
            await loadDataFunctions();
            console.log('YearWheel: Data functions loaded, ensuring lists...');
            await ensureLists();
            console.log('YearWheel: Lists ensured, retrieving data...');
            await retrieveData();
            console.log('YearWheel: Data retrieved, drawing wheel...');
            drawYearWheel();
            drawZoomPercentage();
            console.log('YearWheel: Initialization complete!');
        } catch (error) {
            console.error('YearWheel: Error during SharePoint initialization', error);
            // Try to draw anyway with default data
            console.log('YearWheel: Falling back to drawing with available data...');
            drawYearWheel();
            drawZoomPercentage();
        }
    };

    // More defensive SharePoint initialization
    if (typeof ExecuteOrDelayUntilScriptLoaded === 'function') {
        try {
            ExecuteOrDelayUntilScriptLoaded(function() {
                // Add extra safety delay to avoid conflicts with SharePoint editing
                setTimeout(initializeSharePointMode, 2000);
            }, 'sp.js');
        } catch (e) {
            console.warn('YearWheel: SharePoint script loading failed, using fallback', e);
            setTimeout(initializeSharePointMode, 3000);
        }
    } else {
        // Fallback: wait longer for SharePoint to fully initialize
        setTimeout(initializeSharePointMode, 3000);
    }
    } // Close the initialization guard else block
}


async function retrieveData() {
    await retrieveLinks();
    await retrievePaneler();
    await retrieveProcesser();

    // Expose links data to global window for HTML access
    if (typeof window !== 'undefined') {
        window.YearWheelApp = window.YearWheelApp || {};
        window.YearWheelApp.links = links;
        console.log('YearWheel: Exposed links data to window.YearWheelApp.links', links);
    }
}

async function ensureLists() {
    // Check if we're in SharePoint environment with required APIs
    if (typeof SP === 'undefined' || typeof SP.ClientContext === 'undefined') {
        console.warn('YearWheel: SharePoint APIs not available - skipping list creation');
        return Promise.resolve();
    }

    try {
        const clientContext = new SP.ClientContext();
        const web = clientContext.get_web();
        const lists = web.get_lists();
        clientContext.load(lists);

        // Execute query to get existing lists
        await new Promise((resolve, reject) => {
            clientContext.executeQueryAsync(
                function() {
                    resolve();
                },
                function(sender, args) {
                    reject(args.get_message());
                }
            );
        });

        // Check which lists exist
        const existingListNames = [];
        const enumerator = lists.getEnumerator();
        while (enumerator.moveNext()) {
            const list = enumerator.get_current();
            existingListNames.push(list.get_title());
        }

        console.log('YearWheel: Existing lists found:', existingListNames);

        // Define required lists with their fields
        const requiredLists = [
            {
                name: 'HjuletsLinks',
                fields: [['Link', 'URL'], ['Prioritet', 'Choice']]
            },
            {
                name: 'HjuletsPaneler',
                fields: [['Panel', 'Choice'], ['Url', 'URL']]
            },
            {
                name: 'HjuletsProcesser',
                fields: [
                    ['Hjul', 'Lookup'],
                    ['NotifikationMail', 'Text'],
                    ['Beskrivelse', 'Note'],
                    ['NotifikationDato', 'DateTime'],
                    ['DeadlineDato', 'DateTime']
                ]
            }
        ];

        // Create missing lists
        for (const listDef of requiredLists) {
            if (!existingListNames.includes(listDef.name)) {
                console.log(`YearWheel: Creating missing list: ${listDef.name}`);
                await createSharePointList(listDef.name, listDef.fields);
            } else {
                console.log(`YearWheel: List already exists: ${listDef.name}`);
            }
        }

        console.log('YearWheel: List verification completed');
    } catch (error) {
        console.error('YearWheel: Error ensuring lists:', error);
        // Don't throw - continue with app initialization even if list creation fails
        return Promise.resolve();
    }
}

// Helper function to create a SharePoint list
async function createSharePointList(listName, fields) {
    try {
        const clientContext = new SP.ClientContext();
        const web = clientContext.get_web();

        // Create list
        const listCreationInfo = new SP.ListCreationInformation();
        listCreationInfo.set_title(listName);
        listCreationInfo.set_templateType(SP.ListTemplateType.genericList);

        const newList = web.get_lists().add(listCreationInfo);
        clientContext.load(newList);

        // Execute list creation
        await new Promise((resolve, reject) => {
            clientContext.executeQueryAsync(
                function() {
                    console.log(`YearWheel: List '${listName}' created successfully`);
                    resolve();
                },
                function(sender, args) {
                    reject(`Failed to create list '${listName}': ${args.get_message()}`);
                }
            );
        });

        // Add custom fields if any - use the same clientContext
        if (fields && fields.length > 0) {
            for (const [fieldName, fieldType] of fields) {
                await addFieldToList(clientContext, newList, fieldName, fieldType);
            }
        }

    } catch (error) {
        console.error(`YearWheel: Error creating list '${listName}':`, error);
        throw error;
    }
}

// Helper function to add a field to a SharePoint list
async function addFieldToList(clientContext, list, fieldName, fieldType) {
    try {

        let fieldSchema = '';

        // Generate field schema based on type
        switch (fieldType) {
            case 'Text':
                fieldSchema = `<Field Type="Text" DisplayName="${fieldName}" Name="${fieldName}" />`;
                break;
            case 'Note':
                fieldSchema = `<Field Type="Note" DisplayName="${fieldName}" Name="${fieldName}" />`;
                break;
            case 'DateTime':
                fieldSchema = `<Field Type="DateTime" DisplayName="${fieldName}" Name="${fieldName}" Format="DateOnly" />`;
                break;
            case 'Choice':
                if (fieldName === 'Prioritet') {
                    fieldSchema = `<Field Type="Choice" DisplayName="${fieldName}" Name="${fieldName}" EnforceUniqueValues="TRUE" Indexed="TRUE">
                        <CHOICES>
                            <CHOICE>0</CHOICE>
                            <CHOICE>1</CHOICE>
                            <CHOICE>2</CHOICE>
                            <CHOICE>3</CHOICE>
                            <CHOICE>4</CHOICE>
                            <CHOICE>5</CHOICE>
                        </CHOICES>
                    </Field>`;
                } else if (fieldName === 'Panel') {
                    fieldSchema = `<Field Type="Choice" DisplayName="${fieldName}" Name="${fieldName}">
                        <CHOICES>
                            <CHOICE>Aktiviteter</CHOICE>
                            <CHOICE>Blanketter</CHOICE>
                            <CHOICE>Info</CHOICE>
                            <CHOICE>Loggen</CHOICE>
                            <CHOICE>Bestemmelser</CHOICE>
                        </CHOICES>
                    </Field>`;
                } else {
                    fieldSchema = `<Field Type="Choice" DisplayName="${fieldName}" Name="${fieldName}">
                        <CHOICES>
                            <CHOICE>Drift</CHOICE>
                            <CHOICE>Økonomi</CHOICE>
                            <CHOICE>Produktion</CHOICE>
                            <CHOICE>Ferie</CHOICE>
                            <CHOICE>Mønstring</CHOICE>
                            <CHOICE>U/T</CHOICE>
                        </CHOICES>
                    </Field>`;
                }
                break;
            case 'URL':
                fieldSchema = `<Field Type="URL" DisplayName="${fieldName}" Name="${fieldName}" />`;
                break;
            case 'Lookup':
                if (fieldName === 'Hjul') {
                    // Special handling for Hjul lookup field - needs to reference HjuletsLinks list
                    await createHjulLookupField(clientContext, list);
                    return; // Skip the normal field creation process
                } else {
                    fieldSchema = `<Field Type="Lookup" DisplayName="${fieldName}" Name="${fieldName}" />`;
                }
                break;
            default:
                fieldSchema = `<Field Type="Text" DisplayName="${fieldName}" Name="${fieldName}" />`;
        }

        const field = list.get_fields().addFieldAsXml(fieldSchema, true, SP.AddFieldOptions.addFieldInternalNameHint);
        clientContext.load(field);

        await new Promise((resolve, reject) => {
            clientContext.executeQueryAsync(
                function() {
                    console.log(`YearWheel: Field '${fieldName}' added to list`);
                    resolve();
                },
                function(sender, args) {
                    console.warn(`YearWheel: Could not add field '${fieldName}': ${args.get_message()}`);
                    resolve(); // Don't fail the entire process for field creation issues
                }
            );
        });

    } catch (error) {
        console.warn(`YearWheel: Error adding field '${fieldName}':`, error);
        // Don't throw - continue with other fields
    }
}

// Special function to create the Hjul lookup field that references HjuletsLinks
async function createHjulLookupField(clientContext, targetList) {
    try {
        // Get the HjuletsLinks list
        const web = clientContext.get_web();
        const hjuletsLinksList = web.get_lists().getByTitle('HjuletsLinks');
        clientContext.load(hjuletsLinksList);

        // Execute query to get the list ID
        await new Promise((resolve, reject) => {
            clientContext.executeQueryAsync(
                function() {
                    resolve();
                },
                function(sender, args) {
                    reject(args.get_message());
                }
            );
        });

        // Create the lookup field with proper list reference
        const lookupFieldSchema = `<Field Type="Lookup" DisplayName="Hjul" Name="Hjul"
            List="{${hjuletsLinksList.get_id().toString()}}"
            ShowField="Title" />`;

        const lookupField = targetList.get_fields().addFieldAsXml(lookupFieldSchema, true, SP.AddFieldOptions.addFieldInternalNameHint);
        clientContext.load(lookupField);

        await new Promise((resolve, reject) => {
            clientContext.executeQueryAsync(
                function() {
                    console.log('YearWheel: Hjul lookup field created successfully');
                    resolve();
                },
                function(sender, args) {
                    console.warn(`YearWheel: Could not create Hjul lookup field: ${args.get_message()}`);
                    resolve(); // Don't fail the entire process
                }
            );
        });

    } catch (error) {
        console.warn('YearWheel: Error creating Hjul lookup field:', error);
        // Don't throw - continue with other fields
    }
}

// Global variables
const allMonths = [
    "jan", "feb", "mar", "apr", "maj", "jun",
    "jul", "aug", "sep", "okt", "nov", "dec"
];

let P = [...allMonths]; //Months


const zoomMin = 1.0; // No zoom
const zoomMax = 1.0; // No zoom
const zoomFactor = 0; // No zoom factor needed


const d = new Date()
const currentMonth = d.getMonth();

// SVG - Make it responsive with much larger scaling
const draw = SVG()
    .addTo('#wrapper')
    .size('100%', '100%')
    .viewbox('0 100 1000 800')
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .panZoom({
        zoomMin: zoomMin,
        zoomMax: zoomMax,
        zoomFactor: zoomFactor,
        wheelZoom: false,
        panning: false,
    });

// Get viewbox dimensions for responsive positioning
const viewBoxWidth = 1920;
const viewBoxHeight = 1080;

let lineGroup = null;
let circleGroup = null;
let circleTextGroup = null;
let timeLineGroup = null
let monthLabelGroup = null;
let informationGroup = null;
let bestemmelserGroup = null;


let zoomedInMonth = null;
let didZoomIn = false;
let prevZoomLvl = 1; // Initialize with the default zoom level


const inititilizeGroups = () => {
    // Groups
    lineGroup = draw.group()
    circleGroup = draw.group();
    circleTextGroup = draw.group();
    timeLineGroup = draw.group();
    monthLabelGroup = draw.group();
    informationGroup = draw.group();
    bestemmelserGroup = draw.group();

};

// Adding the zoom effect - DISABLED to prevent popup close from triggering redraw
// draw.on('zoom', (ev) => handleZoom(ev.detail.level, [ev.detail.focus.x, ev.detail.focus.y], 'zoom'));

// SharePoint Classic specific: Disable MDS and page refresh mechanisms that might interfere
if (!isDevelopmentMode && typeof _spPageContextInfo !== 'undefined') {
    // Disable SharePoint's Minimal Download Strategy if present
    if (typeof ajaxNavigate !== 'undefined') {
        window.ajaxNavigate = { add_navigate: function() { }, remove_navigate: function() { } };
    }

    // Prevent SharePoint page refresh mechanisms
    if (typeof window._spNavigationManager !== 'undefined') {
        const originalNavigate = window._spNavigationManager.navigate;
        window._spNavigationManager.navigate = function() {
            console.log('SharePoint navigation blocked to prevent wheel redraw');
            return false;
        };
    }
}

// Adding scroll wheel zoom functionality
function handleScrollZoom(event) {
    // Prevent default scroll behavior
    event.preventDefault();

    // Determine scroll direction - negative deltaY means scroll up (zoom in)
    const isScrollUp = event.deltaY < 0;

    if (isScrollUp) {
        // Scroll up = zoom in (same as plus button)
        handlePop();
    } else {
        // Scroll down = zoom out (same as minus button)  
        handlePush();
    }
}

// Add scroll event listener to the wrapper div
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('wrapper');
    if (wrapper) {
        wrapper.addEventListener('wheel', handleScrollZoom, { passive: false });
    }
});

let foundZoomedInMonth = false; // Flag to track if a zoomed-in month is found
let monthFocused = null;

// Handle the zooming
// lvl: The zoom level
// focus: The focus point of the zoom. 500 due to it being the center
// caller: The caller of the function. Either 'zoom' or 'pop' or 'push'
function handleZoom(lvl, focus = [Cx, Cy], caller = 'zoom') {

    const lines = calcLineCoord(P);
    const zoomLvl = lvl
    const mouseX = focus[0];
    const mouseY = focus[1];
    let fstTimeRunning = true;


    didZoomIn = zoomLvl > prevZoomLvl;
    const zoomPercentage = getZoomPercentage();
    lines.forEach((currentLine, index) => {
        const nextLine = lines[(index + 1) % lines.length];

        let Ax = currentLine.x2;
        let Ay = currentLine.y2;
        let Bx = nextLine.x2;
        let By = nextLine.y2;

        // Always focus on current month for any zoom operation
        if (!foundZoomedInMonth && fstTimeRunning) {
            monthFocused = allMonths[currentMonth];
            zoomedInMonth = P.findIndex(monthItem => monthItem === monthFocused);
            // If the zoomedInMonth is not inside the P array then it cannot
            // return the index of it, thus just set it to '0'
            if (zoomedInMonth === -1) {
                zoomedInMonth = 0;
            }
            foundZoomedInMonth = true;
        }

        if ((foundZoomedInMonth && zoomedInMonth === index && zoomLvl != prevZoomLvl) ||
            (fstTimeRunning && zoomedInMonth === index && zoomLvl != prevZoomLvl && caller !== 'zoom')) {

            if (didZoomIn) {
                if (P.length === 12) {
                    determineWhichToRemove(P, zoomedInMonth, 6, zoomPercentage)
                } else if (P.length === 6) {
                    determineWhichToRemove(P, zoomedInMonth, 3, zoomPercentage)
                } else if (P.length === 3) {
                    determineWhichToRemove(P, zoomedInMonth, 2, zoomPercentage)
                }
            } else {
                if (P.length === 12) {
                    return;
                } else if (P.length === 6) {
                    determineWhichToInsert(P, 6, zoomPercentage, monthFocused)
                } else if (P.length === 3) {
                    determineWhichToInsert(P, 3, zoomPercentage, monthFocused)
                } else if (P.length === 1) {
                    determineWhichToInsert(P, 2, zoomPercentage, monthFocused)
                }

            }
            fstTimeRunning = false;
            zoomedInMonth = P.findIndex((month) => month === monthFocused);
        }
    });

    if (zoomLvl <= 1) {
        foundZoomedInMonth = false;
        zoomedInMonth = null;
    }
    prevZoomLvl = zoomLvl;
}

function handleZoomOnClick(lvl) {
    let monthFocused = null;
    let fstTimeRunning = true;
    const lines = calcLineCoord(P);
    const zoomLvl = lvl

    console.log("DEBUG handleZoomOnClick called with:", {
        lvl,
        currentMonth,
        currentMonthName: allMonths[currentMonth],
        PLength: P.length,
        prevZoomLvl
    });

    didZoomIn = zoomLvl > prevZoomLvl;
    const zoomPercentage = getZoomPercentage();
    monthFocused = allMonths[currentMonth];
    zoomedInMonth = P.findIndex((month) => month === monthFocused);

    console.log("DEBUG: monthFocused set to:", monthFocused, "zoomedInMonth index:", zoomedInMonth);
    lines.forEach((currentLine, index) => {

        if (zoomLvl != prevZoomLvl && fstTimeRunning) {

            if (didZoomIn) {
                if (P.length === 12) {
                    determineWhichToRemove(P, zoomedInMonth, 6, zoomPercentage)
                } else if (P.length === 6) {
                    determineWhichToRemove(P, zoomedInMonth, 3, zoomPercentage)
                } else if (P.length === 3) {
                    determineWhichToRemove(P, zoomedInMonth, 2, zoomPercentage)
                }
            } else {
                if (P.length === 12) {
                    return;
                } else if (P.length === 6) {
                    determineWhichToInsert(P, 6, zoomPercentage, monthFocused)
                } else if (P.length === 3) {
                    determineWhichToInsert(P, 3, zoomPercentage, monthFocused)
                } else if (P.length === 1) {
                    determineWhichToInsert(P, 2, zoomPercentage, monthFocused)
                }

            }
        }
        fstTimeRunning = false;
    });
    if (zoomLvl <= 1) {
        foundZoomedInMonth = false;
        zoomedInMonth = null;
    }
    prevZoomLvl = zoomLvl;
}

// Remove months when zooming in
// arr: The array to remove from
// index: The index of the month to remove (unused - we focus on current month)
// amountToRemove: The amount of months to remove (unused - determined by zoom level)
// zoomPercentage: The current zoom percentage
function determineWhichToRemove(arr, index, amountToRemove, zoomPercentage) {
    if (arr.length === 1) return;
    draw.clear();

    const allMonths = [
        "jan", "feb", "mar", "apr", "maj", "jun",
        "jul", "aug", "sep", "okt", "nov", "dec"
    ];

    // Get the current month name
    const monthFocused = allMonths[currentMonth];
    let targetArray;

    console.log("DEBUG determineWhichToRemove:", {
        currentMonth,
        monthFocused,
        arrLength: arr.length
    });

    // Determine target array based on current array length and focused month
    if (arr.length === 12) {
        // Zooming from 12 to 6 months - use zoom level 1 arrays
        console.log("DEBUG: Zooming from 12 to 6, month:", monthFocused);
        switch (monthFocused) {
            case "jan": targetArray = ["jan", "feb", "mar", "apr", "maj", "jun"]; break;
            case "feb": targetArray = ["feb", "mar", "apr", "maj", "jun", "jul"]; break;
            case "mar": targetArray = ["mar", "apr", "maj", "jun", "jul", "aug"]; break;
            case "apr": targetArray = ["apr", "maj", "jun", "jul", "aug", "sep"]; break;
            case "maj": targetArray = ["maj", "jun", "jul", "aug", "sep", "okt"]; break;
            case "jun": targetArray = ["jun", "jul", "aug", "sep", "okt", "nov"]; break;
            case "jul": targetArray = ["jul", "aug", "sep", "okt", "nov", "dec"]; break;
            case "aug":
                console.log("DEBUG: August case hit!");
                targetArray = ["jul", "aug", "sep", "okt", "nov", "dec"];
                break;
            case "sep": targetArray = ["aug", "sep", "okt", "nov", "dec", "jan"]; break;
            case "okt": targetArray = ["sep", "okt", "nov", "dec", "jan", "feb"]; break;
            case "nov": targetArray = ["okt", "nov", "dec", "jan", "feb", "mar"]; break;
            case "dec": targetArray = ["nov", "dec", "jan", "feb", "mar", "apr"]; break;
            default:
                console.log("DEBUG: Default case hit for month:", monthFocused);
                targetArray = [...allMonths];
                break;
        }
        console.log("DEBUG: targetArray set to:", targetArray);
    } else if (arr.length === 6) {
        // Zooming from 6 to 3 months - use zoom level 2 arrays
        switch (monthFocused) {
            case "jan": targetArray = ["dec", "jan", "feb"]; break;
            case "feb": targetArray = ["jan", "feb", "mar"]; break;
            case "mar": targetArray = ["feb", "mar", "apr"]; break;
            case "apr": targetArray = ["mar", "apr", "maj"]; break;
            case "maj": targetArray = ["apr", "maj", "jun"]; break;
            case "jun": targetArray = ["maj", "jun", "jul"]; break;
            case "jul": targetArray = ["jun", "jul", "aug"]; break;
            case "aug": targetArray = ["jul", "aug", "sep"]; break;
            case "sep": targetArray = ["aug", "sep", "okt"]; break;
            case "okt": targetArray = ["sep", "okt", "nov"]; break;
            case "nov": targetArray = ["okt", "nov", "dec"]; break;
            case "dec": targetArray = ["nov", "dec", "jan"]; break;
            default: targetArray = [monthFocused]; break;
        }
    } else if (arr.length === 3) {
        // Zooming from 3 to 1 month - show only current month
        targetArray = [monthFocused];
    }

    // Replace array contents
    arr.length = 0;
    arr.push(...targetArray);

    drawYearWheel();
    drawZoomPercentage(zoomPercentage);
}

function determineWhichToInsert(arr, amountToInsert, zoomPercentage, monthFocused) {
    if (arr.length === 12) return;
    draw.clear();
    const allMonths = [
        "jan", "feb", "mar", "apr", "maj", "jun",
        "jul", "aug", "sep", "okt", "nov", "dec"
    ];
    // Zoom niveau 1
    const jan_z1 = ["jan", "feb", "mar", "apr", "maj", "jun"];
    const feb_z1 = ["feb", "mar", "apr", "maj", "jun", "jul"];
    const mar_z1 = ["mar", "apr", "maj", "jun", "jul", "aug"];
    const apr_z1 = ["apr", "maj", "jun", "jul", "aug", "sep"];
    const maj_z1 = ["maj", "jun", "jul", "aug", "sep", "okt"];
    const jun_z1 = ["jun", "jul", "aug", "sep", "okt", "nov"];
    const jul_z1 = ["jul", "aug", "sep", "okt", "nov", "dec"];
    const aug_z1 = ["jan", "aug", "sep", "okt", "nov", "dec"];
    const sep_z1 = ["jan", "feb", "sep", "okt", "nov", "dec"];
    const okt_z1 = ["jan", "feb", "mar", "okt", "nov", "dec"];
    const nov_z1 = ["jan", "feb", "mar", "apr", "nov", "dec"];
    const dec_z1 = ["jan", "feb", "mar", "apr", "maj", "dec"];
    // Zoom niveau 2
    const jan_z2 = ["jan", "feb", "mar"];
    const feb_z2 = ["feb", "mar", "apr"];
    const mar_z2 = ["mar", "apr", "maj"];
    const apr_z2 = ["apr", "maj", "jun"];
    const maj_z2 = ["maj", "jun", "jul"];
    const jun_z2 = ["jun", "jul", "aug"];
    const jul_z2 = ["jul", "aug", "sep"];
    const aug_z2 = ["aug", "sep", "okt"];
    const sep_z2 = ["sep", "okt", "nov"];
    const okt_z2 = ["okt", "nov", "dec"];
    const nov_z2 = ["jan", "nov", "dec"];
    const dec_z2 = ["jan", "feb", "dec"];
    let targetArray;
    const monthArrays = {
        jan: { 3: jan_z1, 2: jan_z2 },
        feb: { 3: feb_z1, 2: feb_z2 },
        mar: { 3: mar_z1, 2: mar_z2 },
        apr: { 3: apr_z1, 2: apr_z2 },
        maj: { 3: maj_z1, 2: maj_z2 },
        jun: { 3: jun_z1, 2: jun_z2 },
        jul: { 3: jul_z1, 2: jul_z2 },
        aug: { 3: aug_z1, 2: aug_z2 },
        sep: { 3: sep_z1, 2: sep_z2 },
        okt: { 3: okt_z1, 2: okt_z2 },
        nov: { 3: nov_z1, 2: nov_z2 },
        dec: { 3: dec_z1, 2: dec_z2 }
    };
    if (monthArrays[monthFocused] && monthArrays[monthFocused][amountToInsert]) {
        targetArray = monthArrays[monthFocused][amountToInsert];
    } else {
        targetArray = [...allMonths];
    }
    arr.length = 0; // Clear the array 
    arr.push(...targetArray);
    drawYearWheel();
    drawZoomPercentage(zoomPercentage);
}


function handleOnHover(text) {
    text.fill({ color: onHoverColor });
    text.attr({ cursor: 'pointer' });
}

function handleOnHoverOut(text) {
    text.fill({ color: textColor });
}


/* Draw all the main Circles  */
const drawCircles = () => {

    function handleOnClick(url) {
        window.open(url, '_blank');
    }

    // Getting the labels and links from the sharepoint list
    const labels = labelsAndLinks.map(item => item.Title);
    const linksArr = labelsAndLinks.map(item => item.Url.url);

    // Helper function to create SVG donut/ring path
    function createDonutPath(innerRadius, outerRadius) {
        // Create SVG path for donut shape
        const largeArcFlag = 1; // Always use large arc for full circle

        // Outer circle path (clockwise)
        const outerPath = `M ${outerRadius} 0 A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${-outerRadius} 0 A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerRadius} 0 Z`;

        // Inner circle path (counter-clockwise to create hole)
        const innerPath = `M ${innerRadius} 0 A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${-innerRadius} 0 A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerRadius} 0 Z`;

        return `${outerPath} ${innerPath}`;
    }

    // Define rings with 7.5px gaps and 40px thick rings, plus gray outer ring
    // Each ring represents the area between its outer and inner radius boundaries
    const rings = [
        // Ring 0 (outermost): Gray ring matching reference image (40px thick)
        { innerRadius: driftCircleRadius, outerRadius: monthCircleOutterRadius, fill: monthCircleColor, stroke: { width: strokeWidth_1, color: whiteStrokeColor }, name: 'Outer' },

        // Ring 1: Drift - Light beige ring (40px thick)  
        { innerRadius: driftInnerRadius, outerRadius: driftCircleRadius, fill: driftCircleColor, stroke: { width: strokeWidth_1, color: whiteStrokeColor }, name: 'Drift' },

        // Ring 2: Økonomi - Purple ring (40px thick)  
        { innerRadius: økonomiInnerRadius, outerRadius: økonomiCircleRadius, fill: økonomiCircleColor, stroke: { width: strokeWidth_1, color: whiteStrokeColor }, name: 'Økonomi' },

        // Ring 3: Produktion - Blue ring (40px thick)
        { innerRadius: produktionInnerRadius, outerRadius: produktionCircleRadius, fill: produktionCircleColor, stroke: { width: strokeWidth_1, color: whiteStrokeColor }, name: 'Produktion' },

        // Ring 4: Ferie - Green ring (40px thick)
        { innerRadius: ferieInnerRadius, outerRadius: ferieCircleRadius, fill: ferieCircleColor, stroke: { width: strokeWidth_1, color: whiteStrokeColor }, name: 'Ferie' },

        // Ring 5: Mønstring - Pink ring (40px thick)
        { innerRadius: mønstringInnerRadius, outerRadius: mønstringCircleRadius, fill: mønstringCircleColor, stroke: { width: strokeWidth_1, color: whiteStrokeColor }, name: 'Mønstring' },

        // Center circle: Uddannelse/Træning  
        { innerRadius: 0, outerRadius: uTCircleRadius, fill: uTCircleColor, stroke: { width: strokeWidth_4, color: whiteStrokeColor }, name: 'Uddannelse/Træning' }
    ];

    // Create rings using proper donut paths
    rings.forEach((ring, index) => {
        let shape;

        if (ring.innerRadius === 0) {
            // Center circle - use regular circle
            shape = draw.circle(ring.outerRadius * 2)
                .center(0, 0)
                .translate(Cx, Cy);
        } else {
            // Ring - use donut path
            const pathData = createDonutPath(ring.innerRadius, ring.outerRadius);
            shape = draw.path(pathData)
                .translate(Cx, Cy)
                .attr('fill-rule', 'evenodd'); // Important for donut holes
        }

        shape.fill(ring.fill).stroke(ring.stroke);
        circleGroup.add(shape);
    });

    // Also add outer month circle for reference
    const outerCircle = draw.circle(monthCircleOutterRadius * 2)
        .center(0, 0)
        .translate(Cx, Cy)
        .fill('none')
        .stroke({ width: strokeWidth_1, color: monthCircleStrokeColor });
    circleGroup.add(outerCircle);

    // Position labels in concentric circles based on reference image
    // Center: Uddannelse + Træning
    // Ring 1 (innermost): Mønstring (repeated in 2 positions)
    // Ring 2: Ferie (repeated in 2 positions) 
    // Ring 3: Produktion (repeated in 2 positions)
    // Ring 4: Økonomi (repeated in 2 positions)
    // Ring 5 (outermost): Drift (repeated in 2 positions)

    // Exact Y positions based on reference SVG - adjusted up by 10px
    const calculateLabelPositions = () => {
        return {
            // Center labels
            center: {
                top: -8.6,
                bottom: 20.4
            },

            // Ring 1: Mønstring
            mønstring: {
                top: -94.6,
                bottom: 83.4
            },

            // Ring 2: Ferie
            ferie: {
                top: -131.6,
                bottom: 120.4
            },

            // Ring 3: Produktion
            produktion: {
                top: -160.6,
                bottom: 155
            },

            // Ring 4: Økonomi
            økonomi: {
                top: -197.6,
                bottom: 190.4
            },

            // Ring 5: Drift
            drift: {
                top: -235.6,
                bottom: 224.4
            }
        };
    };

    const preciseLabelPositions = calculateLabelPositions();

    const labelPositions = [
        // Center labels - Uddannelse and Træning stacked perfectly
        { label: "Uddannelse", x: 0, y: preciseLabelPositions.center.top, radius: 0 },
        { label: "Træning", x: 0, y: preciseLabelPositions.center.bottom, radius: 0 },

        // Ring 1 - Mønstring (labels[3] = Mønstring)
        { label: labels[3], x: 0, y: preciseLabelPositions.mønstring.top, radius: preciseLabelPositions.mønstring.radius },
        { label: labels[3], x: 0, y: preciseLabelPositions.mønstring.bottom, radius: preciseLabelPositions.mønstring.radius },

        // Ring 2 - Ferie (labels[4] = Ferie)
        { label: labels[4], x: 0, y: preciseLabelPositions.ferie.top, radius: preciseLabelPositions.ferie.radius },
        { label: labels[4], x: 0, y: preciseLabelPositions.ferie.bottom, radius: preciseLabelPositions.ferie.radius },

        // Ring 3 - Produktion (labels[2] = Produktion)
        { label: labels[2], x: 0, y: preciseLabelPositions.produktion.top, radius: preciseLabelPositions.produktion.radius },
        { label: labels[2], x: 0, y: preciseLabelPositions.produktion.bottom, radius: preciseLabelPositions.produktion.radius },

        // Ring 4 - Økonomi (labels[1] = Økonomi)
        { label: labels[1], x: 0, y: preciseLabelPositions.økonomi.top, radius: preciseLabelPositions.økonomi.radius },
        { label: labels[1], x: 0, y: preciseLabelPositions.økonomi.bottom, radius: preciseLabelPositions.økonomi.radius },

        // Ring 5 - Drift (labels[0] = Drift)
        { label: labels[0], x: 0, y: preciseLabelPositions.drift.top, radius: preciseLabelPositions.drift.radius },
        { label: labels[0], x: 0, y: preciseLabelPositions.drift.bottom, radius: preciseLabelPositions.drift.radius }
    ];

    labelPositions.forEach((pos, index) => {
        const url = index < 2 ? null : linksArr[labels.indexOf(pos.label)]; // No URLs for center labels

        const text = draw.text(pos.label)
            .x(pos.x)
            .y(pos.y)
            .translate(Cx, Cy)
            .fill(textColor);

        if (url) {
            text.click(() => handleOnClick(url))
                .on('mouseover', () => handleOnHover(text))
                .on('mouseout', () => handleOnHoverOut(text));
        }

        circleTextGroup.add(text);
    })

    circleTextGroup.font({
        family: fontFamily,
        size: fontSize_13,
        anchor: 'middle',
        stroke: 'gray',
        'stroke-width': 1,
        'stroke-opacity': 0.1,
    });

    circleTextGroup.insertAfter(circleGroup);
};



function determineIfCursorisInPie(mouseX, mouseY, Ax, Ay, Bx, By) {
    if (Ax == Bx && Ay == By) {
        return true;
    }

    const angleMouse = calculateAngle(mouseX, mouseY);
    const angleStart = calculateAngle(Bx, By);
    const angleEnd = calculateAngle(Ax, Ay);

    function calculateAngle(x, y) {
        return (Math.atan((x - Cx) / (y - Cy)) * (180 / Math.PI));
    }

    if ((mouseY < Cy && (By < Cy || Ay < Cy)) || (mouseY > Cy && (Ay > Cy || By > Cy))) {

        if (angleStart < angleEnd) {
            if ((angleStart < angleMouse) && (angleMouse < angleEnd)) {
                return true
            }

        } else if (angleStart > angleEnd) {

            if (angleMouse > angleStart) {
                return true
            } else if (angleMouse < angleEnd) {
                return true
            }
        }

    }
    return false
}

/* divide the circles in n amount of pies. T
his n is the size of the months array */
const drawPieLines = () => {
    // lines from center to outer circle
    const lines = calcLineCoord(P);
    lines.forEach((line) => {

        // The not so visible line
        const blackLines = draw.line(line.x1, line.y1, line.x2, line.y2)
            .stroke({ width: strokeWidth_1, color: '#E6E6E6' })

        //Goal: x == Cx
        // x + c = Cx
        // c = Cx - x
        // Thus: x + (Cx - x) = Cx

        // Vectors to move the coordinates by 
        const X_vector = line.x1 - line.x2;
        const Y_vector = line.y1 - line.y2;


        // The more visible line
        // Move the points by their respective vectors and only getting a tenth of it.
        const grayLines = draw.line(line.x2, line.y2, (line.x2 + X_vector * .09), (line.y2 + Y_vector * .09))
            .stroke({ width: strokeWidth_1, color: 'gray' })

        lineGroup.add(blackLines)
        lineGroup.add(grayLines);
    });

    lineGroup.insertBefore(circleTextGroup)
}


/* Draw the month labels + the area labels on the circles*/
const drawLabels = () => {

    const texts = calcTextCoord(P);
    texts.forEach((text) => {
        const monthTextInUpperCase = text.month[0].toUpperCase() + text.month.slice(1)
        // Calculate the center position of the gray ring area
        // Position at 98% from center towards the outer edge to properly center in gray ring
        const centerX = text.x1 + (text.x2 - text.x1) * 0.98;
        const centerY = text.y1 + (text.y2 - text.y1) * 0.98;

        const text2 = draw.text(monthTextInUpperCase)
            .font({
                family: fontFamily,
                size: fontSize_10,
                stroke: 'gray',
                'stroke-width': 1,
                'stroke-opacity': 0.1,
                anchor: 'middle'
            })
            .center(centerX, centerY);

        monthLabelGroup.add(text2);
    });
}


/* Draws the red line that represents the date */
const drawTimeLine = () => {
    let [innerX, innerY, outerX, outerY] = calcTimelineCoord(P);
    // Create the line from inner circle circumference to outer edge
    const line = draw.line(innerX, innerY, outerX, outerY).stroke({ width: 0.5, color: "red" });
    timeLineGroup.add(line);
    timeLineGroup.forward();
}


// Draw the bubbles
const drawDateBubbles = () => {
    // Helper function to detect and adjust overlapping bubbles
    const adjustOverlappingBubbles = (bubbles) => {
        const overlapThreshold = 35; // Distance threshold for overlap detection
        const radialOffset = 22; // Offset distance perpendicular to the ring (radially)

        // Group bubbles by proximity
        const groups = [];
        const processed = new Set();

        bubbles.forEach((bubble, i) => {
            if (processed.has(i)) return;

            const group = [bubble];
            processed.add(i);

            // Find all bubbles that overlap with this one
            bubbles.forEach((otherBubble, j) => {
                if (i !== j && !processed.has(j)) {
                    const distance = Math.sqrt(
                        Math.pow(bubble.Bx - otherBubble.Bx, 2) +
                        Math.pow(bubble.By - otherBubble.By, 2)
                    );

                    if (distance < overlapThreshold) {
                        group.push(otherBubble);
                        processed.add(j);
                    }
                }
            });

            groups.push(group);
        });

        // Adjust positions for overlapping groups
        groups.forEach(group => {
            if (group.length > 1) {
                // Keep the same angle (temporal position) but adjust radius
                const centerX = group[0].Bx;
                const centerY = group[0].By;
                const angle = Math.atan2(centerY - Cy, centerX - Cx);
                const baseRadius = Math.sqrt(Math.pow(centerX - Cx, 2) + Math.pow(centerY - Cy, 2));

                // Arrange bubbles radially (perpendicular to the arc)
                group.forEach((bubble, index) => {
                    // Calculate radial offset - distribute evenly around the base position
                    // For 2 bubbles: one inside, one outside
                    // For 3 bubbles: one inside, one center, one outside
                    // For more: distribute evenly
                    let radiusOffset = 0;

                    if (group.length === 2) {
                        // One inside, one outside the ring
                        radiusOffset = (index === 0) ? -radialOffset / 2 : radialOffset / 2;
                    } else if (group.length === 3) {
                        // One inside, one on ring, one outside
                        radiusOffset = (index - 1) * radialOffset / 2;
                    } else {
                        // Distribute evenly for more bubbles
                        radiusOffset = (index - (group.length - 1) / 2) * (radialOffset / 2);
                    }

                    const newRadius = baseRadius + radiusOffset;

                    // Update bubble position - same angle, different radius
                    bubble.adjustedBx = Cx + newRadius * Math.cos(angle);
                    bubble.adjustedBy = Cy + newRadius * Math.sin(angle);
                    bubble.isStaggered = true;
                    bubble.radiusOffset = radiusOffset;
                });
            }
        });
    };

    const handleOnHover = (e, circle, circleText, dateStr, text, description, dateObj) => {
        circle.stroke({ color: dateColor })
        circle.attr({ cursor: 'pointer' })
        circleText.attr({ cursor: 'pointer' })

        // Show process tooltip if it exists
        const tooltip = document.getElementById('processTooltip');
        if (tooltip) {
            const dateEl = tooltip.querySelector('.process-tooltip-date');
            const titleEl = tooltip.querySelector('.process-tooltip-title');
            const descEl = tooltip.querySelector('.process-tooltip-description');
            const emailEl = tooltip.querySelector('.process-tooltip-notification-email');
            const notificationDateEl = tooltip.querySelector('.process-tooltip-notification-date');
            const deadlineDateEl = tooltip.querySelector('.process-tooltip-deadline-date');
            const executionDateEl = tooltip.querySelector('.process-tooltip-execution-date');

            if (dateEl) dateEl.textContent = dateStr;
            if (titleEl) titleEl.textContent = text || '';
            if (descEl) descEl.textContent = description || '';

            // Format and display all HjuletsProcesser features
            if (emailEl) emailEl.textContent = dateObj.notificationEmail || '';
            if (notificationDateEl) {
                const notifDate = dateObj.notificationDate ? new Date(dateObj.notificationDate) : null;
                notificationDateEl.textContent = notifDate ? notifDate.toLocaleDateString('da-DK') : '';
            }
            if (deadlineDateEl) {
                const deadlineDate = dateObj.deadlineDate ? new Date(dateObj.deadlineDate) : null;
                deadlineDateEl.textContent = deadlineDate ? deadlineDate.toLocaleDateString('da-DK') : '';
            }
            if (executionDateEl) {
                const execDate = dateObj.executionDate ? new Date(dateObj.executionDate) : null;
                executionDateEl.textContent = execDate ? execDate.toLocaleDateString('da-DK') : '';
            }

            // Get mouse coordinates - SharePoint Classic compatible
            let mouseX, mouseY;

            // Debug logging for SharePoint Classic troubleshooting
            const isSharePoint = typeof _spPageContextInfo !== 'undefined';
            const debugTooltip = window.location.search.includes('debugtooltip=true');

            if (e && e.clientX !== undefined && e.clientY !== undefined) {
                // SharePoint Classic fix: Account for container positioning
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

                // Get the YearWheel container position in SharePoint Classic
                let containerOffsetX = 0, containerOffsetY = 0;
                if (isSharePoint) {
                    // Find the SVG container to get its position
                    const svgContainer = document.querySelector('svg');
                    if (svgContainer) {
                        const containerRect = svgContainer.getBoundingClientRect();
                        containerOffsetX = containerRect.left;
                        containerOffsetY = containerRect.top;
                    }
                }

                // Check if we're in an iframe (common in SharePoint)
                let frameOffsetX = 0, frameOffsetY = 0;
                if (window !== window.top) {
                    try {
                        const frameElement = window.frameElement;
                        if (frameElement) {
                            const frameRect = frameElement.getBoundingClientRect();
                            frameOffsetX = frameRect.left;
                            frameOffsetY = frameRect.top;
                        }
                    } catch (ex) {
                        // Cross-origin iframe, ignore frame offset
                    }
                }

                // Use client coordinates directly for SharePoint Classic with fixed positioning
                mouseX = e.clientX; // Fixed positioning uses viewport coordinates
                mouseY = e.clientY;

                // Debug logging
                if (debugTooltip) {
                    console.log('YearWheel Tooltip Debug:', {
                        isSharePoint,
                        rawCoords: { x: e.clientX, y: e.clientY },
                        scroll: { left: scrollLeft, top: scrollTop },
                        containerOffset: { x: containerOffsetX, y: containerOffsetY },
                        frameOffset: { x: frameOffsetX, y: frameOffsetY },
                        finalCoords: { x: mouseX, y: mouseY },
                        inFrame: window !== window.top
                    });
                }
            } else {
                // Fallback: use the SVG circle's position relative to the page
                const rect = circle.node.getBoundingClientRect();
                const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
                mouseX = rect.left + scrollLeft + (rect.width / 2);
                mouseY = rect.top + scrollTop + (rect.height / 2);
            }

            // Get viewport dimensions - SharePoint Classic compatible
            const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

            // Show tooltip temporarily to get its dimensions
            tooltip.style.visibility = 'hidden';
            tooltip.style.position = 'fixed'; // Ensure fixed positioning for SharePoint Classic
            tooltip.classList.add('visible');
            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            tooltip.classList.remove('visible');
            tooltip.style.visibility = 'visible';

            // Calculate optimal position relative to viewport (fixed positioning)
            let left = mouseX - (tooltipWidth / 2);
            let top = mouseY - tooltipHeight - 15; // 15px above cursor

            // Prevent tooltip from going off-screen horizontally
            const minLeft = 10;
            const maxLeft = viewportWidth - tooltipWidth - 10;
            if (left < minLeft) left = minLeft;
            if (left > maxLeft) left = maxLeft;

            // Prevent tooltip from going off-screen vertically
            const minTop = 10;
            const maxTop = viewportHeight - tooltipHeight - 10;

            if (top < minTop) {
                // If tooltip would go above viewport, show it below the cursor
                top = mouseY + 15;
            }

            // Final check - if it still doesn't fit below, center it vertically
            if (top > maxTop) {
                top = mouseY - (tooltipHeight / 2);
                if (top < minTop) top = minTop;
                if (top > maxTop) top = maxTop;
            }

            // Force positioning for SharePoint Classic compatibility
            tooltip.style.setProperty('position', 'fixed', 'important');
            tooltip.style.setProperty('left', left + 'px', 'important');
            tooltip.style.setProperty('top', top + 'px', 'important');
            tooltip.classList.add('visible');
        }
    }


    const handleOnLeave = (e, circle) => {
        circle.stroke({ color: textColor })

        // Hide tooltip
        const tooltip = document.getElementById('processTooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }



    const handleOnClick = (dateStr, boxText, description, dateObj) => {
        // Try modern popup first (popup-overlay structure)
        let overlay = document.getElementById('popup-overlay');
        let dateEl = document.getElementById('popup-date');
        let titleEl = document.getElementById('popup-title');
        let descEl = document.getElementById('popup-description');
        let emailEl = document.getElementById('popup-notification-email');
        let notificationDateEl = document.getElementById('popup-notification-date');
        let deadlineDateEl = document.getElementById('popup-deadline-date');
        let closeBtn = document.getElementById('popup-close');

        if (overlay && dateEl && titleEl && descEl) {
            // Use modern popup
            dateEl.textContent = dateStr;
            titleEl.textContent = boxText || 'Process';
            descEl.textContent = description || 'Ingen beskrivelse tilgængelig';

            // Populate all HjuletsProcesser features
            if (emailEl) {
                const email = dateObj?.notificationEmail;
                emailEl.textContent = email ? `Notifikation email: ${email}` : '';
            }
            if (notificationDateEl) {
                const notifDate = dateObj?.notificationDate ? new Date(dateObj.notificationDate) : null;
                notificationDateEl.textContent = notifDate ? `Notifikation: ${notifDate.toLocaleDateString('da-DK')}` : '';
            }
            if (deadlineDateEl) {
                const deadlineDate = dateObj?.deadlineDate ? new Date(dateObj.deadlineDate) : null;
                deadlineDateEl.textContent = deadlineDate ? `Deadline: ${deadlineDate.toLocaleDateString('da-DK')}` : '';
            }

            overlay.classList.add('show');

            // Add close handler if not already added
            if (closeBtn && !closeBtn.hasAttribute('data-handler')) {
                closeBtn.setAttribute('data-handler', 'true');
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();

                    // SharePoint Classic specific: prevent any MDS interference
                    if (typeof window._spNavigationManager !== 'undefined') {
                        window._spNavigationManager.pauseRedirection();
                    }

                    overlay.classList.remove('show');

                    // Resume after a short delay
                    if (typeof window._spNavigationManager !== 'undefined') {
                        setTimeout(() => {
                            try {
                                window._spNavigationManager.resumeRedirection();
                            } catch (e) { }
                        }, 100);
                    }
                });
            }
        } else {
            // Fallback: create simple popup if elements don't exist
            const popUpBox = document.querySelector('#popUpBox');
            if (popUpBox) {
                popUpBox.innerHTML = `
                    <div class="popUpBox-container">
                        <p class="popUpBoxText">${dateStr}</p>
                        <p class="popUpBoxText">${boxText}</p>
                        <button id="popup-btn" class="popUpBoxButton">X</button>
                    </div>`;

                const button = document.querySelector('#popup-btn');
                if (button) {
                    button.addEventListener("click", () => {
                        popUpBox.innerHTML = '';
                    });
                }
            } else {
                console.warn('YearWheel: No popup container found');
            }
        }
    }

    // This gets called through the button in the popup box
    function handleCloseButton() {
        const overlay = document.getElementById('popup-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        } else {
            const popUpBox = document.querySelector('#popUpBox');
            if (popUpBox) {
                popUpBox.innerHTML = '';
            }
        }
    }

    const labels = labelsAndLinks.map(item => item.Title);

    // For each label, create a group - expect the fst 
    labels.slice(1).forEach((label, index) => {
        // Adding id, so that i can identify the for zoom effect
        const bubbleGroup = draw.group().id('bubbleGroup-' + index);
        const boxGroup = draw.group();
        let bubbleGroups = [];

        // For each month, calculate the bubble dates
        P.forEach(month => {
            bubbleGroups.push(calcBubbelDates(P, months[month], label, areaLabel[label]));
        });

        // Filter out the empty arrays
        bubbleGroups = bubbleGroups.filter(arr => arr.length > 0);
        // Sort the dates within each bubblegroup
        bubbleGroups.forEach(arr => arr.sort((a, b) => new Date(a.date.date) - new Date(b.date.date)));

        // Flatten all bubbles and adjust overlapping ones
        let allBubblesForLabel = [];
        bubbleGroups.forEach(arr => {
            allBubblesForLabel = allBubblesForLabel.concat(arr);
        });
        adjustOverlappingBubbles(allBubblesForLabel);

        bubbleGroups.forEach((bubbleGroupArr) => {

            // Checking again for only the non empty arrays
            bubbleGroupArr && bubbleGroupArr.length > 0 && bubbleGroupArr.forEach((bubble, i) => {

                const day = bubble.date.date.getDate();
                const month = bubble.date.date.getMonth() + 1;
                const year = bubble.date.date.getFullYear();
                const dateStr = `${day}-${month}-${year}`;
                const description = bubble.date.description || '';

                // Create a sub-group for this individual bubble (circle + text as one unit)
                const singleBubbleGroup = draw.group();

                // Use adjusted positions if available (for overlapping bubbles)
                const bubbleX = bubble.adjustedBx || bubble.Bx;
                const bubbleY = bubble.adjustedBy || bubble.By;

                // Create the bubble circle - size matches ring thickness (30px diameter)
                const bubbleCirle = draw.circle(30)
                    .cx(bubbleX)
                    .cy(bubbleY)
                    .fill(areaLabel[label].lineColor)
                    .stroke(textColor)

                // Create the bubble circle text (The actual date) 
                const bubbleCircleText = draw.text(bubble.date.date.getDate() === 0 ? i.toString() : (bubble.date.date.getDate()).toString())
                    .font({
                        family: fontFamily,
                        anchor: 'middle',
                        fill: 'white',
                        size: fontSize_12,
                        stroke: 'gray',
                        'stroke-width': 1,
                        'stroke-opacity': 0.010,
                    })
                    .center(bubbleX, bubbleY)

                // Add both elements to the sub-group (no invisible hover area needed)
                singleBubbleGroup.add(bubbleCirle);
                singleBubbleGroup.add(bubbleCircleText);

                // Add subtle visual indicator for overlapping dates
                if (bubble.isStaggered && bubble.radiusOffset) {
                    // Add a thin ring or stroke to indicate this bubble is part of a group
                    bubbleCirle.stroke({ width: 2, opacity: 0.8 });
                }

                // No highlight circle needed - using color changes only

                // Simple shared hover functions for both circle and text - color changes only
                const showHover = (e) => {
                    // Just change colors, no size animation
                    bubbleCirle.stroke({ color: '#ffffff', width: 3 }); // White border highlight
                    bubbleCirle.fill('#' + bubbleCirle.fill().substring(1)); // Slightly brighter fill
                    bubbleCircleText.fill('#000000'); // Make text black for contrast

                    // Pass mouse event to get cursor position
                    handleOnHover(e, bubbleCirle, bubbleCircleText, dateStr, bubble.date.text, bubble.date.description || description, bubble.date);
                };

                // Separate function for mousemove to update tooltip position
                const updateTooltipPosition = (e) => {
                    const tooltip = document.getElementById('processTooltip');
                    if (tooltip && tooltip.classList.contains('visible')) {
                        // Update tooltip position to follow cursor - SharePoint Classic compatible
                        let mouseX, mouseY;

                        // Get the page scroll offset and frame offset
                        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

                        // Check if we're in an iframe (common in SharePoint)
                        let frameOffsetX = 0, frameOffsetY = 0;
                        if (window !== window.top) {
                            try {
                                const frameElement = window.frameElement;
                                if (frameElement) {
                                    const frameRect = frameElement.getBoundingClientRect();
                                    frameOffsetX = frameRect.left;
                                    frameOffsetY = frameRect.top;
                                }
                            } catch (ex) {
                                // Cross-origin iframe, ignore frame offset
                            }
                        }

                        mouseX = e.clientX + scrollLeft + frameOffsetX;
                        mouseY = e.clientY + scrollTop + frameOffsetY;

                        // Get viewport dimensions - SharePoint Classic compatible
                        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
                        const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
                        const tooltipWidth = tooltip.offsetWidth;
                        const tooltipHeight = tooltip.offsetHeight;

                        // Calculate optimal position relative to document
                        let left = mouseX - (tooltipWidth / 2);
                        let top = mouseY - tooltipHeight - 15; // 15px above cursor

                        // Prevent tooltip from going off-screen horizontally
                        const minLeft = scrollLeft + 10;
                        const maxLeft = scrollLeft + viewportWidth - tooltipWidth - 10;
                        if (left < minLeft) left = minLeft;
                        if (left > maxLeft) left = maxLeft;

                        // Prevent tooltip from going off-screen vertically
                        const minTop = scrollTop + 10;
                        const maxTop = scrollTop + viewportHeight - tooltipHeight - 10;

                        if (top < minTop) {
                            // If tooltip would go above viewport, show it below the cursor
                            top = mouseY + 15;
                        }

                        // Final check - if it still doesn't fit below, center it vertically
                        if (top > maxTop) {
                            top = mouseY - (tooltipHeight / 2);
                            if (top < minTop) top = minTop;
                            if (top > maxTop) top = maxTop;
                        }

                        tooltip.style.setProperty('position', 'fixed', 'important');
                        tooltip.style.setProperty('left', left + 'px', 'important');
                        tooltip.style.setProperty('top', top + 'px', 'important');
                    }
                };

                const hideHover = (e) => {
                    // Reset to original colors
                    bubbleCirle.stroke({ color: textColor, width: 1 });
                    bubbleCirle.fill(areaLabel[label].lineColor); // Reset to original area color
                    bubbleCircleText.fill('white'); // Reset text to white
                    handleOnLeave(e, bubbleCirle);
                };

                // Add hover events directly to both circle and text with proper mouse tracking
                bubbleCirle
                    .on('mouseover', showHover)
                    .on('mouseout', hideHover)
                    .on('mousemove', updateTooltipPosition) // Update tooltip position as cursor moves
                    .click(() => handleOnClick(dateStr, bubble.date.text || '', bubble.date.description || '', bubble.date))
                    .attr({ cursor: 'pointer' });

                bubbleCircleText
                    .on('mouseover', showHover)
                    .on('mouseout', hideHover)
                    .on('mousemove', updateTooltipPosition) // Update tooltip position as cursor moves
                    .click(() => handleOnClick(dateStr, bubble.date.text || '', bubble.date.description || '', bubble.date))
                    .attr({ cursor: 'pointer' });

                // Add the complete bubble unit to the main group
                bubbleGroup.add(singleBubbleGroup);
            });
        });

        // get all the process bubble circles (collected during creation, excludes highlight circles)
        let circles = [];
        bubbleGroup.children().forEach(child => {
            if (child.type === 'g') { // singleBubbleGroup
                let processBubbles = child.find('circle').filter(circle => {
                    // Only include actual process bubbles (30px diameter = 15px radius)
                    const radius = parseFloat(circle.attr('r'));
                    return radius && radius <= 15; // Process bubbles with 30px diameter
                });
                circles.push(...processBubbles);
            }
        });
        // Check if there are any circles
        if (circles[0] && circles[circles.length - 1]) {
            const x1 = parseFloat(circles[0].node.attributes[1].value);
            const y1 = parseFloat(circles[0].node.attributes[2].value);
            const x2 = parseFloat(circles[circles.length - 1].node.attributes[1].value);
            const y2 = parseFloat(circles[circles.length - 1].node.attributes[2].value);

            // Calculate arc radius to sit exactly at the CENTER of each corresponding ring
            // Updated for the new ring dimensions
            const arcRadiusMap = {
                "Drift": (driftCircleRadius + driftInnerRadius) / 2,        // Center of Drift ring
                "Økonomi": (økonomiCircleRadius + økonomiInnerRadius) / 2,  // Center of Økonomi ring
                "Produktion": (produktionCircleRadius + produktionInnerRadius) / 2, // Center of Produktion ring
                "Ferie": (ferieCircleRadius + ferieInnerRadius) / 2,        // Center of Ferie ring
                "Mønstring": (mønstringCircleRadius + mønstringInnerRadius) / 2,    // Center of Mønstring ring
                "U/T": uTCircleRadius / 2                                   // Center area
            };


            const ringRadius = arcRadiusMap[label] || 282.5; // Arc positioned at ring center

            // Calculate angles for start and end points
            const startAngle = Math.atan2(y1 - Cy, x1 - Cx);
            const endAngle = Math.atan2(y2 - Cy, x2 - Cx);
            let angle = endAngle - startAngle;

            // Calculate start and end points ON the ring circumference at the correct radius
            const arcStartX = Cx + ringRadius * Math.cos(startAngle);
            const arcStartY = Cy + ringRadius * Math.sin(startAngle);
            const arcEndX = Cx + ringRadius * Math.cos(endAngle);
            const arcEndY = Cy + ringRadius * Math.sin(endAngle);

            // Create sparkling arc - stroke width matches underlying ring thickness (30px)
            const arcPath = draw.path()
                .stroke({ color: areaLabel[label].lineColor, width: 30 })
                .fill('none')

            // Calculate point on path
            angle < 0 && (angle += 2 * Math.PI);

            let largeArcFlag = angle * (180 / Math.PI) < 180 ? 0 : 1
            const sweepFlag = 1 // Always go clock-wise

            const d = `M${arcStartX},${arcStartY} A${ringRadius},${ringRadius} 0, ${largeArcFlag} , ${sweepFlag}  ${arcEndX},${arcEndY}`;
            arcPath.attr('d', d);

            // Set the stacking order explicitly
            // Insert the bubbleGroup before the arcPath
            bubbleGroup.insertAfter(circleTextGroup);
            arcPath.insertBefore(circleTextGroup);
            boxGroup.insertAfter(timeLineGroup);
            monthLabelGroup.insertAfter(timeLineGroup);
            informationGroup.front();
        }
    });
}

const handleMouseOver = (e, obj, obj2) => {
    obj.opacity(0.5);
    obj.attr({ cursor: 'pointer' })
    obj2.attr({ cursor: 'pointer' })
}

const handleMouseOut = (e, obj) => {
    obj.opacity(1);
}

function getZoomPercentage(zoomLevel) {
    // Calculate percentage based on months shown
    // 12 months = 0%, 6 months = 33%, 3 months = 66%, 1 month = 100%
    switch (P.length) {
        case 12: return 0;
        case 6: return 33;
        case 3: return 66;
        case 1: return 100;
        default: return 0;
    }
}

const handlePop = () => {
    // Transition to next zoom state: 12→6→3→1
    if (P.length === 12) {
        // Remove 6 months, keep 6
        const monthsToRemove = 6;
        const zoomedInMonth = P.findIndex((month) => month === allMonths[currentMonth]);
        const focusIndex = zoomedInMonth !== -1 ? zoomedInMonth : 0;
        determineWhichToRemove(P, focusIndex, monthsToRemove, 33);
    } else if (P.length === 6) {
        // Remove 3 months, keep 3  
        const monthsToRemove = 3;
        const zoomedInMonth = P.findIndex((month) => month === allMonths[currentMonth]);
        const focusIndex = zoomedInMonth !== -1 ? zoomedInMonth : 0;
        determineWhichToRemove(P, focusIndex, monthsToRemove, 66);
    } else if (P.length === 3) {
        // Remove 2 months, keep 1
        const monthsToRemove = 2;
        const zoomedInMonth = P.findIndex((month) => month === allMonths[currentMonth]);
        const focusIndex = zoomedInMonth !== -1 ? zoomedInMonth : 0;
        determineWhichToRemove(P, focusIndex, monthsToRemove, 100);
    }
};

const handlePush = () => {
    // Transition to previous zoom state: 1→3→6→12
    if (P.length === 1) {
        // Go from 1 to 3 months (use mapping key 2)
        const currentMonth = P[0]; // Use the single month as focus
        determineWhichToInsert(P, 2, 66, currentMonth); // Should be 66% for 3 months
    } else if (P.length === 3) {
        // Go from 3 to 6 months (use mapping key 3)
        const currentMonth = P[0]; // Use first month as focus
        determineWhichToInsert(P, 3, 33, currentMonth); // Should be 33% for 6 months
    } else if (P.length === 6) {
        // Go from 6 to 12 months (no mapping, manually set to all months)
        P.length = 0;
        P.push(...allMonths);
        draw.clear();
        drawYearWheel();
        drawZoomPercentage(0); // Should be 0% for 12 months
    }
};

const pushAndPopMonths = () => {

    const pushBox = draw.rect(30, 30)
        .fill('transparent')
        .move(Cx + 500, Cy - 50)
        .stroke({ color: 'gray', width: 1 })
        .click(handlePop)
        .mouseover((e) => handleMouseOver(e, pushBox, pushTxt))
        .mouseout((e) => handleMouseOut(e, pushBox))
        .back();

    const pushTxt = draw.text("+")
        .font({
            family: fontFamily,
            size: fontSize_22,
            fill: 'gray',
            stroke: 'gray',
            'stroke-width': 1,
            'stroke-opacity': 0.1,
            anchor: 'middle'
        })
        .center(Cx + 515, Cy - 35)
        .mouseover((e) => handleMouseOver(e, pushBox, pushTxt))
        .mouseout((e) => handleMouseOut(e, pushBox))
        .click(handlePop)
        .insertAfter(pushBox);

    const popBox = draw.rect(30, 30)
        .fill('transparent')
        .move(Cx + 500, Cy + 20)
        .stroke({ color: 'gray', width: 1 })
        .click(handlePush)
        .mouseover((e) => handleMouseOver(e, popBox, popTxt))
        .mouseout((e) => handleMouseOut(e, popBox))
        .back();

    const popTxt = draw.text("-")
        .font({
            family: fontFamily,
            size: fontSize_22,
            fill: 'gray',
            stroke: 'gray',
            'stroke-width': 1,
            'stroke-opacity': 0.1,
            anchor: 'middle'
        })
        .center(Cx + 515, Cy + 35)
        .click(handlePush)
        .mouseover((e) => handleMouseOver(e, popBox, popTxt))
        .mouseout((e) => handleMouseOut(e, popBox))
        .insertAfter(popBox);
}




let coordinatesInitialized = false;

const drawYearWheel = () => {
    // Only update coordinates once on initial load
    if (!coordinatesInitialized) {
        updateCenterCoordinates();
        coordinatesInitialized = true;
    }
    inititilizeGroups();
    drawCircles();
    drawLabels();
    drawPieLines()
    drawTimeLine();
    drawDateBubbles();
    pushAndPopMonths();
}

function drawZoomPercentage(zoomPercentage) {
    zoomPercentage = zoomPercentage || 0;

    const zoomPercentageBox = draw.rect(30, 30)
        .fill('transparent')
        .stroke({ color: 'gray', width: 1 })
        .move(Cx + 500, Cy - 15)
        .back();

    const zoomPercentageTxt = draw.text(zoomPercentage.toString() + "%")
        .font({
            family: fontFamily,
            size: 10,
            fill: 'gray',
            stroke: 'black',
            'stroke-width': 1,
            'stroke-opacity': 0.1,
        })
        .css('userSelect', 'none');

    // Center the text in the box
    const boxCenterX = (Cx + 500) + 15; // box x position + half of box width (30/2)
    const boxCenterY = (Cy - 15) + 15; // box y position + half of box height (30/2)
    const textBBox = zoomPercentageTxt.bbox();
    zoomPercentageTxt.move(boxCenterX - textBBox.width / 2, boxCenterY - textBBox.height / 2);

    zoomPercentageTxt.insertAfter(zoomPercentageBox);
}

} // Close the SharePoint operation check else block
