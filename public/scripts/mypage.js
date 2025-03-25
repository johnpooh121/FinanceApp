const idList = [
  'minMarketCap',
  'maxMarketCap',
  'minPer',
  'maxPer',
  'minPbr',
  'maxPbr',
  'minDy',
  'vsLowPrice',
  'vsHighPrice',
];

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
      authorization: window.localStorage.getItem('bearer'),
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
  document.getElementById('user-quota').textContent = user.quota;
  document.getElementById('user-sub').textContent =
    user.sub === 1 ? '활성화' : '비활성화';
  if (user.criteria) {
    const texts = [];
    const {
      minMarketCap,
      maxMarketCap,
      minPer,
      maxPer,
      minPbr,
      maxPbr,
      minDy,
      vsLowPrice,
      vsHighPrice,
    } = user.criteria;
    if (minMarketCap || maxMarketCap)
      texts.push(
        `시가총액 ${minMarketCap ? `${minMarketCap}원 이상, ` : ''} ${maxMarketCap ? `${maxMarketCap원} 이하` : ''}`,
      );
    if (minPer || maxPer)
      texts.push(
        `PER ${minPer ? `${minPer} 이상, ` : ''} ${maxPer ? `${maxPer} 이하` : ''}`,
      );
    if (minPbr || maxPbr)
      texts.push(
        `PBR ${minPbr ? `${minPbr} 이상, ` : ''} ${maxPbr ? `${maxPbr} 이하` : ''}`,
      );
    if (minDy) texts.push(`배당이익률 ${minDy} 이상`);
    if (vsLowPrice) texts.push(`52주 저점 대비 상승률 ${vsLowPrice}% 이하`);
    if (vsHighPrice) texts.push(`52주 고점 대비 하락률 ${vsHighPrice}% 이상`);
    document.getElementById('user-criteria').innerHTML =
      `<br>${texts.map((row) => `&emsp;- ${row}`).join('<br>')}`;
    idList.forEach((id) => {
      if (user.criteria[id])
        document.getElementById(`input-${id}`).value = user.criteria[id];
    });
  }
  document.getElementById('checkbox-sub').checked = user.sub == 1;
};

const refresh = async () => {
  console.log('refreshing..');
  await refreshSession();
  await getUserInfo();
};

const editUser = async (data) => {
  await fetch('/user', {
    headers: {
      authorization: window.localStorage.getItem('bearer'),
      'Content-Type': 'application/json',
    },
    method: 'PATCH',
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
  const form = document.getElementById('form-data-query');
  hiddenField.setAttribute('name', 'authorization');
  hiddenField.setAttribute('value', window.localStorage.getItem('bearer'));
  hiddenField.setAttribute('type', 'hidden');
  form.appendChild(hiddenField);
  form.submit();
  refresh();
  setTimeout(refresh, 500);
  setTimeout(refresh, 3000);
};

const updateUserCriteria = async () => {
  const criteria = {};
  idList.forEach((id) => {
    const v = document.getElementById(`input-${id}`).value;
    if (v) criteria[id] = v;
  });
  const sub = document.getElementById('checkbox-sub').checked;
  await editUser({ criteria, sub });
  refresh();
};

const getRecommendData = async () => {
  const criteria = {};
  idList.forEach((id) => {
    const v = document.getElementById(`input-${id}`).value;
    if (v) criteria[id] = v;
  });
  const req = await fetch('/data/recommend', {
    headers: {
      authorization: window.localStorage.getItem('bearer'),
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(criteria),
  });
  const list = await req.json();
  tableBody.innerHTML = '';
  list.map(
    ({
      code,
      name,
      adjClose,
      marketCap,
      per,
      pbr,
      dy,
      yearMinPrice,
      yearMaxPrice,
      foreignOwnRate,
    }) => {
      const nr = tableBody.insertRow();
      nr.innerHTML = `<td>${code}</td><td>${name}</td><td>${adjClose}</td><td>${yearMaxPrice}</td><td>${yearMinPrice}</td><td>${marketCap}</td><td>${per}</td><td>${pbr}</td><td>${dy}</td><td>${foreignOwnRate}</td>`;
    },
  );
};

refresh();

document.getElementById('refresh').addEventListener('click', refresh);
document
  .getElementById('form-update-email')
  .addEventListener('submit', updateUserEmail);
document
  .getElementById('delete-email')
  .addEventListener('click', deleteUserEmail);
document.getElementById('download').addEventListener('click', downloadData);
document.getElementById('input-startDate').value = '2025-03-04';
document.getElementById('input-endDate').value = new Date()
  .toISOString()
  .slice(0, 10);
const hiddenField = document.createElement('input');
document.getElementById('apply').addEventListener('click', updateUserCriteria);
document
  .getElementById('testQuery')
  .addEventListener('click', getRecommendData);
const table = document.getElementById('table');
const tableBody = document.getElementById('table-body');
