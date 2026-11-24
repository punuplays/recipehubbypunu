"use strict";

/* =========================================
   RECIPEHUB BY PUNIKET
   MAIN APPLICATION
========================================= */

const APP_CONFIG = {
    name: "RecipeHub",
    owner: "Puniket",
    version: "2.1.0"
};

const recipes = window.recipes || [];

/* =========================================
   RECIPE DATABASE
========================================= */



/* =========================================
   FAVOURITE RECIPES SYSTEM
========================================= */

let favouriteRecipeIds = [];

try {
    favouriteRecipeIds = JSON.parse(
        localStorage.getItem("recipehub-favourites") || "[]"
    );

    if (!Array.isArray(favouriteRecipeIds)) {
        favouriteRecipeIds = [];
    }

} catch (error) {
    favouriteRecipeIds = [];
}


function saveFavourites() {

    localStorage.setItem(
        "recipehub-favourites",
        JSON.stringify(favouriteRecipeIds)
    );

}


function renderFavouriteRecipes() {

    const container =
        document.getElementById("favourite-recipes");

    const countElement =
        document.getElementById("favourite-count");

    if (!container) return;

    const favouriteRecipes = recipes.filter(recipe =>
        favouriteRecipeIds.includes(recipe.id)
    );

    if (countElement) {
        countElement.textContent =
            `${favouriteRecipes.length} Favourite Recipes`;
    }

    container.innerHTML = favouriteRecipes
        .map(createRecipeCard)
        .join("");

    enableRecipeNavigation();

}


function toggleFavourite(recipeId) {

    if (favouriteRecipeIds.includes(recipeId)) {

        favouriteRecipeIds =
            favouriteRecipeIds.filter(id => id !== recipeId);

    } else {

        favouriteRecipeIds.push(recipeId);

    }

    saveFavourites();
    renderFavouriteRecipes();

    document.querySelectorAll(".favourite-btn").forEach(button => {

        const id = Number(button.dataset.favouriteId);

        button.textContent =
            favouriteRecipeIds.includes(id) ? "❤️" : "🤍";

    });

}

/* =========================================
   RECIPE CARD TEMPLATE
========================================= */

function createRecipeCard(recipe) {

    return `
        <article class="recipe-card"
            data-recipe-id="${recipe.id}"
            tabindex="0"
            role="link"
            aria-label="View ${recipe.name}">
<button
    class="favourite-btn"
    type="button"
    data-favourite-id="${recipe.id}"
    aria-label="Toggle favourite"
>
    ${favouriteRecipeIds.includes(recipe.id) ? "❤️" : "🤍"}
</button>
            <img
                src="${recipe.image}"
                alt="${recipe.name}"
                loading="lazy"
            >

            <div class="recipe-card-content">

                <span class="recipe-category">
                    ${recipe.category}
                </span>

                <h3>${recipe.name}</h3>

                <p>${recipe.description}</p>

                <div class="recipe-info">
                    <span>⏱ ${recipe.prepTime}</span>
                    <span>🔥 ${recipe.difficulty}</span>
                </div>

                <p class="recipe-card-link">
                    View Full Recipe →
                </p>

            </div>
        </article>
    `;
}


/* =========================================
   DISPLAY RECIPE CARDS
========================================= */

function displayRecipes(recipeList = recipes) {

    const container = document.getElementById("featured-recipes");
    const countElement = document.getElementById("recipe-count");

    if (countElement) {
        countElement.textContent =
            `${recipeList.length} Recipes Available`;
    }

    if (!container) return;

    if (recipeList.length === 0) {

        container.innerHTML = `
            <p class="search-empty">
                No recipes found. More recipes will be added soon.
            </p>
        `;

        return;
    }

    container.innerHTML = recipeList
        .map(createRecipeCard)
        .join("");

    enableRecipeNavigation();
}


/* =========================================
   RECIPE CARD NAVIGATION
========================================= */

