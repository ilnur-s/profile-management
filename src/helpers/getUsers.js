export default async function getUsers() {
  try {
    const request = await fetch('https://randomuser.me/api/?results=20&inc=name,dob,location&nat=gb');
    const response = await request.json();
    const value = JSON.stringify(response.results.map((item) => ({
      firstName: item.name.first,
      lastName: item.name.last,
      middleName: item.location.state,
      birthDate: item.dob.date.split('T')[0],
      description: `${item.location.city}, ${item.location.postcode}`,
    })));
    localStorage.setItem('users', value);
  } catch {
    alert('Произошла ошибка загрузки данных, попробуйте перезагрузить страницу');
  }
}
