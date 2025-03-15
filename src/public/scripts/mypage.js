const refresh = async () => {
  console.log('hh');
  const res = await fetch({
    url: '/auth/refresh',
  });
};

document.getElementById('refresh-token').addEventListener('click', refresh);