function enableRecipeNavigation() {

    const cards = document.querySelectorAll(".recipe-card");

    cards.forEach(card => {

        const favouriteButton =
            card.querySelector(".favourite-btn");

        if (favouriteButton) {

            favouriteButton.addEventListener("click", event => {

                event.preventDefault();
                event.stopPropagation();

                const recipeId =
                    Number(favouriteButton.dataset.favouriteId);

                toggleFavourite(recipeId);

                displayRecipes(
                    recipes.filter(recipe =>
                        recipe.name.toLowerCase().includes(
                            document.getElementById("recipe-search")?.value.trim().toLowerCase() || ""
                        )
                    )
                );

            });

        }

        function openRecipe() {

            const id = card.dataset.recipeId;

            card.classList.add("opening");

            setTimeout(() => {
                window.location.href =
                    `recipe-details.html?id=${id}`;
            }, 350);
        }

        card.addEventListener("click", openRecipe);

        card.addEventListener("keydown", event => {

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openRecipe();
            }

        });

    });
}

/* =========================================
   DISPLAY RECIPE DETAILS
========================================= */

function loadRecipeDetails() {

    const container =
        document.getElementById("recipe-details-container");

    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const recipeId = Number(params.get("id"));

    const recipe = recipes.find(item => item.id === recipeId);

    if (!recipe) {

        container.innerHTML = `
            <div class="recipe-details-loading">
                <h2>Recipe Not Found</h2>
                <p>Please select a recipe from the homepage.</p>
                <a href="index.html">Back to Home</a>
            </div>
        `;

        return;
    }


    /* INGREDIENTS HTML */

    const ingredientsHTML = (recipe.ingredients || [])
        .map((item, index) => `
            <li class="ingredient-item">

                <label>
                    <input
                        type="checkbox"
                        id="ingredient-${index}"
                    >

                    <span>${item.name}</span>
                </label>

                <strong>${item.quantity}</strong>

            </li>
        `).join("");


    /* EQUIPMENT HTML */

    const equipmentHTML = (recipe.equipment || [])
        .map(item => `<li>${item}</li>`)
        .join("");


    /* COOKING INSTRUCTIONS HTML */

const instructionsHTML = (recipe.instructions || [])
    .map((item, index) => {

        const stepNumber =
            typeof item === "string"
                ? index + 1
                : item.step || index + 1;

        const stepTitle =
            typeof item === "string"
                ? item
                : item.title || "";

        const stepDetails =
            typeof item === "string"
                ? ""
                : item.details || "";

        return `
            <li class="cooking-step">

                <label class="step-label">

                    <input
                        type="checkbox"
                        class="step-checkbox"
                    >

                    <span class="step-content">

                        <strong>
                            Step ${stepNumber}: ${stepTitle}
                        </strong>

                        ${stepDetails ? `<p>${stepDetails}</p>` : ""}

                    </span>

                </label>

            </li>
        `;

    }).join("");


    /* CHEF TIPS HTML */

    const tipsHTML = (recipe.chefTips || [])
        .map(item => `<li>${item}</li>`)
        .join("");


    /* RECIPE DETAILS PAGE */

    container.innerHTML = `

        <div class="recipe-details-page">

            <section class="recipe-details-hero">

                <img src="${recipe.image}" alt="${recipe.name}">

                <div class="recipe-details-heading">

                    <span class="recipe-category">
                        ${recipe.category}
                    </span>

                    <h1>${recipe.name}</h1>

                    <p>${recipe.description}</p>

                    <div class="recipe-meta">
                        <span>⏱ Prep: ${recipe.prepTime}</span>
                        <span>🔥 Cook: ${recipe.cookTime}</span>
                        <span>⭐ ${recipe.difficulty}</span>
                        <span>🍽 Serves: ${recipe.servings}</span>
                    </div>

                    <p>Total Time: ${recipe.totalTime}</p>

                    ${recipe.temperature ? `
                        <p>Oven Temperature: ${recipe.temperature}</p>
                    ` : ""}

                </div>

            </section>


            <section class="recipe-information">

                <h2>🥘 Ingredients</h2>

                <ul class="ingredient-list">
                    ${ingredientsHTML}
                </ul>

            </section>


            <section class="recipe-information">

                <h2>🍳 Kitchen Equipment</h2>

                <ul>
                    ${equipmentHTML}
                </ul>

            </section>


            <section class="recipe-information">

                <h2>👨‍🍳 Step-by-Step Instructions</h2>

                <ol class="cooking-steps">
                    ${instructionsHTML}
                </ol>

            </section>


            <section class="recipe-information">

                <h2>💡 Chef's Tips</h2>

                <ul>
                    ${tipsHTML}
                </ul>

            </section>


            <section class="recipe-information">

                <h2>❄️ Storage Instructions</h2>

                <p>
                    ${recipe.storage || "Storage instructions will be added soon."}
                </p>

            </section>


            <section class="recipe-information">

                <h2>🍽 Serving Suggestions</h2>

                <p>
                    ${recipe.servingSuggestion || "Serving suggestions will be added soon."}
                </p>

            </section>


            <a href="index.html" class="signup-btn">
                ← Back to Recipes
            </a>

        </div>

    `;


    /* =========================================
       INGREDIENT CHECKLIST FUNCTIONALITY
    ========================================= */

    const ingredientItems =
        container.querySelectorAll(".ingredient-item");

    ingredientItems.forEach(item => {

        const checkbox =
            item.querySelector('input[type="checkbox"]');

        if (!checkbox) return;

        checkbox.addEventListener("change", () => {

            item.classList.toggle(
                "checked",
                checkbox.checked
            );

        });

    });


    /* =========================================
       COOKING STEPS TRACKER FUNCTIONALITY
    ========================================= */

    const cookingSteps =
        container.querySelectorAll(".cooking-step");

    cookingSteps.forEach(step => {

        const checkbox =
            step.querySelector(".step-checkbox");

        if (!checkbox) return;

        checkbox.addEventListener("change", () => {

            step.classList.toggle(
                "step-completed",
                checkbox.checked
            );

        });

    });

}


