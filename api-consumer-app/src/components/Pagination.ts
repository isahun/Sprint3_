import { ITEMS_PER_PAGE, MAX_VISIBLE_PAGES } from "../constants/config";
import { MESSAGES } from "../constants/messages";

//Pagination
export function setupPagination(
  totalItems: number,
  currentPage: number,
  paginationContainer: HTMLElement,
  onPageChange: (newPage: number) => void
): void {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (totalPages <= 1) {
    paginationContainer.style.display = "none";
    return;
  }

  paginationContainer.style.display = "flex";
  const { startPage, endPage } = calcStartEndPage(currentPage, totalPages);

  //Unify pagination buttons in 1 function to fix duplicate logic
  if (currentPage > 1) {
    createPaginationButton(
      MESSAGES.BTN_PREV,
      currentPage - 1,
      "pagination-btn",
      false,
      paginationContainer,
      onPageChange,
    );
  }

  for (let i = startPage; i <= endPage; i++) {
    createPaginationButton(
      i.toString(),
      i,
      "pagination-active",
      i === currentPage,
      paginationContainer,
      onPageChange,
    );
  }

  if (currentPage < totalPages) {
    createPaginationButton(
      MESSAGES.BTN_NEXT,
      currentPage + 1,
      "pagination-btn",
      false,
      paginationContainer,
      onPageChange,
    );
  }
}

function createPaginationButton(
  text: string,
  targetPage: number,
  className: string,
  isDisabled: boolean,
  container: HTMLElement,
  onPageChange: (newPage:number) => void
): void {
  const button = document.createElement("button");
  button.classList.add(className);
  button.textContent = text;
  button.disabled = isDisabled;

  //minor ts fix: convert text to num to validate
  button.ariaLabel = !isNaN(Number(text)) ? `${MESSAGES.PAGE_ARIA} ${text}` : text;

  button.addEventListener("click", () => {
    onPageChange(targetPage); //to let main.js know we need to change page
  });

  container.appendChild(button);
}

//Pagination Util: Calc start page and end page to create btns
function calcStartEndPage(
  currentPage: number, 
  totalPages: number
): { startPage: number; endPage: number } {
  const half = Math.floor(MAX_VISIBLE_PAGES / 2); //2 pages at each side of the current
  let startPage = currentPage - half;
  let endPage = currentPage + half;

  if (startPage < 1) {
    startPage = 1;
    endPage = Math.min(totalPages, MAX_VISIBLE_PAGES);
  }

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, totalPages - MAX_VISIBLE_PAGES + 1);
  }

  return { startPage, endPage };
}
