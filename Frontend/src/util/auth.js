function login(){
    window.localStorage.setItem("isLoggedIn", true);
}

function logout(){
    window.localStorage.setItem("isLoggedIn", false);
}

function isLoggedIn(){
    return JSON.parse(window.localStorage.getItem("isLoggedIn"));
}

export default { login, logout, isLoggedIn};