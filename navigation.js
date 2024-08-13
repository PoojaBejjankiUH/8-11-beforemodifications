let courses = [];
let isAdmin = false;
let programFromStorage={}; 
let electives = {};
let programAcademicMap = {};
let academicMap = {
    years: [
        { year: 1, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
        { year: 2, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
        { year: 3, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
        { year: 4, semesterFall: { courses: [] }, semesterSpring: { courses: [] } }
    ]
};

document.addEventListener("DOMContentLoaded", function() {
    // Load courses and electives from local storage or fetch from the JSON file
    const storedCourses = localStorage.getItem('courseList');
    const storedElectives = localStorage.getItem('electivesList');
    const storedAcademicMap = localStorage.getItem('academicMaps');
    setViewMode(isAdmin);
    if (storedCourses && storedElectives) {
        courses = JSON.parse(storedCourses);
        electives = JSON.parse(storedElectives);
        if (storedAcademicMap) {
            programAcademicMap = JSON.parse(storedAcademicMap);
        }
        updateCourseDropdown();
        displayAcademicMap();
    }/*  else {
        fetch('data_version3.json')
            .then(response => response.json())
            .then(jsonData => {
                courses = jsonData.courses || [];
                electives = jsonData.electives || {};
                updateLocalStorage(); // Store the data in local storage
                updateCourseDropdown();
                displayAcademicMap();
            })
            .catch(error => console.error('Error fetching courses:', error));
    } */
});

document.getElementById('course-type-select').addEventListener('change', function() {
    const courseType = this.value;
    if (courseType === 'core') {
        populateCoreCoursesDropdown();
        document.getElementById('course-select').style.display = 'block';
        document.getElementById('category-select').style.display = 'none';
    } else if (courseType === 'elective') {
        populateElectiveCategoriesDropdown();
        document.getElementById('category-select').style.display = 'block';
        document.getElementById('course-select').style.display = 'none';
    } else {
        document.getElementById('category-select').style.display = 'none';
        document.getElementById('course-select').style.display = 'none';
    }
});

document.getElementById('category-select').addEventListener('change', function() {
    const category = this.value;
    if (category) {
        populateElectiveCoursesDropdown(category);
        document.getElementById('course-select').style.display = 'block';
    } else {
        document.getElementById('course-select').style.display = 'none';
    }
});

function populateCoreCoursesDropdown() {
    const alreadyAddedCourses = programFromStorage.years.flatMap(year => [...year.semesterFall.courses, ...year.semesterSpring.courses]);
    const filteredcourses = courses.filter(course => !alreadyAddedCourses.includes(course.courseCode));

    const courseSelect = document.getElementById('course-select');
    courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';
    filteredcourses.forEach(course => {
        if (course.type === 'core') {
            const option = document.createElement('option');
            option.value = course.courseCode;
            option.textContent = `${course.courseCode} - ${course.courseName}`;
            courseSelect.appendChild(option);
        }
    });
}

function populateElectiveCategoriesDropdown() {
    const courseSelect = document.getElementById('course-select');
    courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';
    electives[category].forEach(course => {
        const option = document.createElement('option');
        option.value = course.courseCode;
        option.textContent = `${course.courseCode} - ${course.courseName}`;
        courseSelect.appendChild(option);
    });
}

function populateElectiveCoursesDropdown(category) {
    const alreadyAddedCourses = programFromStorage.years.flatMap(year => [...year.semesterFall.courses, ...year.semesterSpring.courses]);
    const filteredcourses = courses.filter(course => !alreadyAddedCourses.includes(course.courseCode));
    const categorySelect = document.getElementById('category-select');
    categorySelect.innerHTML = '<option value="" disabled selected>Select Elective Category</option>';
    filteredcourses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.courseCode;
            option.textContent = `${course.courseCode} - ${course.courseName}`;
            courseSelect.appendChild(option);
        });
}

function addCoursesToAcademicMap() {
    const year = document.getElementById('year-select').value;
    const semester = document.getElementById('semester-select').value;
    const courseType = document.getElementById('course-type-select').value;
    const category = document.getElementById('category-select').value;
    const programName = document.querySelector('.nav-link.active').innerText;
    programAcademicMap = JSON.parse(localStorage.getItem('academicMaps'));

    const program = programAcademicMap.programs.find(program => program.name === programName);

    if (program) {
        const yearData = program.years.find(program => program.year == +(year)+1);
        if (yearData) {
            const courseCode = document.getElementById('course-select').value;
            /* if (courseType === 'core' ) {
                if (coreCourse) {
                    coursesToAdd.push(coreCourse);
                }
            } else if (courseType === 'elective') {
                if (category && electives[category]) {
                    coursesToAdd = electives[category].map(course => course.courseCode);
                }
                console.log('Courses to Add from Elective Category:', coursesToAdd);
            }
 */         
            if (courseCode) {
                if (!yearData[semester].courses.includes(courseCode)) {
                    yearData[semester].courses.push(courseCode);
                }
                localStorage.setItem('academicMaps', JSON.stringify(programAcademicMap));
                displayAcademicMap();
                alert("Courses added successfully!");
                console.log('Updated Year Data:', yearData);
            } else {
                alert("No courses selected.");
            }
        } else {
            alert("Please select a valid year and semester.");
        }
    } else {
        alert("Program not found.");
    }
}
function updateLocalStorage() {
    localStorage.setItem('courseList', JSON.stringify(courses));
    localStorage.setItem('electivesList', JSON.stringify(electives));
    localStorage.setItem('academicMaps', JSON.stringify(programAcademicMap));
}
function updateCourseDropdown() {
    const courseSelect = document.getElementById('course-select');
    courseSelect.innerHTML = '<option value="" disabled selected>Select Course</option>';
    const programName = document.getElementsByClassName('nav-link active')[0]?.innerText;
    if (programName && programAcademicMap[`${programName}`]) {
        academicMap = programAcademicMap[`${programName}`];
    }
    // Get all added courses
    const addedCourses = new Set();
    for (let year in academicMap) {
        for (let semester in academicMap[year]) {
            academicMap[year][semester].forEach(courseCode => addedCourses.add(courseCode));
        }
    }
    // Populate dropdown excluding already added courses
    courses.forEach(course => {
        if (!addedCourses.has(course.courseCode)) {
            const option = document.createElement('option');
            option.value = course.courseCode;
            option.textContent = `${course.courseCode}: ${course.courseName}`;
            courseSelect.appendChild(option);
        }
    });
}
function displayAcademicMap() {
    setViewMode();
    programAcademicMap = JSON.parse(localStorage.getItem('academicMaps'));
    academicMap = {
        years: [
            { year: 1, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
            { year: 2, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
            { year: 3, semesterFall: { courses: [] }, semesterSpring: { courses: [] } },
            { year: 4, semesterFall: { courses: [] }, semesterSpring: { courses: [] } }
        ]
    };
    const yearsContainer = document.getElementById('years-container');
    yearsContainer.innerHTML = '';
    const programName = document.getElementsByClassName('nav-link active')[0]?.innerText;
    programFromStorage = programAcademicMap.programs.find(pro => pro.name === programName);
    if (programName && programFromStorage) {
        academicMap = programFromStorage;
    }
    for (let year in academicMap.years) {
        const yearDiv = document.createElement('div');
        yearDiv.classList.add('year-block', 'mb-5');
        yearDiv.innerHTML = `<h3>Year ${parseInt(year) + 1}</h3>`;
        const semesterContainer = document.createElement('div');
        semesterContainer.classList.add('row', 'semester-container');
        let fallCredits = 0;
        let springCredits = 0;
        for (let semester in programFromStorage.years[year]) {
            if (semester !== 'year') {
                const semesterCol = document.createElement('div');
                semesterCol.classList.add('col-md-6', 'semester-block');
                semesterCol.innerHTML = `<h4>${semester === 'semesterFall' ? 'Fall' : 'Spring'}</h4>`;
                const table = document.createElement('table');
                table.classList.add('table', 'table-striped', 'table-bordered');
                const thead = document.createElement('thead');
                thead.classList.add('thead-dark');
                let headerContent;
                if (semester === 'semesterFall') {
                    headerContent = `<tr>
                    <th>Year</th>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Actions</th>
                </tr>`;
                } else {
                    headerContent = `<tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Total Credits</th>
                    <th>Actions</th>
                </tr>`;
                }
                thead.innerHTML = headerContent;
                table.appendChild(thead);
                const tbody = document.createElement('tbody');
                let semesterCredits = 0;
                academicMap.years[year][semester].courses.forEach(courseCode => {
                    const course = [...courseList, ...Object.values(electivesList).flat()].find(c => c.courseCode === courseCode);
                    if (course) {
                        const row = document.createElement('tr');

                        if (semester === 'semesterFall') {
                            row.innerHTML = `
                            <td>${parseInt(year) + 1}</td>
                            <td><a href="#" class="course-link" data-course-code="${course.courseCode}">${course.courseCode}</a></td>
                            <td><a href="#" class="course-link" data-course-code="${course.courseCode}">${course.courseName}</a></td>
                            <td>${course.credits}</td>
                            <td><button class="btn btn-danger btn-sm admin-only" onclick="deleteCourseAcademicMap('${year}', '${semester}', '${course.courseCode}')">Delete</button></td>`;
                            fallCredits += course.credits;
                        } else {
                            row.innerHTML = `
                            <td><a href="#" class="course-link" data-course-code="${course.courseCode}">${course.courseCode}</a></td>
                            <td><a href="#" class="course-link" data-course-code="${course.courseCode}">${course.courseName}</a></td>
                            <td>${course.credits}</td>
                            <td></td> <!-- Placeholder for total credits row later -->
                            <td><button class="btn btn-danger btn-sm admin-only" onclick="deleteCourseAcademicMap('${year}', '${semester}', '${course.courseCode}')">Delete</button></td>`;
                            springCredits += course.credits;
                        }
                        semesterCredits += course.credits;
                        tbody.appendChild(row);
                    }
                });
                // Add total credits row for individual semester
                const totalRow = document.createElement('tr');
                if (semester === 'semesterFall') {
                    totalRow.innerHTML = `<td colspan="3"><strong>Fall Total Credits</strong></td>
                                      <td><strong>${fallCredits}</strong></td>
                                      <td></td>`;
                } else {
                    const totalYearCredits = fallCredits + springCredits;
                    totalRow.innerHTML = `<td colspan="2"><strong>Spring Total Credits</strong></td>
                                      <td><strong>${springCredits}</strong></td>
                                      <td><strong>${totalYearCredits}</strong></td>`;
                }
                tbody.appendChild(totalRow);
                table.appendChild(tbody);
                semesterCol.appendChild(table);
                semesterContainer.appendChild(semesterCol);
                updateLocalStorage();
            }
        }
        yearDiv.appendChild(semesterContainer);
        yearsContainer.appendChild(yearDiv);
    }
    // Add event listeners to course links
    document.querySelectorAll('.course-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const courseCode = event.target.getAttribute('data-course-code');
            displayCourseDetails(courseCode);
        });
    });
}

