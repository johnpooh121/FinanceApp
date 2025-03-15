const refreshSession = async () => {
  const res = await fetch('/auth/refresh', {
    method: 'POST',
  });
  if (res.status == 401) {
    alert('세션이 만료되었습니다. 로그인 화면으로 이동합니다');
    window.location.replace('/web/login');
  }
  const bearerToken = await res.text();
  window.localStorage.setItem('bearer', bearerToken);
};

const getUserInfo = async () => {
  const res = await fetch('/user', {
    headers: {
      Authorization: window.localStorage.getItem('bearer'),
    },
    method: 'GET',
  });
  if (res.status == 401) {
    alert('세션이 만료되었습니다. 로그인 화면으로 이동합니다');
    window.location.replace('/web/login');
  }
  const user = await res.json();
  console.log(user);
  document.getElementById('user-email').textContent =
    user.email ?? '설정되지 않음';
  document.getElementById('user-createdAt').textContent = user.createdAt;
  document.getElementById('user-updatedAt').textContent = user.updatedAt;
};

const refresh = async () => {
  console.log('refreshing..');
  await refreshSession();
  await getUserInfo();
};

const editUser = async (data) => {
  await fetch('/user', {
    headers: {
      Authorization: window.localStorage.getItem('bearer'),
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(data),
  });
};

const updateUserEmail = async (event) => {
  event.preventDefault();
  const email = event.target['submitted-email'].value;
  await editUser({ email });
  refresh();
  return false;
};

const deleteUserEmail = async () => {
  await editUser({ email: null });
  refresh();
};

refresh();

document.getElementById('refresh').addEventListener('click', refresh);
document
  .getElementById('form-update-email')
  .addEventListener('submit', updateUserEmail);
document
  .getElementById('delete-email')
  .addEventListener('click', deleteUserEmail);
