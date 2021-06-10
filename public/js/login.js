login = () => {

    let email = document.getElementById('email').value
    let pwd = document.getElementById('password').value

    fetch('/login', {
        method: 'POST',
        redirect: 'manual',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            pwd: pwd
        }),
    }).then( response => {
        if (response.status === 200) {
            window.location.href='/home'
        }
    }).catch(err => console.log(err))
}
