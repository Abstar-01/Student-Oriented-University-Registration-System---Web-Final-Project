document.addEventListener('DOMContentLoaded', () => {
    const courseInfoPanel = document.querySelector('.CourseInformationPanel');
    const courseSearchContent = document.querySelector('.CourseSearchContent');
    const coursePanelTemp = document.querySelector('.CoursePanelTemp');
    const searchInput = document.querySelector('#SeachBarInput');
    const searchImg = document.querySelector('.SearchDesign img');

    // MARK THE TEMPLATE FOR CSS TARGETING
    coursePanelTemp.setAttribute('data-is-template', 'true');

    // Set initial states
    courseSearchContent.style.display = 'none';
    
    // Variables for dynamic height
    let currentCourseCount = 0;
    const COURSE_PANEL_HEIGHT = 200; // Height of each course panel in px
    const PANEL_MARGIN = 20; // Margin between panels in px
    const CONTENT_PADDING = 40; // Top + bottom padding of CourseSearchContent

    // Function to calculate and set dynamic height
    const setDynamicHeight = (courseCount) => {
        if (courseCount === 0) {
            courseSearchContent.style.height = '0px';
            return;
        }
        
        // Calculate total height needed
        const totalHeight = (3*(courseCount * (COURSE_PANEL_HEIGHT + PANEL_MARGIN) + (CONTENT_PADDING - PANEL_MARGIN)))/5 + 50;
        
        // Set the height in pixels
        courseSearchContent.style.height = totalHeight + 'px';
        
        console.log(`📏 Set dynamic height: ${totalHeight}px for ${courseCount} courses`);
        
        // Scroll to show the new content
        setTimeout(() => {
            courseSearchContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 1000);
    };

    // Function to expand CourseSearchContent
    const expandPanels = (courseCount = 0) => {
        courseSearchContent.classList.add('active');
        courseSearchContent.style.display = 'flex';
        
        // ADDED: Set padding to 20px when expanding
        courseSearchContent.style.padding = '20px';
        
        // Set initial minimal height
        courseSearchContent.style.height = '0px';
        
        console.log('📈 Panels expanded');
    };

    // Function to collapse CourseSearchContent
    const collapsePanels = () => {
        courseSearchContent.classList.remove('active');
        courseSearchContent.style.height = '0px';
        
        // ADDED: Set padding to 0px when collapsing
        courseSearchContent.style.padding = '0px';
        
        setTimeout(() => {
            courseSearchContent.style.display = 'none';
            // Clear search results
            const existingCourses = document.querySelectorAll('.course-panel');
            existingCourses.forEach(course => course.remove());
            currentCourseCount = 0;
        }, 500);
        
        console.log('📉 Panels collapsed');
    };

    // SEARCH FUNCTIONALITY
    const performSearch = () => {
        const searchValue = searchInput.value.trim();
        console.log('🔍 Searching for:', searchValue);
        
        if (searchValue === '') {
            console.log('ℹ️ Empty search');
            return;
        }
        
        // Clear existing courses
        const existingCourses = document.querySelectorAll('.course-panel');
        existingCourses.forEach(course => course.remove());
        currentCourseCount = 0;

        // Expand panels if not already expanded
        if (courseSearchContent.style.display === 'none') {
            expandPanels();
        }

        // Fetch data from server
        fetch('SearchForCourse.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'searchValue=' + encodeURIComponent(searchValue)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('📊 Data received:', data);
            if (data.success) {
                console.log('✅ Success! Found', data.count, 'courses');
                createCourseTabs(data.data);
            } else {
                console.error('❌ Server error:', data.error);
                alert('Error searching courses: ' + data.error);
            }
        })
        .catch(error => {
            console.error('❌ Fetch error:', error);
            alert('Error connecting to server. Check console for details.');
        });
    };

    // Function to create course tabs with delay
    function createCourseTabs(courses) {
        console.log('🎨 Creating tabs for', courses.length, 'courses');
        
        if (courses.length === 0) {
            console.log('ℹ️ No courses found');
            alert('No courses found matching your search.');
            // Set minimal height when no results
            setDynamicHeight(0);
            return;
        }

        // Update height immediately based on expected course count
        setDynamicHeight(courses.length);
        currentCourseCount = courses.length;

        // Create courses with delay
        courses.forEach((course, index) => {
            setTimeout(() => {
                console.log(`⏰ Creating course ${index + 1}/${courses.length}`);
                createCourseTab(course, index);
            }, index * 500);
        });
    }

    // Function to create individual course tab
    function createCourseTab(course, index) {
        try {
            // Clone the template
            const newCourse = coursePanelTemp.cloneNode(true);
            newCourse.classList.add('course-panel');
            newCourse.removeAttribute('data-is-template'); // Remove template marker
            newCourse.style.opacity = '0'; // Start with opacity 0
            newCourse.style.transition = 'opacity 1s ease-in-out'; // Add 1s transition
            newCourse.id = 'course-' + (course.CourseCode || index);
            
            // Populate with course data
            const courseTitle = newCourse.querySelector('.CourseTitle');
            const creditHours = newCourse.querySelector('.CouseCreditHour');
            const courseType = newCourse.querySelector('.CourseType');
            const courseDescription = newCourse.querySelector('.CourseDescription');

            if (courseTitle) {
                courseTitle.value = course.CoursName || 'Unknown Course';
            }
            
            if (creditHours) {
                creditHours.value = 'Credit Hours: ' + (course.CreditHours || 'N/A');
            }
            
            if (courseType) {
                courseType.value = 'Type: ' + (course.CourseType || 'N/A');
            }
            
            if (courseDescription) {
                courseDescription.textContent = course.CourseDescription || 'No description available';
            }

            // Add to DOM
            courseSearchContent.appendChild(newCourse);
            
            // Trigger fade in effect
            setTimeout(() => {
                newCourse.style.opacity = '1';
            }, 10); // Small timeout to ensure the transition works

            console.log('✅ Course tab created successfully!');

        } catch (error) {
            console.error('❌ Error creating course tab:', error);
        }
    }

    // EVENT LISTENERS

    // Event listener for Enter key
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const searchValue = searchInput.value.trim();
            
            if (searchValue !== '') {
                // Only expand if not already expanded
                if (courseSearchContent.style.display === 'none') {
                    expandPanels();
                }
                // Perform the search
                performSearch();
            }
        }
    });

    // Event listener for search image click
    searchImg.addEventListener('click', () => {
        const searchValue = searchInput.value.trim();
        
        if (searchValue !== '') {
            // If there's search text, perform search and ensure panels are expanded
            if (courseSearchContent.style.display === 'none') {
                expandPanels();
                // Small delay to allow expansion before showing results
                setTimeout(performSearch, 100);
            } else {
                performSearch();
            }
        } else {
            // If no search text, just toggle panels
            if (courseSearchContent.style.display === 'none') {
                expandPanels();
            } else {
                collapsePanels();
            }
        }
    });

    // Clear results when search is cleared
    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.trim();
        if (searchValue === '') {
            const existingCourses = document.querySelectorAll('.course-panel');
            existingCourses.forEach(course => course.remove());
            currentCourseCount = 0;
            setDynamicHeight(0);
            collapsePanels();
        }
    });

    console.log('🚀 Pixel-based search functionality ready!');
});



