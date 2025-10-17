// Radius of the year wheel - all rings same thickness with consistent gaps
export const monthCircleOutterRadius = 280; // Outer radius
export const monthCirlceInnerRadius = 250;  // Inner boundary of month ring (30px thick gray ring)
// Drift ring: 30px thick with 5px gap
export const driftCircleRadius = 245;  // 250 - 5 gap
export const driftInnerRadius = 215;   // 245 - 30 thickness
// Økonomi ring: 30px thick with 5px gap
export const økonomiCircleRadius = 210;  // 215 - 5 gap
export const økonomiInnerRadius = 180;   // 210 - 30 thickness
// Produktion ring: 30px thick with 5px gap
export const produktionCircleRadius = 175;  // 180 - 5 gap
export const produktionInnerRadius = 145;   // 175 - 30 thickness
// Ferie ring: 30px thick with 5px gap
export const ferieCircleRadius = 140;  // 145 - 5 gap
export const ferieInnerRadius = 110;    // 140 - 30 thickness
// Mønstring ring: 30px thick with 5px gap
export const mønstringCircleRadius = 105;  // 110 - 5 gap
export const mønstringInnerRadius = 75;   // 105 - 30 thickness
// U/T center: center circle with 5px gap
export const uTCircleRadius = 70;  // 75 - 5 gap

// 1300x935
// Center of the year wheel - calculated dynamically based on container size
export let Cx = 650; // Default for 800x600 viewport  
export let Cy = 467;
const R = monthCircleOutterRadius;

// Colors of circles
export const monthCircleColor = "#ececec";
export const driftCircleColor = "#faf7f2";
export const økonomiCircleColor = "#ece7f2";
export const produktionCircleColor = "#e1f2f9";
export const mønstringCircleColor = "#faf2f3";
export const ferieCircleColor = "#eaf5dc";
export const uTCircleColor = "#e5f5fc";

// Colors of the stroke of the circles
export const monthCircleStrokeColor = "#d6d6d6";
export const whiteStrokeColor = "white";

// Colors of the text
export const textColor = "black";
export const dateColor = "black";

// Stroke width - scaled up proportionally for 1920x1080 viewport
export const strokeWidth_1 = 2;
export const strokeWidth_2 = 4;
export const strokeWidth_4 = 8;
export const strokeWidth_15 = 30;

// Font size - scaled for 800x600 viewport
export const fontSize_10 = 12;
export const fontSize_12 = 14;
export const fontSize_13 = 15;
export const fontSize_22 = 24;

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
        days: [...Array(29).keys()],
        areas: {}
    },
    mar: {
        value: 2,
        days: [...Array(32).keys()],
        areas: {}
    },
    apr: {
        value: 3,
        days: [...Array(31).keys()],
        areas: {}
    },
    maj: {
        value: 4,
        days: [...Array(32).keys()],
        areas: {}
    },
    jun: {
        value: 5,
        days: [...Array(31).keys()],
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
        days: [...Array(31).keys()],
        areas: {}
    },
    okt: {
        value: 9,
        days: [...Array(32).keys()],
        areas: {}
    },
    nov: {
        value: 10,
        days: [...Array(31).keys()],
        areas: {}
    },
    dec: {
        value: 11,
        days: [...Array(32).keys()],
        areas: {}
    }
};

// Dummy labels and links data
export const labelsAndLinks = [
    { Title: "Drift", Url: { url: "https://example.com/operations" } },
    { Title: "Økonomi", Url: { url: "https://example.com/economy" } },
    { Title: "Produktion", Url: { url: "https://example.com/production" } },
    { Title: "Mønstring", Url: { url: "https://example.com/muster" } },
    { Title: "Ferie", Url: { url: "https://example.com/vacation" } },
    { Title: "U/T", Url: { url: "https://example.com/ut" } }
];

