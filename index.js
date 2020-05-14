'use strict';

{
  const header = document.querySelector('.header');
  const select = createAndAppend('select', header, {
    class: 'options'
  });

  function fetchJSON(url, cb) {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `${response.status} - ${response.statusText}. Check your search terms.`,
          );
        }
        return response.json();
      })
      .then((data) => cb(null, data))
      .catch((error) => cb(error, null));
  }

  function createAndAppend(name, parent, options = {}) {
    const elem = document.createElement(name);
    parent.appendChild(elem);
    Object.entries(options).forEach(([key, value]) => {
      if (key === 'text') {
        elem.textContent = value;
      } else {
        elem.setAttribute(key, value);
      }
    });
    return elem;
  }

  function renderRepoDetails(repo, section, tableCreator) {
    const table = createAndAppend('table', section);
    tableCreator(table, repo);
  }

  function main(url) {
    fetchJSON(url, (err, repos) => {
      const root = document.getElementById('root');
      if (err) {
        document.querySelector('.main-container').classList.add('remove');
        createAndAppend('div', root, {
          text: err.message,
          class: 'alert-error',
        });
        return;
      }
      //ADDING AND RENDERING REPOS
      addRepo(repos)
    });
  }

  function addRepo(repos) {
    const repoContainer = document.querySelector('.repo-container');

    repos
      .sort((a, b) =>
        a.name.localeCompare(b.name, 'en', {
          ignorePunctuation: true,
        }),
      )
      .forEach((repo, index) => {
        createAndAppend('option', select, {
          text: `${repo.name}`.toUpperCase(),
          value: index
        });
        //WHEN CHANGE REPO NAME, CONTRIBUTORS COME RELATIVE TO THE NEW REPO
        select.addEventListener('change', (e) => {
          if (e.target.value == index) {
            repoContainer.innerText = '';
            renderRepoDetails(repo, repoContainer, tableCreator);
            addContributor(repo);
          }
        });
      });
    //WHEN THE PAGE LOADED, IT SHOWS THE FIRST REPO AND ITS CONTRIBUTORS
    renderRepoDetails(repos[0], repoContainer, tableCreator);
    addContributor(repos[0]);
  }

  //REPOSITORY SECTION
  function tableCreator(table, repo) {
    const tableArr = [repo.name, repo.description, repo.forks, repo.updated_at];
    const names = ['Repository', 'Description', 'Forks', 'Updated'];
    tableArr.forEach((item, index) => {
      const tr = createAndAppend('tr', table);
      createAndAppend('th', tr, {
        text: names[index],
      });
      createAndAppend('td', tr, {
        text: `: ${item}`,
      });
    });
  }

  //CONTRIBUTORS API SECTION
  function addContributor(repo) {
    const contURL = repo.contributors_url;
    fetchJSON(contURL, (err, contributors) => {
      const root = document.getElementById('root');
      if (err) {
        createAndAppend('div', root, {
          text: err.message,
          class: 'alert-error',
        });
        return;
      }
      const contContainer = document.querySelector('.contributors-container');
      contContainer.innerText = '';
      const contributorHeader = createAndAppend('p', contContainer, {
        class: 'contributor-header'
      });
      contributorHeader.innerText = 'Contributions';
      const ul = createAndAppend('ul', contContainer);
      contributors.forEach((person) => {
        const li = createAndAppend('li', ul);
        const div = createAndAppend('div', li, {
          class: 'contributors-avatar'
        });
        createAndAppend('img', div, {
          src: person.avatar_url
        });
        createAndAppend('a', div, {
          text: person.login,
          href: person.html_url
        });
        createAndAppend('span', li, {
          text: person.contributions,
          class: 'contribution-counts'
        });
      });
    });
  }

  const HYF_REPOS_URL =
    'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';
  window.onload = () => main(HYF_REPOS_URL);

  //HERE IS COMPLETELY A PLAYGROUND FOR ME TO SHOW A LOADING EFFECT WHEN NEW CONTRIBUTORS ARE LOADING,
  //NOT THE PART OF THE HOMEWORK
  select.addEventListener('change', () => {
    const contributorContainer = document.querySelector('.contributors-container');
    contributorContainer.innerText = 'Loading...';
    createAndAppend('div', contributorContainer, {
      class: 'loader'
    })
  })

}