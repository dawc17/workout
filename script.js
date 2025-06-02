// JavaScript code will go here 

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const appSection = document.getElementById('app-section');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const userDisplay = document.getElementById('user-display');
    const usernameInput = document.getElementById('username');

    // Check if user is already logged in
    const loggedInUser = localStorage.getItem('username');
    if (loggedInUser) {
        showAppSection(loggedInUser);
    } else {
        showLoginSection();
    }

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('username', username);
            showAppSection(username);
            usernameInput.value = ''; // Clear the input
        }
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('username');
        showLoginSection();
    });

    function showLoginSection() {
        loginSection.style.display = 'block';
        appSection.style.display = 'none';
        if(userDisplay) userDisplay.textContent = '';
    }

    function showAppSection(username) {
        loginSection.style.display = 'none';
        appSection.style.display = 'block';
        if(userDisplay) userDisplay.textContent = username;
    }

    // Placeholder for workout data structure and functions
    let workouts = JSON.parse(localStorage.getItem('workouts')) || [];

    // Workout Creation Elements
    const createWorkoutForm = document.getElementById('create-workout-form');
    const workoutNameInput = document.getElementById('workout-name');
    const exercisesContainer = document.getElementById('exercises-container');
    const addExerciseButton = document.getElementById('add-exercise-button');

    // --- Workout Creation ---    
    if (addExerciseButton) {
        addExerciseButton.addEventListener('click', () => {
            addExerciseInput();
        });
    }

    if (createWorkoutForm) {
        createWorkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const workoutName = workoutNameInput.value.trim();
            const exerciseInputs = exercisesContainer.querySelectorAll('input[type="text"]');
            const exercises = [];
            exerciseInputs.forEach(input => {
                const exerciseName = input.value.trim();
                if (exerciseName) {
                    exercises.push({ name: exerciseName, sets: [] }); // Initialize sets for later logging
                }
            });

            if (workoutName && exercises.length > 0) {
                const newWorkout = {
                    id: Date.now().toString(), // Simple unique ID
                    name: workoutName,
                    exercises: exercises,
                    date: new Date().toISOString() // Store creation/last updated date
                };
                workouts.push(newWorkout);
                saveWorkouts();
                alert('Workout saved!');
                // Clear form
                workoutNameInput.value = '';
                exercisesContainer.innerHTML = ''; 
                addExerciseInput(); // Add one empty exercise input back
                // Optionally, refresh workout list display here
            } else {
                alert('Please provide a workout name and at least one exercise.');
            }
        });
    }

    function addExerciseInput(value = '') {
        if (!exercisesContainer) return;
        const exerciseInputGroup = document.createElement('div');
        exerciseInputGroup.classList.add('exercise-input-group');

        const exerciseInput = document.createElement('input');
        exerciseInput.type = 'text';
        exerciseInput.placeholder = 'Exercise Name';
        exerciseInput.value = value;
        exerciseInput.required = true;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-exercise-btn');
        removeButton.onclick = function() {
            exerciseInputGroup.remove();
        };

        exerciseInputGroup.appendChild(exerciseInput);
        exerciseInputGroup.appendChild(removeButton);
        exercisesContainer.appendChild(exerciseInputGroup);
    }
    
    // Utility function to save workouts to localStorage
    function saveWorkouts() {
        localStorage.setItem('workouts', JSON.stringify(workouts));
        renderWorkoutsList(); // Re-render the list every time workouts are saved
    }

    // --- Workout History Display ---
    const workoutsListContainer = document.getElementById('workouts-list-container');
    const exerciseLoggingSection = document.getElementById('exercise-logging-section');
    const currentWorkoutNameDisplay = document.getElementById('current-workout-name');
    const currentWorkoutExercisesContainer = document.getElementById('current-workout-exercises-container');
    const finishWorkoutButton = document.getElementById('finish-workout-button');
    let activeWorkoutId = null; // To store the ID of the workout being logged

    function renderWorkoutsList() {
        if (!workoutsListContainer) return;
        workoutsListContainer.innerHTML = ''; // Clear existing list

        if (workouts.length === 0) {
            workoutsListContainer.innerHTML = '<p>No workouts created yet. Create one above!</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('workouts-list');

        workouts.forEach(workout => {
            const li = document.createElement('li');
            li.classList.add('workout-item', 'card'); // Added card class
            li.innerHTML = `
                <h4>${workout.name}</h4>
                <p>Exercises: ${workout.exercises.map(ex => ex.name).join(', ')}</p>
                <p><em>Last performed: ${workout.lastPerformed ? new Date(workout.lastPerformed).toLocaleDateString() : 'Never'}</em></p>
                <button class="start-workout-btn" data-id="${workout.id}">Start Workout</button>
                <button class="view-history-btn" data-id="${workout.id}">View Log</button> <!-- Placeholder -->
                <button class="delete-workout-btn" data-id="${workout.id}">Delete Workout</button>
            `;
            ul.appendChild(li);
        });
        workoutsListContainer.appendChild(ul);

        // Add event listeners for new buttons
        document.querySelectorAll('.start-workout-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                activeWorkoutId = e.target.dataset.id;
                showExerciseLoggingSection(activeWorkoutId);
            });
        });

        document.querySelectorAll('.delete-workout-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm('Are you sure you want to delete this workout?')) {
                    deleteWorkout(e.target.dataset.id);
                }
            });
        });

        // Event listener for View Log buttons
        document.querySelectorAll('.view-history-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                viewWorkoutLog(e.target.dataset.id);
            });
        });
    }

    function viewWorkoutLog(workoutId) {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout || !workout.history || workout.history.length === 0) {
            alert('No logged history for this workout yet.');
            return;
        }

        let logDetails = `Workout Log for: ${workout.name}\n\n`;
        workout.history.sort((a,b) => new Date(b.date) - new Date(a.date)); // Show most recent first

        workout.history.forEach((performance, index) => {
            logDetails += `Session ${index + 1} (${new Date(performance.date).toLocaleString()}):\n`;
            performance.exercises.forEach(exercise => {
                logDetails += `  - ${exercise.name}:\n`;
                exercise.sets.forEach(set => {
                    logDetails += `    Set: ${set.reps} reps @ ${set.weight} kg\n`;
                });
            });
            logDetails += '\n';
        });

        alert(logDetails);
    }

    function deleteWorkout(workoutId) {
        workouts = workouts.filter(w => w.id !== workoutId);
        saveWorkouts(); // This will also re-render the list
        // If the deleted workout was being logged, hide the logging section
        if (activeWorkoutId === workoutId) {
            hideExerciseLoggingSection();
        }
    }

    // --- Initialize ---
    // Add one exercise input by default when page loads and user is logged in
    if (loggedInUser && exercisesContainer) {
      if (exercisesContainer.children.length === 0) { // Add only if empty
        addExerciseInput();
      }
    }
    renderWorkoutsList(); // Initial render of the workout list

    // --- Exercise Logging ---
    function showExerciseLoggingSection(workoutId) {
        const workout = workouts.find(w => w.id === workoutId);
        if (!workout) return;

        activeWorkoutId = workoutId; // Set the active workout
        if(currentWorkoutNameDisplay) currentWorkoutNameDisplay.textContent = workout.name;
        if(currentWorkoutExercisesContainer) currentWorkoutExercisesContainer.innerHTML = ''; // Clear previous

        workout.exercises.forEach((exercise, exerciseIndex) => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.classList.add('exercise-log-item', 'card');
            exerciseDiv.innerHTML = `<h5>${exercise.name}</h5>`;

            const setsContainer = document.createElement('div');
            setsContainer.classList.add('sets-container');
            exerciseDiv.appendChild(setsContainer);

            // Display existing sets if any (e.g., if resuming a workout - though this part is not fully built out)
            // For now, we assume starting fresh or logging a new session for the workout template
            (exercise.currentLog || []).forEach((set, setIndex) => {
                renderSetInput(setsContainer, exerciseIndex, setIndex, set.reps, set.weight);
            });


            const addSetButton = document.createElement('button');
            addSetButton.textContent = 'Add Set';
            addSetButton.type = 'button';
            addSetButton.onclick = () => {
                 // Find current number of sets for this specific exercise to give a correct setIndex
                const currentSetCount = setsContainer.querySelectorAll('.set-input-group').length;
                renderSetInput(setsContainer, exerciseIndex, currentSetCount); // Pass exerciseIndex
            };
            exerciseDiv.appendChild(addSetButton);
            if(currentWorkoutExercisesContainer) currentWorkoutExercisesContainer.appendChild(exerciseDiv);
        });
        
        // Add one set input for each exercise by default
        if(currentWorkoutExercisesContainer && workout.exercises.length > 0){
            workout.exercises.forEach((exercise, exerciseIndex) => {
                const exerciseDiv = currentWorkoutExercisesContainer.children[exerciseIndex];
                const setsContainer = exerciseDiv.querySelector('.sets-container');
                if(setsContainer.children.length === 0) { // Add initial set only if none exist
                   renderSetInput(setsContainer, exerciseIndex, 0);
                }
            });
        }

        if(exerciseLoggingSection) exerciseLoggingSection.style.display = 'block';
        // Hide other main sections like creation and history list if needed
        const workoutCreationSection = document.getElementById('workout-creation-section');
        const workoutHistorySection = document.getElementById('workout-history-section');
        if(workoutCreationSection) workoutCreationSection.style.display = 'none';
        if(workoutHistorySection) workoutHistorySection.style.display = 'none';
    }

    function renderSetInput(setsContainer, exerciseIndex, setIndex, repsValue = '', weightValue = '') {
        const setGroup = document.createElement('div');
        setGroup.classList.add('set-input-group');
        setGroup.innerHTML = `
            <label>Set ${setIndex + 1}:</label>
            <input type="number" class="reps-input" placeholder="Reps" value="${repsValue}" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}">
            <input type="number" class="weight-input" placeholder="Weight (kg)" value="${weightValue}" data-exercise-index="${exerciseIndex}" data-set-index="${setIndex}">
            <button type="button" class="remove-set-btn">Remove Set</button>
        `;
        setsContainer.appendChild(setGroup);

        setGroup.querySelector('.remove-set-btn').onclick = () => {
            setGroup.remove();
            // Optional: re-number sets if desired, or handle data update
        };
    }

    function hideExerciseLoggingSection() {
        if(exerciseLoggingSection) exerciseLoggingSection.style.display = 'none';
        activeWorkoutId = null;
        if(currentWorkoutNameDisplay) currentWorkoutNameDisplay.textContent = '';
        if(currentWorkoutExercisesContainer) currentWorkoutExercisesContainer.innerHTML = '';
        // Show other main sections again
        const workoutCreationSection = document.getElementById('workout-creation-section');
        const workoutHistorySection = document.getElementById('workout-history-section');
        if(workoutCreationSection) workoutCreationSection.style.display = 'block';
        if(workoutHistorySection) workoutHistorySection.style.display = 'block';
    }
    
    if(finishWorkoutButton) {
        finishWorkoutButton.addEventListener('click', () => {
            if (!activeWorkoutId) return;

            const workoutIndex = workouts.findIndex(w => w.id === activeWorkoutId);
            if (workoutIndex === -1) return;

            const loggedExercises = [];
            const exerciseElements = currentWorkoutExercisesContainer.querySelectorAll('.exercise-log-item');
            
            exerciseElements.forEach((exerciseElement, exerciseIdx) => {
                const exerciseName = exerciseElement.querySelector('h5').textContent;
                const sets = [];
                const setInputGroups = exerciseElement.querySelectorAll('.set-input-group');
                setInputGroups.forEach(setGroup => {
                    const reps = setGroup.querySelector('.reps-input').value;
                    const weight = setGroup.querySelector('.weight-input').value;
                    if (reps) { // Only save if reps are entered
                        sets.push({ reps: parseInt(reps), weight: parseFloat(weight) || 0 });
                    }
                });
                if (sets.length > 0) {
                     // Get original exercise definition to keep its name, ID etc.
                    const originalExercise = workouts[workoutIndex].exercises[exerciseIdx]; 
                    loggedExercises.push({ 
                        name: originalExercise.name, // or exerciseName
                        sets: sets 
                    });
                }
            });

            // Create a new history entry for this performance
            const workoutPerformance = {
                date: new Date().toISOString(),
                exercises: loggedExercises
            };

            // Add to workout's log history
            if (!workouts[workoutIndex].history) {
                workouts[workoutIndex].history = [];
            }
            workouts[workoutIndex].history.push(workoutPerformance);
            workouts[workoutIndex].lastPerformed = new Date().toISOString(); // Update last performed date

            saveWorkouts();
            alert('Workout session logged!');
            hideExerciseLoggingSection();
            renderWorkoutsList(); // Refresh list to show updated last performed date
        });
    }

    // Modify the renderWorkoutsList to include a View Log button action (placeholder for now)
    // ... (this will be updated later if we implement detailed log viewing)
}); 