// Area labels with colors matching the populated YearWheel image
export const areaLabel = {
    "Drift": { lineColor: "#c0c0c0", Ccolor: "#ffffff" },  // Gray for outer Drift ring
    "Økonomi": { lineColor: "#9b59b6", Ccolor: "#ffffff" },  // Purple for Økonomi
    "Produktion": { lineColor: "#3498db", Ccolor: "#ffffff" },  // Blue for Production  
    "Ferie": { lineColor: "#7fb069", Ccolor: "#ffffff" },  // Green for Ferie (vacation) - matching reference
    "Mønstring": { lineColor: "#d4a5a5", Ccolor: "#ffffff" },  // Pinkish-red for Mønstring - matching reference
    "U/T": { lineColor: "#95a5a6", Ccolor: "#ffffff" }  // Gray for U/T
};

// Links for the circles
export const links = {
    "Aktiviteter": [
        { title: "Aktivitet 1", url: "https://example.com/activity1" },
        { title: "Aktivitet 2", url: "https://example.com/activity2" },
        { title: "Aktivitet 3", url: "https://example.com/activity3" }
    ],
    "Blanketter": [
        { title: "Blankett A", url: "https://example.com/form-a" },
        { title: "Blankett B", url: "https://example.com/form-b" }
    ],
    "Info": [
        { title: "Information 1", url: "https://example.com/info1" },
        { title: "Information 2", url: "https://example.com/info2" }
    ],
    "Loggen": [
        { title: "Log Entry 1", url: "https://example.com/log1" },
        { title: "Log Entry 2", url: "https://example.com/log2" }
    ],
    "Bestemmelser": [
        { title: "Regel 1", url: "https://example.com/rule1" },
        { title: "Regel 2", url: "https://example.com/rule2" }
    ]
};

// Dummy process data 
let processData = [];

