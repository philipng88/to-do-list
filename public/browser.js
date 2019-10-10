const itemTemplate = item => {
  return `<div class="list-item">
            <span class="item-text">${item.text}</span>
            <div>
              <button data-id="${item._id}" class="button edit-button is-small is-info">Edit</button>
              <button data-id="${item._id}" class="button delete-button is-small is-danger">Delete</button>
            </div>
          </div>`
}

// Initial Page Load Render
let itemsHTML = items.map(item => {
  return itemTemplate(item)
}).join("")
document.getElementById("item-list").insertAdjacentHTML("beforeend", itemsHTML)

// Create Feature
let createField = document.getElementById("create-field")

document.getElementById("create-form").addEventListener("submit", event => {
  event.preventDefault()
  axios.post('/create-item', {text: createField.value}).then(response => {
    document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
    createField.value = ""
    createField.focus()
  }).catch(err => {
    console.log(err)
  })
})

document.addEventListener("click", event => {
  // Delete Feature
  if (event.target.classList.contains("delete-button")) {
    if (confirm("Are you sure you want to delete this item?")) {
      axios.post('/delete-item', {id: event.target.getAttribute("data-id")}).then(() => {
        event.target.parentElement.parentElement.remove()
      }).catch(err => {
        console.log(err)
      })
    }
  }

  // Update Feature
  if (event.target.classList.contains("edit-button")) {
    let userInput = prompt("Edit To-Do Item", event.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
    if (userInput) {
      axios.post('/update-item', {text: userInput, id: event.target.getAttribute("data-id")}).then(() => {
        event.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
      }).catch(err => {
        console.log(err)
      })
    }
  }
})