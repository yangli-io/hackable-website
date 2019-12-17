const token = localStorage.getItem('token');

function formSubmit(id, callback) {
  const elm = document.querySelector("#" + id);

  if (elm) {
    elm.addEventListener("submit", function(e){
      e.preventDefault();

      callback();
    });
  }
}

formSubmit('loginForm', () => {
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password,
    })
  })
  .then((res) => res.json())
  .then((data) => {
    const token = data.token;
    localStorage.setItem('token', token);
    window.location.href = './home.html'
  })
  .catch(() => {
    alert('error')
  })
});

formSubmit('registerForm', () => {
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;
  const firstName = document.querySelector('#firstName').value;
  const lastName = document.querySelector('#lastName').value;
  const description = document.querySelector('#description').value;

  fetch('/api/user', {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username,
      password,
      firstName,
      lastName,
      description,
    })
  })
  .then((res) => res.json())
  .then((data) => {
    alert('registered!');
    window.location.href = './index.html'
  })
  .catch(() => {
    alert('error')
  })
});

formSubmit('transfer', () => {
  const searchParam = location.search;
  const amount = document.querySelector('#amount').value;

  fetch('/api/transfer' + searchParam, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      token,
      amount: +amount,
    })
  })
  .then((res) => res.json())
  .then((data) => {
    alert(data.message);
  })
  .catch(() => {
    alert('error')
  })
});

function loadUsers() {
  fetch('/api/users')
    .then((res) => res.json())
    .then((results) => {
      const htmlArr = results.map(data => {
        return `
          <div class="user">
            <div><a href='./profile.html?user=${data.username}'>${data.firstName} ${data.lastName}</a></div>
            <div>Bank Account: $${data.savings}</div>
          </div>
        `;
      })
      document.querySelector('#users').innerHTML = htmlArr.join('')
    })
}

function getProfile() {
  const searchParam = location.search;

  fetch('/api/user' + searchParam)
    .then((res) => res.json())
    .then((result) => {
      document.querySelector('#name').innerText = `${result.firstName} ${result.lastName}`
      document.querySelector('#name-2').innerText = `${result.firstName} ${result.lastName}`

      document.querySelector('#savings').innerText = result.savings;

      document.querySelector('#description').innerText = result.description;
    })
}