//////////////////////////////////////////////////////////////////////
///   Profile Display Student Personal
const coursePanel = document.querySelector(".CourseInformationPanel");
const studentPanel = document.querySelector(".StudentsPersonalInformation");
const profileImage = document.querySelector(".ProfileButton img");
const BackImage = document.querySelector("#BackImage");

// Initial State: Show CourseInformationPanel, hide StudentsPersonalInformation
coursePanel.style.transition = "opacity 1s ease-in-out";
coursePanel.style.opacity = "1";
coursePanel.style.display = "block";

studentPanel.style.opacity = "0";
studentPanel.style.display = "none";

// When profile image is clicked -> switch to Student info
profileImage.addEventListener("click", () => {
  coursePanel.style.opacity = "0";

  setTimeout(() => {
    coursePanel.style.display = "none";
    studentPanel.style.display = "grid";
    studentPanel.style.opacity = "0";
    studentPanel.style.transition = "opacity 1s ease-in-out";

    setTimeout(() => {
      studentPanel.style.opacity = "1";
    }, 100);
  }, 1000);
});

// When back button is clicked -> switch back to Course info
BackImage.addEventListener("click", () => {
  studentPanel.style.opacity = "0";

  setTimeout(() => {
    studentPanel.style.display = "none";
    coursePanel.style.display = "block";
    coursePanel.style.opacity = "0";
    coursePanel.style.transition = "opacity 1s ease-in-out";

    setTimeout(() => {
      coursePanel.style.opacity = "1";
    }, 100);
  }, 1000);
});