function displayCourseDetails(courseCode) {
    const course = courses.find(c => c.courseCode === courseCode);
    if (course) {
        document.getElementById('courseModalTitle').innerText = `${course.courseName} (${course.courseCode})`;
        document.getElementById('courseModalBody').innerHTML = `
            <p><strong>Credits:</strong> ${course.credits}</p>
            <p><strong>Type:</strong> ${course.type}</p>
            <p><strong>Lecture Contact Hours:</strong> ${course.details.lectureContactHours}</p>
            <p><strong>Lab Contact Hours:</strong> ${course.details.labContactHours}</p>
            <p><strong>Prerequisite:</strong> ${course.details.prerequisite}</p>
            <p><strong>Corequisite:</strong> ${course.details.corequisite}</p>
            <p><strong>Description:</strong> ${course.details.description}</p>
            <p><strong>Repeatability:</strong> ${course.details.repeatability ? "Yes" : "No"}</p>
            <p><strong>Note:</strong> ${course.details.note}</p>
            <p><strong>Core Category:</strong> ${course.details.coreCategory}</p>
            <p><strong>TCCNS Equivalent:</strong> ${course.details.tccnsEquivalent}</p>
            <p><strong>Additional Fee:</strong> ${course.details.additionalFee ? "Yes" : "No"}</p>
        `;
        var myModal = new bootstrap.Modal(document.getElementById('courseModal'), {});
        myModal.show();
    }
}