/* =========================================
   RECIPE SEARCH SYSTEM
========================================= */

function setupRecipeSearch() {

    const searchInput =
        document.getElementById("recipe-search");

    const searchButton =
        document.getElementById("search-button");

    const clearButton =
        document.getElementById("clear-search");

    if (!searchInput || !searchButton) return;

    function searchRecipes() {

        const searchTerm =
            searchInput.value.trim().toLowerCase();

        const allRecipes = window.recipes || [];

        const filteredRecipes = allRecipes.filter(recipe => {

            const name = (recipe.name || "").toLowerCase();
            const category = (recipe.category || "").toLowerCase();
            const description = (recipe.description || "").toLowerCase();

            const ingredients = (recipe.ingredients || [])
                .map(item =>
                    typeof item === "string"
                        ? item
                        : item.name || ""
                )
                .join(" ")
                .toLowerCase();

            return (
                name.includes(searchTerm) ||
                category.includes(searchTerm) ||
                description.includes(searchTerm) ||
                ingredients.includes(searchTerm)
            );
        });

        document.querySelectorAll(".category-card")
            .forEach(card => {
                card.classList.remove("active");
            });

        displayRecipes(filteredRecipes);

    }

    searchButton.addEventListener("click", searchRecipes);

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchRecipes();
        }
    });

    if (clearButton) {
        clearButton.addEventListener("click", () => {
            searchInput.value = "";
            displayRecipes(window.recipes || []);
        });
    }
}

   
/* =========================================
   CATEGORY FILTER SYSTEM
========================================= */

function setupCategoryFilters() {

    const categoryCards =
        document.querySelectorAll(".category-card");

    if (!categoryCards.length) return;

    categoryCards.forEach(card => {

        card.addEventListener("click", () => {

            const selectedCategory =
                card.dataset.category;

            categoryCards.forEach(category => {
                category.classList.remove("active");
            });

            card.classList.add("active");

            if (!selectedCategory) return;

            const filteredRecipes = recipes.filter(recipe =>
                recipe.category.toLowerCase() ===
                selectedCategory.toLowerCase()
            );

            const heading =
                document.querySelector("#featured .section-heading h2");

            if (heading) {
                heading.textContent =
                    selectedCategory + " Recipes";
            }

            const searchInput =
                document.getElementById("recipe-search");

            if (searchInput) {
                searchInput.value = "";
            }

            displayRecipes(filteredRecipes);

            const featuredSection =
                document.getElementById("featured");

            if (featuredSection) {
                featuredSection.scrollIntoView({
                    behavior: "smooth"
                });
            }

        });

    });

}


/* =========================================
   VIEW ALL RECIPES BUTTON
========================================= */

function setupViewAllRecipes() {

    const button =
        document.getElementById("show-all-recipes");

    if (!button) return;

    button.addEventListener("click", () => {

        displayRecipes();

        const heading = document.querySelector(
            "#featured .section-heading h2"
        );

        if (heading) {
            heading.textContent = "Featured Recipes";
        }

        document.querySelectorAll(".category-card").forEach(card => {
            card.classList.remove("active");
        });

        const searchInput =
            document.getElementById("recipe-search");

        if (searchInput) {
            searchInput.value = "";
        }

    });

}


