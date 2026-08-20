function returnhome() {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    
        window.location.href = 'index.html?user=' + encodeURIComponent(user);
    
}