// ! Навешивание события Burger-Menu

// ? Добавления класса при нажатии
$(document).ready(function () {
  $(".header__burger").click(function (event) {
    $(".header__burger,.header__menu").toggleClass("active");
    $("body").toggleClass("lock");
    $("#search").toggleClass("active");
  });
});

// ! CONTENT ALL FUNCTIONS
let API = "http://localhost:8000/characters";

let inp = $(".inp");
let name1 = $("#name");
let lastName = $("#last-name");
let number = $("#number");
let kpi = $("#kpi");
let kpi2 = $("#kpi-2");
let img = $("#img");

let list = $("#products-list");

let btn = $("#btn-add");

//*еременные для инпутов: для редактирования товаров

let editName = $("#edit-name");
let editLastName = $("#edit-last-name");
let editNumber = $("#edit-number");
let editSaveBtn = $("#btn-save-edit");
let editFormModal = $("#editFormModal"); //* убирает модальный лист
let editKpi = $("#edit-kpi");
let editKpi2 = $("#edit-kpi-2");
let editImg = $("#edit-img");

//* поиск
let searchInp = $("#search");
let searchVal = "";

// pagination
let prev = $(".prev"); //* предыдущая страница
let next = $(".next"); //* след. страница
let paginationList = $(".pagination-list"); //* блок куда добавляются кнопки с цифрами
let currentPage = 1; //*текущая страница
let totalCount = 1; //* общая количество страниц

//* событие навешиваем

btn.on("click", function () {
  if (
    !name1.val().trim() ||
    !lastName.val().trim() ||
    !number.val().trim() ||
    !kpi.val().trim() ||
    !kpi2.val().trim() ||
    !img.val().trim()
  ) {
    alert("заполни все по братски");
    return;
  }
  let obj = {
    name: name1.val(),
    lastName: lastName.val(),
    number: number.val(),
    kpi: kpi.val(),
    kpi2: kpi2.val(),
    img: img.val(),
  };
  setItemToJson(obj);
  // render();
  inp.val("");
});

//* отправляем данные на сервер
function setItemToJson(obj) {
  fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(obj),
  }).then(() => {
    render();
  });
}

//* вытаскиваем данные из сервера

function render() {
  fetch(`${API}?q=${searchVal}&_limit=6&_page=${currentPage}`).then((respond) =>
    respond.json().then((data) => {
      list.html("");
      data.forEach((element) => {
        let item = drawProductCard(element);
        list.append(item);
      });
      drawPoginationButtons();
    })
  );
}
//* динамическая верстка
function drawProductCard(element) {
  return `
    <div class="card m-5" style="width: 18rem;">
  <img src=${element.img} class="card-img-top"22 alt="...">
  <div class="card-body">
    <h5 class="card-title">${element.name}</h5>
    <p class="card-text">${element.lastName}</p>
    <p class="card-text"> ${element.number}</p>
    <p class="card-text">weekly KPI: ${element.kpi}</p>
    <p class="card-text">monthly KPI: ${element.kpi2}</p>
    <a href="#" id=${element.id} class="btn btn-dark bg-warning text-dark btn-delete">DELETE</a>
    <a href="#" id=${element.id} class="btn btn-dark bg-warning text-dark btn-edit" data-bs-toggle="modal" data-bs-target="#editFormModal">EDIT</a>
  </div>
</div>
    `;
}

//* удаление элемента

$("body").on("click", ".btn-delete", (e) => deleteInfo(e.target.id));

function deleteInfo(id) {
  fetch(`${API}/${id}`, {
    method: "DELETE",
  }).then(() => {
    render();
  });
}

//* РЕДАКТИРОВАНИЕ

$("body").on("click", ".btn-edit", function () {
  fetch(`${API}/${this.id}`).then((response) =>
    response.json().then((data) => {
      //* data - объект с (name lastname number id)

      //* заполняем поля редактирования  данными из элемента
      editImg.val(data.img);
      editName.val(data.name);
      editLastName.val(data.lastName);
      editNumber.val(data.number);
      editKpi.val(data.kpi);
      editKpi2.val(data.kpi2);

      editSaveBtn.attr("id", data.id);
      //* добавляем аттрибут id  и записываем id редактируемого объекта
    })
  );
});

editSaveBtn.on("submit", function () {
  let id = this.id; // Вытаскиваем из кнопки ID и кладем его в переменную
  // Перезаписываем значения новых инпутов из модального окна в переменные
  let name = editName.val();
  let lastName = editLastName.val();
  let number = editNumber.val();
  let kpi = editKpi.val();
  let kpi2 = editKpi2.val();
  let img = editImg.val();

  if (!name || !lastName || !number || !kpi || !kpi2 || !img) {
    return;
  }

  let editedProduct = {
    // Формируем новый объект из новых введенных данных, чтобы отправить на сервер
    name: name,
    lastName: lastName,
    number: number,
    kpi: kpi,
    kpi2: kpi2,
    img: img,
  };

  saveEdit(editedProduct, id); //Вызываем функцию для сохранения данных и передаем ей этот новый объект и id
});