// Generate some dummy dates for demonstration
const currentYear = new Date().getFullYear();
const generateDummyDates = () => {
    const data = [];

    // Based on the populated YearWheel image, create specific events with numbered circles
    // matching the visual layout shown in the reference image

    // Økonomi (Economy) - Purple ring events
    data.push(
        {
            date: new Date(currentYear, 0, 28),
            text: "Budget Review",
            description: "Annual budget review meeting to evaluate financial performance and adjust allocations for the upcoming quarters based on market conditions",
            area: "Økonomi",
            notificationEmail: "finance@company.com",
            notificationDate: new Date(currentYear, 0, 21), // 7 days before deadline
            deadlineDate: new Date(currentYear, 0, 28),
            executionDate: new Date(currentYear, 0, 30)
        },
        {
            date: new Date(currentYear, 1, 15),
            text: "Q1 Financial Report",
            description: "Quarterly financial report submission including revenue, expenses, and profitability analysis with key performance indicators",
            area: "Økonomi",
            notificationEmail: "finance@company.com",
            notificationDate: new Date(currentYear, 1, 8),
            deadlineDate: new Date(currentYear, 1, 15),
            executionDate: new Date(currentYear, 1, 17)
        },
        {
            date: new Date(currentYear, 3, 30),
            text: "Annual Audit",
            description: "External audit process for financial compliance and internal control assessment to ensure regulatory requirements are met",
            area: "Økonomi",
            notificationEmail: "audit@company.com",
            notificationDate: new Date(currentYear, 3, 23),
            deadlineDate: new Date(currentYear, 3, 30),
            executionDate: new Date(currentYear, 4, 2)
        },
        {
            date: new Date(currentYear, 6, 1),
            text: "Mid-year Budget",
            description: "Mid-year budget revision based on actual performance and updated forecasts with strategic adjustments",
            area: "Økonomi",
            notificationEmail: "finance@company.com",
            notificationDate: new Date(currentYear, 5, 24),
            deadlineDate: new Date(currentYear, 6, 1),
            executionDate: new Date(currentYear, 6, 3)
        },
        {
            date: new Date(currentYear, 8, 17),
            text: "Q3 Report",
            description: "Third quarter financial performance review and year-end projections with risk assessment and mitigation strategies",
            area: "Økonomi",
            notificationEmail: "finance@company.com",
            notificationDate: new Date(currentYear, 8, 10),
            deadlineDate: new Date(currentYear, 8, 17),
            executionDate: new Date(currentYear, 8, 19)
        },
        // COLLISION TEST: Same date as Budget Review (Jan 28)
        {
            date: new Date(currentYear, 0, 28),
            text: "Tax Filing Deadline",
            description: "Corporate tax filing deadline - all documentation must be submitted",
            area: "Økonomi",
            notificationEmail: "tax@company.com",
            notificationDate: new Date(currentYear, 0, 21),
            deadlineDate: new Date(currentYear, 0, 28),
            executionDate: new Date(currentYear, 0, 28)
        },
        // COLLISION TEST: Another one on Jan 28 (3 bubbles same date)
        {
            date: new Date(currentYear, 0, 28),
            text: "Payment Processing",
            description: "Monthly payment processing for all vendors and contractors",
            area: "Økonomi",
            notificationEmail: "payments@company.com",
            notificationDate: new Date(currentYear, 0, 25),
            deadlineDate: new Date(currentYear, 0, 28),
            executionDate: new Date(currentYear, 0, 28)
        },
        {
            date: new Date(currentYear, 10, 28),
            text: "Year-end Planning",
            description: "Strategic financial planning session for next year's budget and investment priorities aligned with organizational goals",
            area: "Økonomi",
            notificationEmail: "finance@company.com",
            notificationDate: new Date(currentYear, 10, 21),
            deadlineDate: new Date(currentYear, 10, 28),
            executionDate: new Date(currentYear, 10, 30)
        }
    );

    // Produktion (Production) - Blue ring events  
    data.push(
        {
            date: new Date(currentYear, 0, 10),
            text: "Production Start",
            description: "Initiate new production cycle with updated processes and quality control measures for optimal efficiency",
            area: "Produktion",
            notificationEmail: "production@company.com",
            notificationDate: new Date(currentYear, 0, 3),
            deadlineDate: new Date(currentYear, 0, 10),
            executionDate: new Date(currentYear, 0, 12)
        },
        {
            date: new Date(currentYear, 1, 3),
            text: "System Upgrade",
            description: "Major system upgrade including software updates, security patches, and performance optimizations",
            area: "Produktion",
            notificationEmail: "it@company.com",
            notificationDate: new Date(currentYear, 0, 27),
            deadlineDate: new Date(currentYear, 1, 3),
            executionDate: new Date(currentYear, 1, 5)
        },
        // COLLISION TEST: Two events on March 18
        {
            date: new Date(currentYear, 2, 18),
            text: "Maintenance Window",
            description: "Scheduled maintenance for production equipment including calibration, cleaning, and preventive repairs",
            area: "Produktion",
            notificationEmail: "maintenance@company.com",
            notificationDate: new Date(currentYear, 2, 11),
            deadlineDate: new Date(currentYear, 2, 18),
            executionDate: new Date(currentYear, 2, 20)
        },
        {
            date: new Date(currentYear, 2, 18),
            text: "Safety Audit",
            description: "Safety compliance audit during maintenance period",
            area: "Produktion",
            notificationEmail: "safety@company.com",
            notificationDate: new Date(currentYear, 2, 11),
            deadlineDate: new Date(currentYear, 2, 18),
            executionDate: new Date(currentYear, 2, 18)
        },
        {
            date: new Date(currentYear, 4, 11),
            text: "Production Review",
            description: "Comprehensive review of production metrics, quality indicators, and process optimization opportunities",
            area: "Produktion",
            notificationEmail: "production@company.com",
            notificationDate: new Date(currentYear, 4, 4),
            deadlineDate: new Date(currentYear, 4, 11),
            executionDate: new Date(currentYear, 4, 13)
        },
        {
            date: new Date(currentYear, 7, 16),
            text: "Equipment Check",
            description: "Thorough inspection of all production equipment to ensure compliance with safety and quality standards",
            area: "Produktion",
            notificationEmail: "safety@company.com",
            notificationDate: new Date(currentYear, 7, 9),
            deadlineDate: new Date(currentYear, 7, 16),
            executionDate: new Date(currentYear, 7, 18)
        },
        {
            date: new Date(currentYear, 9, 1),
            text: "Production Planning",
            description: "Strategic planning session for upcoming production cycles including resource allocation and capacity planning",
            area: "Produktion",
            notificationEmail: "planning@company.com",
            notificationDate: new Date(currentYear, 8, 25),
            deadlineDate: new Date(currentYear, 9, 1),
            executionDate: new Date(currentYear, 9, 3)
        },
        {
            date: new Date(currentYear, 11, 12),
            text: "Year-end Production",
            description: "Final production run of the year with inventory assessment and preparation for year-end closure",
            area: "Produktion",
            notificationEmail: "production@company.com",
            notificationDate: new Date(currentYear, 11, 5),
            deadlineDate: new Date(currentYear, 11, 12),
            executionDate: new Date(currentYear, 11, 14)
        }
    );

    // Ferie (Holiday/Vacation) - Green ring events
    data.push(
        {
            date: new Date(currentYear, 0, 1),
            text: "New Year",
            description: "New Year's Day celebration - office closed for national holiday with emergency support available",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear - 1, 11, 25),
            deadlineDate: new Date(currentYear, 0, 1),
            executionDate: new Date(currentYear, 0, 1)
        },
        {
            date: new Date(currentYear, 2, 28),
            text: "Easter Break",
            description: "Easter holiday period with reduced operations and skeleton crew maintaining critical services",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 2, 21),
            deadlineDate: new Date(currentYear, 2, 28),
            executionDate: new Date(currentYear, 2, 28)
        },
        {
            date: new Date(currentYear, 2, 28),
            text: "Easter Break 2",
            description: "Easter holiday period with reduced operations and skeleton crew maintaining critical services",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 2, 21),
            deadlineDate: new Date(currentYear, 2, 28),
            executionDate: new Date(currentYear, 2, 28)
        },
        {
            date: new Date(currentYear, 4, 1),
            text: "May Day",
            description: "International Workers' Day - celebrating labor achievements with company-wide activities and recognition",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 3, 24),
            deadlineDate: new Date(currentYear, 4, 1),
            executionDate: new Date(currentYear, 4, 1)
        },
        {
            date: new Date(currentYear, 5, 23),
            text: "Midsummer",
            description: "Midsummer celebration marking the summer solstice with traditional festivities and team building events",
            area: "Ferie",
            notificationEmail: "events@company.com",
            notificationDate: new Date(currentYear, 5, 16),
            deadlineDate: new Date(currentYear, 5, 23),
            executionDate: new Date(currentYear, 5, 23)
        },
        {
            date: new Date(currentYear, 6, 10),
            text: "Summer Holiday",
            description: "First week of summer vacation period - majority of staff on leave with minimal operations",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 6, 3),
            deadlineDate: new Date(currentYear, 6, 10),
            executionDate: new Date(currentYear, 6, 10)
        },
        {
            date: new Date(currentYear, 6, 17),
            text: "Summer Holiday",
            description: "Second week of summer vacation - continued reduced operations with rotating skeleton crew",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 6, 10),
            deadlineDate: new Date(currentYear, 6, 17),
            executionDate: new Date(currentYear, 6, 17)
        },
        {
            date: new Date(currentYear, 6, 17),
            text: "Team Building Event",
            description: "Special team building activity for skeleton crew during summer holiday period",
            area: "Ferie",
            notificationEmail: "events@company.com",
            notificationDate: new Date(currentYear, 6, 10),
            deadlineDate: new Date(currentYear, 6, 17),
            executionDate: new Date(currentYear, 6, 17)
        },
        {
            date: new Date(currentYear, 6, 24),
            text: "Summer Holiday",
            description: "Final week of main summer vacation period - preparing for return to normal operations",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 6, 17),
            deadlineDate: new Date(currentYear, 6, 24),
            executionDate: new Date(currentYear, 6, 24)
        },
        {
            date: new Date(currentYear, 9, 12),
            text: "Autumn Break",
            description: "Autumn holiday period for rest and recuperation before year-end activities intensify",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 9, 5),
            deadlineDate: new Date(currentYear, 9, 12),
            executionDate: new Date(currentYear, 9, 12)
        },
        {
            date: new Date(currentYear, 11, 24),
            text: "Christmas Eve",
            description: "Christmas Eve celebration - early closure for holiday preparations and family time",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 11, 17),
            deadlineDate: new Date(currentYear, 11, 24),
            executionDate: new Date(currentYear, 11, 24)
        },
        {
            date: new Date(currentYear, 11, 31),
            text: "New Year's Eve",
            description: "New Year's Eve - celebrating year achievements and preparing for upcoming year challenges",
            area: "Ferie",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 11, 24),
            deadlineDate: new Date(currentYear, 11, 31),
            executionDate: new Date(currentYear, 11, 31)
        }
    );

    // Mønstring (Muster/Review) - Pink ring events
    data.push(
        {
            date: new Date(currentYear, 1, 10),
            text: "Staff Review",
            description: "Comprehensive staff evaluation including performance metrics, goal achievement, and development planning",
            area: "Mønstring",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 1, 3),
            deadlineDate: new Date(currentYear, 1, 10),
            executionDate: new Date(currentYear, 1, 12)
        },
        {
            date: new Date(currentYear, 3, 18),
            text: "Team Assessment",
            description: "Team dynamics and collaboration assessment with focus on improving cross-functional cooperation",
            area: "Mønstring",
            notificationEmail: "team-leads@company.com",
            notificationDate: new Date(currentYear, 3, 11),
            deadlineDate: new Date(currentYear, 3, 18),
            executionDate: new Date(currentYear, 3, 20)
        },
        {
            date: new Date(currentYear, 5, 30),
            text: "Mid-year Review",
            description: "Mid-year performance checkpoint with goal adjustments and career development discussions",
            area: "Mønstring",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 5, 23),
            deadlineDate: new Date(currentYear, 5, 30),
            executionDate: new Date(currentYear, 6, 2)
        },
        {
            date: new Date(currentYear, 8, 12),
            text: "Performance Review",
            description: "Formal performance evaluation with competency assessment and compensation review preparations",
            area: "Mønstring",
            notificationEmail: "hr@company.com",
            notificationDate: new Date(currentYear, 8, 5),
            deadlineDate: new Date(currentYear, 8, 12),
            executionDate: new Date(currentYear, 8, 14)
        },
        {
            date: new Date(currentYear, 10, 17),
            text: "Annual Review",
            description: "Annual comprehensive review including achievements, areas for improvement, and next year objectives",
            area: "Mønstring",
            notificationEmail: "management@company.com",
            notificationDate: new Date(currentYear, 10, 10),
            deadlineDate: new Date(currentYear, 10, 17),
            executionDate: new Date(currentYear, 10, 19)
        }
    );

    // Drift (Operations) - Outer ring events (less frequent, important milestones)
    data.push(
        {
            date: new Date(currentYear, 0, 15),
            text: "Operations Planning",
            description: "Annual operations strategy planning including resource allocation, process improvements, and technology roadmap",
            area: "Drift",
            notificationEmail: "operations@company.com",
            notificationDate: new Date(currentYear, 0, 8),
            deadlineDate: new Date(currentYear, 0, 15),
            executionDate: new Date(currentYear, 0, 17)
        },
        {
            date: new Date(currentYear, 2, 1),
            text: "Q1 Operations Review",
            description: "First quarter operations assessment with KPI analysis and corrective action planning",
            area: "Drift",
            notificationEmail: "operations@company.com",
            notificationDate: new Date(currentYear, 1, 23),
            deadlineDate: new Date(currentYear, 2, 1),
            executionDate: new Date(currentYear, 2, 3)
        },
        {
            date: new Date(currentYear, 5, 1),
            text: "Mid-year Operations",
            description: "Mid-year operational effectiveness review with adjustments to meet annual targets",
            area: "Drift",
            notificationEmail: "operations@company.com",
            notificationDate: new Date(currentYear, 4, 25),
            deadlineDate: new Date(currentYear, 5, 1),
            executionDate: new Date(currentYear, 5, 3)
        },
        {
            date: new Date(currentYear, 8, 1),
            text: "Q3 Operations Review",
            description: "Third quarter operational performance analysis with focus on year-end readiness",
            area: "Drift",
            notificationEmail: "operations@company.com",
            notificationDate: new Date(currentYear, 7, 25),
            deadlineDate: new Date(currentYear, 8, 1),
            executionDate: new Date(currentYear, 8, 3)
        },
        {
            date: new Date(currentYear, 11, 1),
            text: "Year-end Operations",
            description: "Year-end operational wrap-up including lessons learned and preparation for next year initiatives",
            area: "Drift",
            notificationEmail: "operations@company.com",
            notificationDate: new Date(currentYear, 10, 25),
            deadlineDate: new Date(currentYear, 11, 1),
            executionDate: new Date(currentYear, 11, 3)
        },
        // COLLISION TEST: Two events on June 1
        {
            date: new Date(currentYear, 5, 1),
            text: "Infrastructure Audit",
            description: "Critical infrastructure audit and compliance check",
            area: "Drift",
            notificationEmail: "infrastructure@company.com",
            notificationDate: new Date(currentYear, 4, 25),
            deadlineDate: new Date(currentYear, 5, 1),
            executionDate: new Date(currentYear, 5, 3)
        }
    );

    // Sort by date
    data.sort((a, b) => a.date - b.date);

    // Clear existing areas in months
    Object.keys(months).forEach(monthKey => {
        months[monthKey].areas = {};
    });

    // Validate and organize by month and area
    data.forEach(item => {
        // Validate dates before adding
        const validationErrors = validateEventDates(item);
        if (validationErrors.length > 0) {
            console.warn(`Validation errors for ${item.text}:`, validationErrors);
        }

        const monthKey = Object.keys(months)[item.date.getMonth()];
        if (!months[monthKey].areas[item.area]) {
            months[monthKey].areas[item.area] = [];
        }
        months[monthKey].areas[item.area].push({
            date: item.date,
            text: item.text,
            description: item.description || "",
            notificationEmail: item.notificationEmail,
            notificationDate: item.notificationDate,
            deadlineDate: item.deadlineDate,
            executionDate: item.executionDate
        });
    });

    return data;
};

