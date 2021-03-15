function login(){
    document.cookie = 'loggedIn=True';
}

function logout(){
    document.cookie = 'loggedIn=False';
}

function isLoggedIn(){
    const value = `; ${document.cookie}`;
    const parts = value.split(`; loggedIn=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

export default { login, logout, isLoggedIn};