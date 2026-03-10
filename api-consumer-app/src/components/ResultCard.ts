import { API_TYPES } from "../constants/config.js"

//Fix "feature envy" and "switch statements" using DICTIONARY (Strategy Pattern for rendering). Instead of multiple ifs, app goes to dictionary, seeks right recipe (selected type), and applies saved pattern to paint each option
const renderStrategies = {
    [API_TYPES.POSTS]: (item) => `
    <small class="card-ID">Post ID: ${item.id} </small>
    <h3 class="card-title">${item.title}</h3>
    <p class="card-body">${item.body}</p>
    `,
    [API_TYPES.USERS]: (item) => `
    <small class="card-ID">User ID: ${item.id}</small>
    <h3 class="card-title">${item.name}</h3>
    <p class="card-email">${item.email}</p>
    <p class="card-company">Company: ${item.company.name}</p>
    `,
    [API_TYPES.COMMENTS]: (item) => `
    <small class="card-ID">ID: ${item.id}</small>
    <h3 class="card-title">${item.name}</h3>
    <small class="card-email">Author Email: ${item.email}</small>
    <p class="card-body">${item.body}</p>
    <small class="card-ID">Related Post ID: ${item.postId}</small>
    `,
  };


export function createCardElement (item, selectedType) {

    //1. Create empty div
    const card = document.createElement("div");
    card.classList.add("card");

    //2. Find and execute proper strategy matching selectedType (paint users, comments or posts)
    const renderContent = renderStrategies[selectedType];

    //3. If type is selected, find HTML and inject item
    if (renderContent) {
      //we execute strategy passing item as param, without knowing its exact properties
      card.innerHTML = renderContent(item);
    }
    //4. Returns DOM element ready to get back to main and be displayed
    return card;
}