// Function to update center coordinates based on actual SVG container size
export function updateCenterCoordinates() {
    const wrapper = document.getElementById('wrapper');
    const svg = wrapper?.querySelector('svg');

    if (svg) {
        const svgRect = svg.getBoundingClientRect();
        const viewBox = svg.viewBox.baseVal;

        // Use viewBox center coordinates for consistent positioning
        Cx = viewBox.width / 2;
        Cy = viewBox.height / 2;

        console.log(`Updated center coordinates: Cx=${Cx}, Cy=${Cy}`);
    }
}

// Validation function for dates
export function validateEventDates(event) {
    const errors = [];

    // Check that notification date is before deadline
    if (event.notificationDate && event.deadlineDate && event.notificationDate >= event.deadlineDate) {
        errors.push('Notification date must be before deadline date');
    }

    // Check that all required fields are present
    if (!event.notificationEmail) {
        errors.push('Notification email is required');
    }

    if (!event.description || event.description.trim() === '') {
        errors.push('Description is required');
    }

    if (!event.deadlineDate) {
        errors.push('Deadline date is required');
    }

    if (!event.executionDate) {
        errors.push('Execution date is required');
    }

    return errors;
}

// Generate the dummy data
processData = generateDummyDates();

// Mock SharePoint functions that simulate real SharePoint data structure
export async function retrievePaneler() {
    // Simulate HjuletsPaneler list data
    const panelerData = [
        { Title: "Aktivitet 1", Panel: "Aktiviteter", Url: { url: "https://example.com/activity1", description: "Activity 1" } },
        { Title: "Aktivitet 2", Panel: "Aktiviteter", Url: { url: "https://example.com/activity2", description: "Activity 2" } },
        { Title: "Blankett A", Panel: "Blanketter", Url: { url: "https://example.com/form-a", description: "Form A" } },
        { Title: "Info 1", Panel: "Info", Url: { url: "https://example.com/info1", description: "Information 1" } },
        { Title: "Log Entry", Panel: "Loggen", Url: { url: "https://example.com/log1", description: "Log 1" } },
        { Title: "Regel 1", Panel: "Bestemmelser", Url: { url: "https://example.com/rule1", description: "Rule 1" } }
    ];

    // Populate links structure as SharePoint would
    panelerData.forEach(item => {
        if (links[item.Panel]) {
            links[item.Panel].push({
                title: item.Title,
                url: item.Url.url
            });
        }
    });

    return Promise.resolve();
}

