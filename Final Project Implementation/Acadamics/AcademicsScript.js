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
        const totalHeight = (3*(courseCount * (COURSE_PANEL_HEIGHT + PANEL_MARGIN) + (CONTENT_PADDING - PANEL_MARGIN)))/5 + 100;
        
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
        }, 300);
        
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
            newCourse.style.opacity = '0';
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
            
            // Fade in effect
            setTimeout(() => {
                newCourse.style.opacity = '1';
                newCourse.style.transition = 'opacity 0.3s ease-in';
            }, 100);

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