function deleteCourseAcademicMap(year, semester, courseCode) {
    const index = academicMap.years[year][semester].courses.indexOf(courseCode);
    if (index > -1) {
        academicMap.years[year][semester].courses.splice(index, 1);
        updateLocalStorage();
        displayAcademicMap();
        updateCourseDropdown(); // Update dropdown after deleting a course
    }
}

function routing(id) {
    if (id === 'home') {
        document.getElementById('homeContent').style.display = 'block';
        document.getElementById('addAcademicMapContent').style.display = 'none';
    }
    if (id === 'academicMap') {
        document.getElementById('homeContent').style.display = 'none';
        document.getElementById('addAcademicMapContent').style.display = 'block';
        displayAcademicMap();
    }
}


document.getElementById('viewToggle').addEventListener('change', function() {
    isAdmin = this.value === 'admin';
    setViewMode();
});

function setViewMode() {
    if (isAdmin) {
        // Show admin functionalities
        document.getElementById('homeContent').style.display = 'block'; // Show course tab
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
        document.querySelectorAll('.student-only').forEach(el => el.style.display = 'none');
    } else {
        // Hide course tab and admin functionalities for student view
        document.getElementById('homeContent').style.display = 'none'; // Hide course tab
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.student-only').forEach(el => el.style.display = 'block');
    }
}

window.displayAcademicMap = displayAcademicMap;