//////////////////////////////////////////////////////////////////
//       Displaying Students Information
document.addEventListener("DOMContentLoaded", () => {
    fetch("GettingStudentInformation.php")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const student = data.data;

                document.querySelector("fieldset:nth-of-type(2) input").value = student.FullName;
                document.querySelector("fieldset:nth-of-type(3) input").value = student.StudentID; // Student ID
                document.querySelector("fieldset:nth-of-type(4) input").value = student.GPA; // CGPA
                document.querySelector("fieldset:nth-of-type(5) input").value = student.Batch;
                document.querySelector("fieldset:nth-of-type(6) input").value = student.PhoneNumber;
                document.querySelector("fieldset:nth-of-type(7) input").value = student.Program;
                document.querySelector("fieldset:nth-of-type(8) input").value = student.AcademicYear;
            } else {
                alert(data.message);
            }
        })
        .catch(err => console.error("Error fetching student info:", err));
});


  //////////////////////////////////////////////////////
 //////    Student Course History Information    //////
//////////////////////////////////////////////////////

// Global variables
let coursesData = null;
let years = [];
let studentId = '';

// Function to get alphabetic grade based on points divided by credit hours
function getAlphabeticGrade(points, creditHours) {
    if (creditHours === 0) return 'F';
    
    const gradeValue = points / creditHours;
    
    if (gradeValue >= 4) return 'A+';
    if (gradeValue >= 4) return 'A';
    if (gradeValue >= 3.5) return 'B+';
    if (gradeValue >= 3.0) return 'B';
    if (gradeValue >= 2.5) return 'C+';
    if (gradeValue >= 2.0) return 'C';
    if (gradeValue >= 1.0) return 'D';
    return 'F';
}

// Process course data to add alphabetic grade
function processCourseData(courses) {
    return courses.map(course => {
        const alphabeticGrade = getAlphabeticGrade(course.points, course.creditHours);
        
        return {
            ...course,
            alphabeticGrade: alphabeticGrade
        };
    });
}

