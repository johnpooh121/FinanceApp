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

const downloadData = async () => {
  // const res = await fetch('/data/query/csv', {
  //   headers: {
  //     Authorization: window.localStorage.getItem('bearer'),
  //     'Content-Type': 'application/json',
  //   },
  //   method: 'POST',
  //   body: JSON.stringify({
  //     startDate: '2025-01-01',
  //     endDate: '2025-01-07',
  //     codes: ['005930'],
  //     isAllIssue: false,
  //   }),
  // });
  // const data = await res.text();
  // console.log(data);
  const form = document.getElementById('form-data-query');
  form.setAttribute('name', 'data');
  form.setAttribute('value', 'hi');
  const inputCheckBox = document.getElementById('input-isAllIssue');
  inputCheckBox.value = true;
  form.submit();
};

function IssuePostRequest(objData) {
  var strPageURL = 'about:blank';
  var strAction = '/data/query/csv';
  //var strAction = "/popups/delete.aspx";

  var strWindowName = 'MyEvilHttpPostInAnewWindow'; // ifrmDownload
  var iWindowWidth = 805;
  var iWindowHeight = 625;

  var form = document.createElement('form');
  form.setAttribute('id', 'bla');
  form.setAttribute('method', 'post');
  form.setAttribute('action', strAction);
  form.setAttribute('target', strWindowName);
  form.setAttribute('style', 'display: none;');
  // setting form target to a window named 'formresult'

  // Repeat for all data fields
  var hiddenField = document.createElement('input');
  hiddenField.setAttribute('name', 'data');
  hiddenField.setAttribute('value', JSON.stringify(objData));
  form.appendChild(hiddenField);
  // End Repeat for all data fields

  document.body.appendChild(form);

  // creating the 'formresult' window with custom features prior to submitting the form
  //window.open(test.html, 'formresult', 'scrollbars=no,menubar=no,height=600,width=800,resizable=yes,toolbar=no,status=no');
  //JS_PopupCenterScreen(strPageURL, strWindowName, iWindowWidth, iWindowHeight);
  // window.open(strPageURL, strWindowName);

  // document.forms[0].submit();
  //document.getElementById("xxx").click();
  form.submit();
} // End Function IssuePostRequest

refresh();
// IssuePostRequest({
//   startDate: '2025-01-01',
//   endDate: '2025-01-07',
//   codes: ['005930'],
//   isAllIssue: false,
// });

// IssuePostRequest({
//   startDate: '2005-01-03',
//   endDate: '2025-01-07',
//   codes: ['005930', '000020', '000040', '000050', '000070', '000075', '000080'],
//   isAllIssue: false,
// });

document.getElementById('refresh').addEventListener('click', refresh);
document
  .getElementById('form-update-email')
  .addEventListener('submit', updateUserEmail);
document
  .getElementById('delete-email')
  .addEventListener('click', deleteUserEmail);
document.getElementById('download').addEventListener('click', downloadData);
