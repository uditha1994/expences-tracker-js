//firebase configurations
const firebaseConfig = {
    apiKey: "AIzaSyDGEhWgnlT2oxZv0LCM7TOWAk07ansXlPU",
    authDomain: "expense-tracker-ccf46.firebaseapp.com",
    databaseURL: "https://expense-tracker-ccf46-default-rtdb.firebaseio.com",
    projectId: "expense-tracker-ccf46",
    storageBucket: "expense-tracker-ccf46.firebasestorage.app",
    messagingSenderId: "936124186406",
    appId: "1:936124186406:web:d5b22683647d27d1ad8be7",
    measurementId: "G-60V2MRHGE1"
};

//initialize firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

//DOM elements
const authContainer = document.getElementById('auth-container');
const loginForm = document.querySelector('.auth-form:first-of-type');
const signupForm = document.querySelector('.auth-form:last-of-type');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const appContainer = document.getElementById('app-container');

showSignup.addEventListener('click', () => {
    loginForm.style.display = 'none';
    setTimeout(() => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
        signupForm.style.display = 'block';
    }, 10);
});

showLogin.addEventListener('click', () => {
    signupForm.style.display = 'none';
    setTimeout(() => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        loginForm.style.display = 'block';
    }, 10);
});

//sign-up function
signupBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            //signed up
            const user = userCredential.user;

            //save additional user info to database
            database.ref('users/' + user.uid).set({
                name: name,
                email: email
            }).then(() => {
                console.log('User data saved!!');
                authContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        })
});

//login function
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            //signed in
            const user = userCredential.user;
            console.log('User logged in: ', user);
            authContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorMessage);
        });
});

//auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        //user is signed in
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
    } else {
        //user is signed out
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
});