// Calculate GPA for a term
function calculateTermGPA(courses) {
    let totalPoints = 0;
    let totalCredits = 0;
    
    courses.forEach(course => {
        totalPoints += course.points; // Sum of points from Grade column
        totalCredits += course.creditHours;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
}

// Initialize the grade display
async function initGradeDisplay() {
    await loadData();
    createYearDropdown();
    displayGrades();
    setupEventListeners();
}

// Load data from PHP
async function loadData() {
    try {
        const response = await fetch('CourseHistory.php');
        const data = await response.json();
        
        if (data.success) {
            coursesData = data.coursesByYearSeason;
            years = data.years;
            studentId = data.studentId;
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showError('Failed to load data: ' + error.message);
    }
}

// Create year dropdown
function createYearDropdown() {
    const courseTakenContent = document.querySelector('.CourseTakenContent');
    
    // Create filter section
    const filterSection = document.createElement('div');
    filterSection.style.cssText = `
        margin-bottom: 10px;
        padding: 20px;
        background-color: white;
        border-radius: 5px;
        border: none;
        text-align: center;
    `;
    
    filterSection.innerHTML = `
        <label style="font-family: Arial, Helvetica, sans-serif; font-size: 18px; color: #555; margin-right: 15px;">
            Select Year: 
        </label>
        <select id="yearSelect" style="
            padding: 10px 25px;
            border: 1px solid #555;
            border-radius: 8px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            color: #555;
            margin-right: 15px;
        ">
            <option value="all">All Years</option>
            ${years.map(year => `<option value="${year}">${year}</option>`).join('')}
        </select>
        <button onclick="showAllYears()" style="
            padding: 10px 30px;
            background-color: #989898;
            color: white;
            border: none;
            border-radius: 8px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            cursor: pointer;
        ">Show All</button>
    `;
    
    // Insert filter at the beginning
    courseTakenContent.insertBefore(filterSection, courseTakenContent.firstChild);
}

// Display grades in the HTML structure
function displayGrades(filteredData = coursesData) {
    const courseTakenContent = document.querySelector('.CourseTakenContent');
    
    // Clear existing fieldset elements (keep the filter section)
    const fieldsets = courseTakenContent.querySelectorAll('fieldset.YearTemplate');
    fieldsets.forEach(fieldset => {
        if (!fieldset.previousElementSibling || !fieldset.previousElementSibling.classList.contains('filter-section')) {
            fieldset.remove();
        }
    });

    // Remove any existing fieldsets except filter
    const allFieldsets = courseTakenContent.querySelectorAll('fieldset');
    allFieldsets.forEach(fieldset => {
        if (!fieldset.innerHTML.includes('yearSelect')) {
            fieldset.remove();
        }
    });

    if (!filteredData || Object.keys(filteredData).length === 0) {
        const noDataMsg = document.createElement('div');
        noDataMsg.style.cssText = `
            text-align: center;
            padding: 40px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 18px;
            color: #555;
        `;
        noDataMsg.textContent = 'No courses found for the selected year.';
        courseTakenContent.appendChild(noDataMsg);
        return;
    }

    // Sort years in descending order
    const sortedYears = Object.keys(filteredData).sort((a, b) => b - a);
    
    let groupCount = 0;

    sortedYears.forEach(year => {
        const seasons = filteredData[year];
        const seasonOrder = ['SPRING', 'WINTER','AUTUMN'];
        
        seasonOrder.forEach(season => {
            if (seasons[season]) {
                const isMajorGroup = groupCount === 0;
                groupCount++;
                
                // Process the course data for this season
                const processedCourses = processCourseData(seasons[season]);
                const fieldset = createYearFieldset(year, season, processedCourses, isMajorGroup);
                courseTakenContent.appendChild(fieldset);
            }
        });
    });
}

// Create a year fieldset with season data
function createYearFieldset(year, season, courses, isMajorGroup) {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'YearTemplate';
    
    // Apply major group styling
    if (isMajorGroup) {
        fieldset.style.border = '2px solid #555';
        fieldset.style.backgroundColor = 'white';
    }
    
    const legend = document.createElement('legend');
    legend.textContent = year;
    fieldset.appendChild(legend);
    
    const container = document.createElement('div');
    
    const seasonTitle = document.createElement('h1');
    seasonTitle.textContent = season;
    container.appendChild(seasonTitle);
    
    const table = document.createElement('table');
    
    // Create table header
    const headerRow = document.createElement('tr');
    headerRow.className = 'CourseHistoryheader';
    headerRow.innerHTML = `
        <td class="CC">Course Code</td>
        <td class="CT">Course Title</td>
        <td class="CH">Credit Hour</td>
        <td class="GradeValue">Grade</td>
        <td class="PointsValue">Points</td>
    `;
    table.appendChild(headerRow);
    
    // Add course rows
    let totalPoints = 0;
    let totalCredits = 0;
    
    courses.forEach(course => {
        const row = document.createElement('tr');
        row.className = 'CourseCont';
        row.innerHTML = `
            <td class="CC">${course.courseCode}</td>
            <td class="CT">${course.courseName}</td>
            <td class="CH">${course.creditHours}</td>
            <td class="GradeValue">${course.alphabeticGrade}</td>
            <td class="PointsValue">${course.points}</td>
        `;
        table.appendChild(row);
        
        // Calculate for GPA
        totalPoints += course.points; // Sum of points from Grade column
        totalCredits += course.creditHours;
    });
    
    // Add GPA row
    const gpaRow = document.createElement('tr');
    gpaRow.className = 'GPA_Calculation';
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
    gpaRow.innerHTML = `
        <td class="Comulatative_GPA" colspan="4">GPA</td>
        <td class="Value_GPA">${gpa}</td>
    `;
    table.appendChild(gpaRow);
    
    container.appendChild(table);
    fieldset.appendChild(container);
    
    return fieldset;
}

// Filter by selected year
function filterByYear() {
    const yearSelect = document.getElementById('yearSelect');
    const selectedYear = yearSelect.value;
    
    if (selectedYear === 'all') {
        displayGrades(coursesData);
        return;
    }
    
    const filteredData = {};
    if (coursesData[selectedYear]) {
        filteredData[selectedYear] = coursesData[selectedYear];
    }
    
    displayGrades(filteredData);
}

// Show all years
function showAllYears() {
    document.getElementById('yearSelect').value = 'all';
    displayGrades(coursesData);
}

// Set up event listeners
function setupEventListeners() {
    // Year select change event - auto filter when year changes
    const yearSelect = document.getElementById('yearSelect');
    if (yearSelect) {
        yearSelect.addEventListener('change', function() {
            if (this.value === 'all') {
                showAllYears();
            } else {
                filterByYear();
            }
        });
    }
}

// Show error message
function showError(message) {
    const courseTakenContent = document.querySelector('.CourseTakenContent');
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        color: #721c24;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 15px;
        padding: 20px;
        margin: 20px 0;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 16px;
        text-align: center;
    `;
    errorDiv.textContent = message;
    courseTakenContent.appendChild(errorDiv);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initGradeDisplay);