export async function retrieveProcesser() {
    // Clear existing data in months.areas to simulate fresh SharePoint load
    Object.keys(months).forEach(monthKey => {
        Object.keys(months[monthKey].areas).forEach(areaKey => {
            months[monthKey].areas[areaKey] = [];
        });
    });

    // Use the generated dummy process data and organize it by month and area
    processData.forEach(item => {
        const monthKey = Object.keys(months)[item.date.getMonth()];
        if (months[monthKey] && months[monthKey].areas[item.area]) {
            months[monthKey].areas[item.area].push({
                date: item.date,
                text: item.text,
                description: item.description || "",
                notificationEmail: item.notificationEmail,
                notificationDate: item.notificationDate,
                deadlineDate: item.deadlineDate,
                executionDate: item.executionDate
            });
        }
    });

    return Promise.resolve();
}

export async function retrieveLinks() {
    // Simulate HjuletsLinks list data with proper priority ordering
    const linksData = [
        { Title: "Drift", Priority: "0", Url: { url: "https://example.com/operations", description: "Operations" } },
        { Title: "Økonomi", Priority: "1", Url: { url: "https://example.com/economy", description: "Economy" } },
        { Title: "Produktion", Priority: "2", Url: { url: "https://example.com/production", description: "Production" } },
        { Title: "Mønstring", Priority: "3", Url: { url: "https://example.com/muster", description: "Muster" } },
        { Title: "Ferie", Priority: "4", Url: { url: "https://example.com/vacation", description: "Vacation" } }
    ];

    // Clear and repopulate labelsAndLinks as SharePoint would
    labelsAndLinks.length = 0;

    // Add a default item for U/T (center area)
    labelsAndLinks.push({ Title: "U/T", Url: { url: "#", description: "Uddannelse/Træning" } });

    // Add the links data sorted by priority
    linksData
        .sort((a, b) => parseInt(a.Priority) - parseInt(b.Priority))
        .forEach(item => {
            labelsAndLinks.push({
                Title: item.Title,
                Priority: item.Priority,
                Url: item.Url
            });
        });

    // Initialize areas in months structure based on labels
    const areaNames = linksData.map(item => item.Title);
    Object.keys(months).forEach(monthKey => {
        months[monthKey].areas = {};
        areaNames.forEach(areaName => {
            months[monthKey].areas[areaName] = [];
        });
    });

    return Promise.resolve();
}

