// Force SVG to be responsive - Override SharePoint constraints
function forceSVGResize() {
  const wrapper = document.getElementById("wrapper");
  const svg = wrapper?.querySelector("svg");

  if (svg) {
    // Force remove all size constraints
    svg.style.setProperty("width", "100%", "important");
    svg.style.setProperty("height", "100%", "important");
    svg.style.setProperty("max-width", "none", "important");
    svg.style.setProperty("max-height", "none", "important");
    svg.style.setProperty("min-width", "none", "important");
    svg.style.setProperty("min-height", "none", "important");

    // Also force wrapper to be larger to match reference
    wrapper.style.setProperty("height", "1000px", "important");
    wrapper.style.setProperty("width", "100%", "important");
    wrapper.style.setProperty("max-height", "none", "important");
  }

  // Hide any SVG-generated activity buttons to avoid duplicates
  hideDuplicateSVGButtons();
}

// Hide SVG-generated buttons that conflict with our HTML buttons
function hideDuplicateSVGButtons() {
  const svg = document.querySelector("svg");
  if (svg) {
    // Find and hide SVG circles that look like activity buttons (radius 55)
    const svgCircles = svg.querySelectorAll('circle[r="55"]');
    svgCircles.forEach((circle) => {
      const parent = circle.parentNode;
      if (parent) {
        parent.style.display = "none";
      }
    });

    // Also hide any rectangular buttons that might be SVG-generated
    const svgRects = svg.querySelectorAll('rect[width="150"][height="40"]');
    svgRects.forEach((rect) => {
      const parent = rect.parentNode;
      if (parent) {
        parent.style.display = "none";
      }
    });
  }
}

// Activity button dropdown functionality
function initializeActivityButtons() {
  // Sample data - in real implementation this would come from the links object
  const dropdownData = {
    Aktiviteter: [
      { title: "Aktivitet 1", url: "#" },
      { title: "Aktivitet 2", url: "#" },
      { title: "Aktivitet 3", url: "#" },
    ],
    Info: [
      { title: "Info 1", url: "#" },
      { title: "Info 2", url: "#" },
    ],
    Blanketter: [
      { title: "Blanket 1", url: "#" },
      { title: "Blanket 2", url: "#" },
      { title: "Blanket 3", url: "#" },
    ],
    Loggen: [
      { title: "Log Entry 1", url: "#" },
      { title: "Log Entry 2", url: "#" },
    ],
    Bestemmelser: [
      { title: "Regel 1", url: "#" },
      { title: "Regel 2", url: "#" },
      { title: "Regel 3", url: "#" },
    ],
  };

  // Function to populate dropdown
  function populateDropdown(dropdownId, items) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = "";

    if (items && items.length > 0) {
      items.forEach((item) => {
        const dropdownItem = document.createElement("div");
        dropdownItem.className = "dropdown-item";
        dropdownItem.textContent = item.title;
        dropdownItem.addEventListener("click", function (e) {
          e.stopPropagation();
          console.log("Clicked:", item.title, item.url);
          // In real implementation, this would navigate to item.url
        });
        dropdown.appendChild(dropdownItem);
      });
    } else {
      const noItems = document.createElement("div");
      noItems.className = "dropdown-item";
      noItems.textContent = "No items available";
      dropdown.appendChild(noItems);
    }
  }

  // Function to position dropdown
  function positionDropdown(button, dropdown) {
    const buttonRect = button.getBoundingClientRect();
    const dropdownRect = dropdown.getBoundingClientRect();

    // Reset positioning
    dropdown.style.top = "";
    dropdown.style.bottom = "";
    dropdown.style.left = "";
    dropdown.style.right = "";

    if (button.classList.contains("top-left")) {
      dropdown.style.top = "130px";
      dropdown.style.left = "0px";
    } else if (button.classList.contains("top-right")) {
      dropdown.style.top = "130px";
      dropdown.style.right = "0px";
    } else if (button.classList.contains("bottom-left")) {
      dropdown.style.bottom = "130px";
      dropdown.style.left = "0px";
    } else if (button.classList.contains("bottom-right")) {
      dropdown.style.bottom = "130px";
      dropdown.style.right = "0px";
    }

    // Special positioning for Bestemmelser button
    if (button.id === "bestemmelser-btn") {
      dropdown.style.bottom = "50px";
      dropdown.style.left = "0px";
      dropdown.style.top = "";
      dropdown.style.right = "";
    }
  }

  // Add click handlers to activity buttons
  ["aktiviteter", "info", "blanketter", "loggen", "bestemmelser"].forEach(
    (activity) => {
      const button = document.getElementById(activity + "-btn");
      const dropdown = document.getElementById(activity + "-dropdown");
      const activityName = activity.charAt(0).toUpperCase() + activity.slice(1);

      if (button && dropdown) {
        // Populate dropdown with data
        populateDropdown(
          activity + "-dropdown",
          dropdownData[activityName] || []
        );

        button.addEventListener("click", function (e) {
          e.stopPropagation();

          // Hide all other dropdowns
          document.querySelectorAll(".activity-dropdown").forEach((dd) => {
            if (dd !== dropdown) {
              dd.classList.remove("show");
            }
          });

          // Toggle current dropdown
          const isVisible = dropdown.classList.contains("show");
          if (isVisible) {
            dropdown.classList.remove("show");
          } else {
            positionDropdown(button, dropdown);
            dropdown.classList.add("show");
          }
        });
      }
    }
  );

  // Close dropdowns when clicking outside
  document.addEventListener("click", function () {
    document.querySelectorAll(".activity-dropdown").forEach((dropdown) => {
      dropdown.classList.remove("show");
    });
  });
}

// Initialize everything
function initializeUI() {
  // Run immediately and also after DOM content loads
  forceSVGResize();

  // Force SVG resize after DOM is ready
  setTimeout(forceSVGResize, 100);
  setTimeout(forceSVGResize, 500);
  setTimeout(forceSVGResize, 1000);

  // Initialize activity buttons
  initializeActivityButtons();
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeUI);

// Also run immediately in case DOM is already loaded
if (document.readyState === "loading") {
  // Still loading, wait for DOMContentLoaded
} else {
  // Already loaded
  initializeUI();
}