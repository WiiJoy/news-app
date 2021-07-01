// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                const response = JSON.parse(xhr.responseText);
                cb(null, response);
                });
  
                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });
  
                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });
  
                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });
  
                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }
  
                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}
// Init http module
const http = customHttp();


// установка отношения с api
const newsService = (function () {
    const apiKey = '04bdf473a14c45e1a3d62fb2695d1929';
    const apiUrl = 'https://newsapi.org/v2';

    return {
        topHeadlines(country = 'ru', cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        }
    };
})();
  
//  init selects
document.addEventListener('DOMContentLoaded', function() {
    M.AutoInit();
    loadNews(); // вызов, когда прогрузится весь DOM
});

// Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];

form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadNews();
});


// функция по загрузке новостей
function loadNews() {
    showLoader();
    const country = countrySelect.value;
    const searchText = searchInput.value;

    if (!searchText) {
        newsService.topHeadlines(country, onGetResponse);
    } else {
        newsService.everything(searchText, onGetResponse);
    }
    
}

// отработка, когда получаются новости
function onGetResponse(err, res) {

    removeLoader();

    if (err) {
        showAlert(err, 'error-msg');
        return;
    }
    // проверка наличия новостей
    if (!res.articles.length) {
        // show empty message
        return;
    }

    renderNews(res.articles);
}

// рендер получаемых новостей
function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');

    // проверка наполненности контейнера для его очистки
    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }

    let fragment = '';
    news.forEach(newsItem => {
        const el = newsTemplate(newsItem);
        fragment += el;
    });

    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

// формирование разметки каждой новости
function newsTemplate({urlToImage, title, url, description}) {
    return `
        <div class="col-s12">
            <div class="card">
                <div class="card-image">
                    <img src="${urlToImage}">
                    <span class="card-title">${title || ''}</span>
                </div>
                <div class="card-content">
                    <p>${description || ''}</p>
                </div>
                <div class="card-action">
                    <a href="${url}">Read more</a>
                </div>
            </div>
        </div>
    `;
}

// выпадающее сообщение при ошибке
function showAlert(msg, type) {
    M.toast({html: msg, classes: type}); // параметры из библиотеки
}

// очистка контейнера новостей
function clearContainer(container) {
    let child = container.lastElementChild;
    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

// прелоадер
function showLoader() {
    document.body.insertAdjacentHTML(
        'afterbegin',
        `
            <div class="progress">
                <div class="indeterminate"></div>
            </div>
        `
    );
}
function removeLoader() {
    const loader = document.querySelector('.progress');
    if (loader) {
        loader.remove();
    }
}