function saveEdit(editedProduct, id) {
  fetch(`${API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json;charset=utf-8" },
    body: JSON.stringify(editedProduct),
  }).then(() => {
    render();
    editFormModal.modal("hide");
  });
}

//? search Живой поиск
searchInp.on("input", () => {
  searchVal = searchInp.val();
  render();
});

render();
//! PAGINATION

function drawPoginationButtons() {
  fetch(`${API}?q=${searchVal}`) //* это запрос на сервер что бы узнать общее количество запросов
    .then((res) =>
      res.json().then((data) => {
        pageTotalCount = Math.ceil(data.length / 6); //* общее количество продуктов делим на одной странице // pageTotalCount - количество страниц
        paginationList.html("");

        for (let i = 1; i <= pageTotalCount; i++) {
          // создаем кнопки с цифрами
          if (currentPage == i) {
            //* сравниваем текущую страницу с цифрой из кнопки Если они совпадают то нужно закрасить эту кнопку, обозначая на какоей странице мы находимся
            paginationList.append(
              `<li class="page-item active"><a class="page-link page-number text-light bg-dark" href="#">${i}</a></li>`
            );
          } else {
            paginationList.append(
              `<li class="page-item"><a class="page-link page-number text-light bg-dark" href="#">${i}</a></li>`
            );
          }
        }
      })
    );
}

//* кнопка переключение на предыдущую страницу
prev.on("click", () => {
  if (currentPage <= 1) {
    return;
  }
  currentPage--;
  render(); //* текущее состояние
});

//* кнопка переключение на след. страницу

next.on("click", () => {
  if (currentPage >= pageTotalCount) {
    return;
  }
  currentPage++;
  render(); //* текущее состояние
});

//* кнопки для переключение на определенную страницу

$("body").on("click", ".page-number", function () {
  currentPage = this.innerText; //* обозначаем текущую страницу из кнопки
  render();
});

// ! WISH LIST STARTS JAVASCRIPT

// ! Selectors
const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");
// ! Even Listeners
// Загружать элементы при обновлении и вызывать функцию получения данных из localstorage
document.addEventListener("DOMContentLoaded", getTodos);
// Adding elements
todoButton.addEventListener("click", addTodo);
// Deleting system
todoList.addEventListener("click", deleteCheck);
// Filter options adding
filterOption.addEventListener("click", filterTodo);
// ! Functions

function addTodo(event) {
  event.preventDefault(); // Сделать кнопку кликабельной и чтобы браузер не обновлялся
  //Todo Div
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");
  //Create li
  const newTodo = document.createElement("li");
  newTodo.innerText = todoInput.value;
  newTodo.classList.add("todo-item");
  todoDiv.appendChild(newTodo);
  // ADD TODO to local storage
  saveLocalTodos(todoInput.value); // Вызов функции сохранения в localstorage при клике на todobutton
  //Check mark button
  const completedButton = document.createElement("button");
  completedButton.innerHTML = '<i class="fas fa-check"></i>';
  completedButton.classList.add("complete-btn");
  todoDiv.appendChild(completedButton);
  //Check trash button
  const trashButton = document.createElement("button");
  trashButton.innerHTML = '<i class="fas fa-trash"></i>';
  trashButton.classList.add("trash-btn");
  todoDiv.appendChild(trashButton);
  //   APPEND TO LIST
  todoList.appendChild(todoDiv);
  //   CLEAR Todo Input value
  todoInput.value = "";
}

function deleteCheck(e) {
  const item = e.target;
  // DELETE TODO
  if (item.classList[0] === "trash-btn") {
    const todo = item.parentElement;
    // Animation
    todo.classList.add("fall"); // animation class
    removeLocalTodos(todo); // Вызов функции удаления при клике на todoList
    todo.addEventListener("transitionend", function () {
      todo.remove();
    });
  }

  //   CHECK MARK
  if (item.classList[0] === "complete-btn") {
    const todo = item.parentElement;
    todo.classList.toggle("completed");
  }
}

// Filter to do
function filterTodo(e) {
  const todos = todoList.childNodes;
  todos.forEach(function (todo) {
    switch (e.target.value) {
      case "all":
        todo.style.display = "flex";
        break;

      case "completed":
        if (todo.classList.contains("completed")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
        break;

      case "uncompleted":
        if (!todo.classList.contains("completed")) {
          todo.style.display = "flex";
        } else {
          todo.style.display = "none";
        }
        break;
    }
  });
}

// Функция сохранения данных в localstorage и пушить в пустой массив наши объекты
function saveLocalTodos(todo) {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Функция получения и отображения данных на странице
function getTodos() {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  todos.forEach(function (todo) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    //Create li
    const newTodo = document.createElement("li");
    newTodo.innerText = todo;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);
    //Check mark button
    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);
    //Check trash button
    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);
    //   APPEND TO LIST
    todoList.appendChild(todoDiv);
  });
}

// Функция удаления

function removeLocalTodos(todo) {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  const todoIndex = todo.children[0].innerText; // получение сначала значения, а затем индекса каждого добавленного элемента
  todos.splice(todos.indexOf(todoIndex), 1); // удалить одно значение, начиная с того элемента и остановиться
  localStorage.setItem("todos", JSON.stringify(todos)); // Добавляем теперь в localstorage наш новый div
}

// ! WISH LIST ENDS