// Calculate functions
export function calcLineCoord(P) {
    const lines = [];
    const angleStep = (2 * Math.PI) / P.length;

    for (let i = 0; i < P.length; i++) {
        const angle = angleStep * i - Math.PI / 2;
        const x1 = Cx;
        const y1 = Cy;
        const x2 = Cx + R * Math.cos(angle);
        const y2 = Cy + R * Math.sin(angle);

        lines.push({ x1, y1, x2, y2 });
    }

    return lines;
}

export function calcTextCoord(P) {
    const texts = [];
    const angleStep = (2 * Math.PI) / P.length;

    for (let i = 0; i < P.length; i++) {
        const angle = angleStep * i + angleStep / 2 - Math.PI / 2;
        // Position labels in the center of the gray outer ring
        const grayRingRadius = (monthCircleOutterRadius + driftCircleRadius) / 2; // (420 + 372.5) / 2 = 396.25
        const x1 = Cx + grayRingRadius * Math.cos(angle);
        const y1 = Cy + grayRingRadius * Math.sin(angle);
        const x2 = Cx + grayRingRadius * Math.cos(angle);
        const y2 = Cy + grayRingRadius * Math.sin(angle);

        texts.push({ month: P[i], x1, y1, x2, y2 });
    }

    return texts;
}