/* =========================================
   APPLICATION INITIALIZATION
========================================= */

function initializeApp() {

    console.log("Welcome to RecipeHub!");
    console.log("Owner:", APP_CONFIG.owner);
    console.log("Available Recipes:", recipes.length);

    displayRecipes();

    renderFavouriteRecipes();

    loadRecipeDetails();

    setupRecipeSearch();

    setupCategoryFilters();

    setupViewAllRecipes();

}


/* =========================================
   START APPLICATION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);

/* =========================================
   LOGIN & SIGN UP POPUP
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("auth-modal");
    const loginButton = document.getElementById("login-button");
    const signupButton = document.getElementById("signup-button");
    const closeButton = document.getElementById("auth-close");

    const title = document.getElementById("auth-title");
    const description = document.getElementById("auth-description");
    const submitButton = document.getElementById("auth-submit");
    const switchText = document.getElementById("auth-switch");
    const form = document.getElementById("auth-form");

    if (!modal || !loginButton || !signupButton) return;

    let currentMode = "login";

    function openAuth(mode) {
        currentMode = mode;

        title.textContent =
            mode === "login" ? "Welcome Back!" : "Create Your Account";

        description.textContent =
            mode === "login"
                ? "Login to your RecipeHub account."
                : "Join the RecipeHub cooking community.";

        submitButton.textContent =
            mode === "login" ? "Login" : "Sign Up";

        switchText.textContent =
            mode === "login"
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login";

        form.reset();
        modal.classList.add("active");
    }

    loginButton.addEventListener("click", function () {
        openAuth("login");
    });

    signupButton.addEventListener("click", function () {
        openAuth("signup");
    });

    closeButton.addEventListener("click", function () {
        modal.classList.remove("active");
    });

    switchText.addEventListener("click", function () {
        openAuth(currentMode === "login" ? "signup" : "login");
    });

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        description.textContent =
            "This is a demo form. Real account authentication is not connected yet.";
    });

});
/* =========================================
   LOGIN & SIGN UP - FIREBASE AUTHENTICATION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("auth-modal");
    const loginButton = document.getElementById("login-button");
    const signupButton = document.getElementById("signup-button");
    const closeButton = document.getElementById("auth-close");

    const title = document.getElementById("auth-title");
    const description = document.getElementById("auth-description");
    const submitButton = document.getElementById("auth-submit");
    const switchText = document.getElementById("auth-switch");
    const form = document.getElementById("auth-form");

    const googleButton = document.getElementById("google-login-btn");

    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    const confirmPassword = document.getElementById("confirm-password");

    if (!modal || !form) return;

    let currentMode = "login";

    function openAuth(mode) {

        currentMode = mode;

        title.textContent =
            mode === "login" ? "Welcome Back!" : "Create Your Account";

        description.textContent =
            mode === "login"
                ? "Login to your RecipeHub account."
                : "Join the RecipeHub cooking community.";

        submitButton.textContent =
            mode === "login" ? "Login" : "Sign Up";

        switchText.textContent =
            mode === "login"
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login";

        form.reset();
        modal.classList.add("active");

        const confirmWrapper = document.getElementById("confirm-password-wrapper");

        if (confirmWrapper) {
            confirmWrapper.style.display =
                mode === "signup" ? "block" : "none";
        }
    }

    loginButton?.addEventListener("click", () => openAuth("login"));
    signupButton?.addEventListener("click", () => openAuth("signup"));

    closeButton?.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    switchText?.addEventListener("click", () => {
        openAuth(currentMode === "login" ? "signup" : "login");
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });

    // EMAIL LOGIN AND SIGN UP

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const firebase = window.firebaseAuthAPI;

        if (!firebase) {
            description.textContent = "Firebase is not connected. Please refresh the page.";
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {

            submitButton.disabled = true;
            submitButton.textContent = "Please wait...";

            if (currentMode === "signup") {

                if (password !== confirmPassword.value) {
                    throw new Error("Passwords do not match!");
                }

                await firebase.createUserWithEmailAndPassword(
                    firebase.auth,
                    email,
                    password
                );

            } else {

                await firebase.signInWithEmailAndPassword(
                    firebase.auth,
                    email,
                    password
                );

            }

            modal.classList.remove("active");

        } catch (error) {

            const messages = {
                "auth/email-already-in-use": "This email is already registered.",
                "auth/invalid-email": "Please enter a valid email address.",
                "auth/weak-password": "Password must be at least 6 characters.",
                "auth/invalid-credential": "Incorrect email or password.",
                "auth/user-not-found": "No account found with this email.",
                "auth/wrong-password": "Incorrect password."
            };

            description.textContent =
                messages[error.code] || error.message;

        } finally {

            submitButton.disabled = false;
            submitButton.textContent =
                currentMode === "login" ? "Login" : "Sign Up";

        }

    });

    // GOOGLE LOGIN

    googleButton?.addEventListener("click", async function () {

        const firebase = window.firebaseAuthAPI;

        if (!firebase) {
            description.textContent = "Firebase is not connected.";
            return;
        }

        try {

            console.log("Google button clicked!");

            await firebase.signInWithPopup(
                firebase.auth,
                firebase.googleProvider
            );

            modal.classList.remove("active");

        } catch (error) {

            console.error("Google Login Error:",error);

            description.textContent = error.message;

        }

    });

});
// Password Show / Hide Feature

document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("auth-password");
    const togglePassword = document.getElementById("toggle-password");

    if (passwordInput && togglePassword) {

        togglePassword.addEventListener("click", function () {

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                togglePassword.textContent = "🙈";
            } else {
                passwordInput.type = "password";
                togglePassword.textContent = "👁";
            }

        });

    }

});
// Password Strength Checker

document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("auth-password");
    const strengthBox = document.getElementById("password-strength");
    const strengthFill = document.getElementById("strength-fill");
    const strengthText = document.getElementById("strength-text");

    if (!passwordInput || !strengthBox) return;

    passwordInput.addEventListener("input", function () {

        const password = passwordInput.value;

        if (!password) {
            strengthBox.style.display = "none";
            return;
        }

        strengthBox.style.display = "block";

        let score = 0;

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 2) {
            strengthFill.style.width = "33%";
            strengthFill.style.background = "#ff4d4d";
            strengthText.textContent = "Weak Password";
            strengthText.style.color = "#ff4d4d";
        } 
        else if (score <= 4) {
            strengthFill.style.width = "66%";
            strengthFill.style.background = "#ffc107";
            strengthText.textContent = "Medium Password";
            strengthText.style.color = "#ffc107";
        } 
        else {
            strengthFill.style.width = "100%";
            strengthFill.style.background = "#28c76f";
            strengthText.textContent = "Strong Password";
            strengthText.style.color = "#28c76f";
        }

    });

});

// Confirm Password Feature

document.addEventListener("DOMContentLoaded", function () {

    const passwordInput = document.getElementById("auth-password");
    const confirmInput = document.getElementById("confirm-password");
    const confirmWrapper = document.getElementById("confirm-password-wrapper");
    const confirmMessage = document.getElementById("confirm-password-message");
    const authTitle = document.getElementById("auth-title");
    const authSubmit = document.getElementById("auth-submit");
    const authForm = document.getElementById("auth-form");

    if (!passwordInput || !confirmInput || !confirmWrapper) return;

    function updateConfirmVisibility() {
        const isSignup =
            authSubmit.textContent.toLowerCase().includes("sign up") ||
            authTitle.textContent.toLowerCase().includes("sign up") ||
            authTitle.textContent.toLowerCase().includes("create account");

        confirmWrapper.style.display = isSignup ? "block" : "none";

        if (!isSignup) {
            confirmInput.value = "";
            confirmMessage.textContent = "";
        }
    }

    function checkPasswords() {
        if (!confirmInput.value) {
            confirmMessage.textContent = "";
            confirmMessage.className = "";
            return;
        }

        if (passwordInput.value === confirmInput.value) {
            confirmMessage.textContent = "✓ Passwords match";
            confirmMessage.className = "match";
        } else {
            confirmMessage.textContent = "✕ Passwords do not match";
            confirmMessage.className = "no-match";
        }
    }

    confirmInput.addEventListener("input", checkPasswords);
    passwordInput.addEventListener("input", checkPasswords);

    const observer = new MutationObserver(updateConfirmVisibility);

    observer.observe(authTitle, { childList: true, characterData: true, subtree: true });
    observer.observe(authSubmit, { childList: true, characterData: true, subtree: true });

    authForm.addEventListener("submit", function (event) {
        updateConfirmVisibility();

        if (confirmWrapper.style.display !== "none" &&
            passwordInput.value !== confirmInput.value) {
            event.preventDefault();
            event.stopImmediatePropagation();
            confirmMessage.textContent = "✕ Passwords do not match";
            confirmMessage.className = "no-match";
        }
    }, true);

    updateConfirmVisibility();
});
// FORGOT PASSWORD - FIREBASE

document.addEventListener("DOMContentLoaded", function () {

    const forgotButton = document.getElementById("forgot-password");
    const authEmail = document.getElementById("auth-email");
    const description = document.getElementById("auth-description");

    if (forgotButton) {

        forgotButton.addEventListener("click", async function (event) {

            event.preventDefault();

            const email = authEmail.value.trim();
            const firebase = window.firebaseAuthAPI;

            if (!email) {
                description.textContent = "Please enter your email address first.";
                authEmail.focus();
                return;
            }

            if (!firebase) {
                description.textContent = "Firebase is not connected.";
                return;
            }

            try {

                await firebase.sendPasswordResetEmail(
                    firebase.auth,
                    email
                );

                description.textContent =
                    "Password reset email sent! Please check your inbox.";

            } catch (error) {

                if (error.code === "auth/user-not-found") {
                    description.textContent = "No account found with this email.";
                } else if (error.code === "auth/invalid-email") {
                    description.textContent = "Please enter a valid email.";
                } else {
                    description.textContent = error.message;
                }

            }

        });

    }

});

/* =========================================
   RECIPEHUB PROFILE DASHBOARD
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const profileButton = document.getElementById("profile-button");
    const profileModal = document.getElementById("profile-modal");
    const profileClose = document.getElementById("profile-close");
    const profileLogout = document.getElementById("profile-logout");

    const favouritesButton = document.getElementById("profile-favourites");
    const savedButton = document.getElementById("profile-saved");
    const settingsButton = document.getElementById("profile-settings");

    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");

    if (!profileButton || !profileModal) return;

    function closeProfile() {
        profileModal.style.display = "none";
    }

    // SHOW PROFILE DETAILS

    const firebase = window.firebaseAuthAPI;

    if (firebase) {

        firebase.onAuthStateChanged(firebase.auth, function (user) {

            if (user) {

                if (profileName) {
                    profileName.textContent =
                        user.displayName || "RecipeHub User";
                }

                if (profileEmail) {
                    profileEmail.textContent =
                        user.email || "";
                }

            }

        });

    }

    // OPEN PROFILE

    profileButton.addEventListener("click", function () {
        profileModal.style.display = "flex";
    });

    // CLOSE PROFILE

    profileClose?.addEventListener("click", closeProfile);

    profileModal.addEventListener("click", function (event) {
        if (event.target === profileModal) {
            closeProfile();
        }
    });

    // LOGOUT

    profileLogout?.addEventListener("click", async function () {

        try {

            const firebase = window.firebaseAuthAPI;

            if (!firebase) {
                throw new Error("Firebase is not connected.");
            }

            await firebase.signOut(firebase.auth);

            closeProfile();

            alert("You have been logged out successfully!");

        } catch (error) {

            alert(error.message);

        }

    });

    // FAVOURITES

    favouritesButton?.addEventListener("click", function () {

        closeProfile();

        document.getElementById("favourites")?.scrollIntoView({
            behavior: "smooth"
        });

    });

    // SAVED RECIPES

    savedButton?.addEventListener("click", function () {
        alert("Saved Recipes feature is coming soon!");
    });

    // SETTINGS

    settingsButton?.addEventListener("click", function () {
        alert("Account Settings are coming soon!");
    });

});
/* =========================================
   RECIPEHUB - AUTHENTICATION PAGE LOCK
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const modal = document.getElementById("auth-modal");

    // Run only on the homepage
    if (!modal) return;

    const firebase = window.firebaseAuthAPI;

    // Lock page while checking login status
    document.body.classList.add("auth-locked");

    if (!firebase) {
        console.error("Firebase is not connected!");
        return;
    }

    firebase.onAuthStateChanged(firebase.auth, function (user) {

        if (user) {

            // User is logged in
            document.body.classList.remove("auth-locked");
            modal.classList.remove("active");

            console.log("RecipeHub access granted!");

        } else {

            // User is not logged in
            document.body.classList.add("auth-locked");
            modal.classList.add("active");

            console.log("Login required!");

        }

    });

});