export function calcTimelineCoord(P) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate();

    // Find current month in P array
    const monthNames = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
    const monthIndex = P.indexOf(monthNames[currentMonth]);

    if (monthIndex === -1) return [Cx + uTCircleRadius, Cy, Cx + R, Cy];

    const angleStep = (2 * Math.PI) / P.length;
    const monthAngle = angleStep * monthIndex - Math.PI / 2;
    const dayProgress = currentDay / daysInMonth;
    const angle = monthAngle + angleStep * dayProgress;

    // Calculate coordinates from the light blue circle circumference (uT circle) to outer edge
    const innerX = Cx + uTCircleRadius * Math.cos(angle);
    const innerY = Cy + uTCircleRadius * Math.sin(angle);
    const outerX = Cx + R * Math.cos(angle);
    const outerY = Cy + R * Math.sin(angle);

    return [innerX, innerY, outerX, outerY];
}

export function calcBubbelDates(P, month, areaName, areaStyle) {
    const bubbles = [];

    if (!month.areas || !month.areas[areaName]) {
        return bubbles;
    }

    const events = month.areas[areaName];
    const monthIndex = P.indexOf(Object.keys(months).find(k => months[k] === month));

    if (monthIndex === -1) return bubbles;

    const angleStep = (2 * Math.PI) / P.length;
    const monthAngle = angleStep * monthIndex - Math.PI / 2;

    // Position bubbles at the CENTER of each ring (same as arcs) for perfect alignment  
    // Updated for 7.5px gaps with 40px thick rings
    const ringCenterRadiusMap = {
        "Drift": (driftCircleRadius + driftInnerRadius) / 2,        // (372.5 + 332.5) / 2 = 352.5
        "Økonomi": (økonomiCircleRadius + økonomiInnerRadius) / 2,  // (325 + 285) / 2 = 305
        "Produktion": (produktionCircleRadius + produktionInnerRadius) / 2, // (277.5 + 237.5) / 2 = 257.5
        "Mønstring": (mønstringCircleRadius + mønstringInnerRadius) / 2,    // (230 + 190) / 2 = 210
        "Ferie": (ferieCircleRadius + ferieInnerRadius) / 2,        // (182.5 + 142.5) / 2 = 162.5
        "U/T": uTCircleRadius                                       // 135
    };

    const radius = ringCenterRadiusMap[areaName] || 150;

    events.forEach((event, index) => {
        const day = event.date.getDate();
        const daysInMonth = new Date(event.date.getFullYear(), event.date.getMonth() + 1, 0).getDate();
        const dayProgress = day / daysInMonth;
        const angle = monthAngle + angleStep * dayProgress;

        const Bx = Cx + radius * Math.cos(angle);
        const By = Cy + radius * Math.sin(angle);

        bubbles.push({
            date: event,
            Bx,
            By,
            Ccolor: areaStyle.Ccolor
        });
    });

    return bubbles;
}
