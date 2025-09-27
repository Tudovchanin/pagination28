

class Pagination {
  // DOM Elements
  btnNext;
  btnBackToTheStart;
  pageButtons;
  dots;

  // State
  pivotButtonIndex = 0;
  pivotButtonValue = 1;
  totalPages = 1;
  initialButtonValues = [];
  currentButtonValues = [];

  currentPage = 1;
  prevPage = 1;
  endPagination = false;

  // Event
  changePageEvent


  // Handlers
  handleBtnNext
  handleNumberPage
  handleBackToTheStart
  buttonHandlers = [];

  constructor({ $btnNext, $btnBackToTheStart, $pageButtons, $dots }) {
    this.btnNext = $btnNext;
    this.btnBackToTheStart = $btnBackToTheStart;
    this.pageButtons = $pageButtons;
    this.dots = $dots;
  }

  initPagination(totalPages, pivotIndex) {


    // Initialize page buttons
    this.pageButtons.forEach((btn, index) => {
      btn.textContent = index + 1;
      this.currentButtonValues.push(index + 1);
    });
    this.initialButtonValues = [...this.currentButtonValues];
    this.totalPages = totalPages;
    this.pivotButtonIndex = pivotIndex;
    this.pivotButtonValue = +this.pageButtons[this.pivotButtonIndex].textContent;

    // Event handlers
    this.handleBtnNext = () => {

      if (this.currentPage >= this.totalPages) return;

      this.prevPage = this.currentPage;
      ++this.currentPage;
      document.dispatchEvent(this.createPageChangeEvent('next'));
      this.toggleBthGoToTheStart();

      if (this.currentPage <= this.pivotButtonValue) {
        this.showActiveCurrentPage(this.currentPage);
        return;
      }

      if (this.currentButtonValues.at(-1) === this.totalPages) {
        this.showActiveCurrentPage(this.currentPage);
        return;
      }
      this.showNextPage();
    };
    this.handleNumberPage = (indexClick, numberPage) => {

      console.log(indexClick,'indexClick');
      console.log(numberPage,'numberPage');
      const count = Math.abs(indexClick - this.pivotButtonIndex);
      this.prevPage = this.currentPage;
      this.currentPage = numberPage;


      // Shift left if needed
      if (indexClick < this.pivotButtonIndex &&
        this.prevPage > this.currentPage) {
        for (let index = 0; index < count; index++) {
          this.showPrevPage();
        }
      }

      // Shift right if needed
      if (this.currentButtonValues.at(-1) >= this.totalPages) {
        this.showActiveCurrentPage(numberPage);
        return;
      }

      if (
        this.currentPage > this.pivotButtonValue &&
        this.currentPage > this.prevPage
      ) {


        for (let index = 0; index < count; index++) {
          if (this.currentButtonValues.at(-1) >= this.totalPages) {
            this.showActiveCurrentPage(this.currentPage);
            return;
          }
          this.showNextPage();
        }
      }

      this.showActiveCurrentPage(this.currentPage);
    };

    this.handleBackToTheStart = () => {
      this.resetToTheStart();
      document.dispatchEvent(this.createPageChangeEvent('start'));
    }




    // Event listeners
    this.btnBackToTheStart.addEventListener('click', this.handleBackToTheStart);
    this.btnNext.addEventListener("click", this.handleBtnNext);

    this.pageButtons.forEach((el, index) => {
      const handler = (e) => {
        this.handleNumberPage(index, +e.target.textContent);
        document.dispatchEvent(this.createPageChangeEvent('number'));

      };
      el.addEventListener('click', handler);
      this.buttonHandlers.push(handler);
    });
  }

  destroyListeners() {
    if (this.btnNext && this.handleBtnNext) {
      this.btnNext.removeEventListener('click', this.handleBtnNext);
    }

    if (this.btnBackToTheStart && this.handleBackToTheStart) {
      this.btnBackToTheStart.removeEventListener('click', this.handleBackToTheStart);
    }
    if (this.buttonHandlers[0]) {

      this.buttonHandlers.forEach((handler, index) => {
        this.pageButtons[index].removeEventListener('click', handler)
      });
      this.buttonHandlers = [];
    }
  }

  createPageChangeEvent(action) {
    return new CustomEvent('changePage', {
      detail: {
        page: this.currentPage,
        oldPage: this.prevPage,
        action: action,
        totalPages: this.totalPages
      }
    });
  }

  showActiveCurrentPage() {
    this.pageButtons.forEach((btn) => {
      const page = btn.textContent;
      if (+page === +this.currentPage) {
        btn.classList.add("active-page");
      } else {
        btn.classList.remove("active-page");
      }
    });
    this.toggleBtnNext();
    this.toggleBthGoToTheStart();
    this.toggleDots();
  }

  showNextPage() {
    if (!this.endPagination) {
      for (let i = 0; i < this.currentButtonValues.length; i++) {
        ++this.currentButtonValues[i];
        this.pageButtons[i].textContent = this.currentButtonValues[i];
      }
    }
    this.toggleDots();
    console.log(this.currentButtonValues);
  }

  showPrevPage() {
    if (this.currentButtonValues[0] === 1) return;
    for (let i = 0; i < this.currentButtonValues.length; i++) {
      --this.currentButtonValues[i];
      this.pageButtons[i].textContent = this.currentButtonValues[i];
    }
  }

  toggleBthGoToTheStart() {
    if (this.currentPage > this.pivotButtonValue) {
      this.btnBackToTheStart.removeAttribute("disabled");
    } else {
      this.btnBackToTheStart.setAttribute("disabled", true);
    }
  }

  toggleDots() {
    if (this.currentButtonValues.at(-1) === this.totalPages) {
      this.endPagination = true;
      this.dots.classList.add("hidden");
    } else {
      this.endPagination = false;
      this.dots.classList.remove("hidden");
    }
  }

  toggleBtnNext() {
    if (this.currentPage >= this.totalPages) {
      this.endPagination = true;
      this.btnNext.setAttribute("disabled", true);
    } else {
      this.endPagination = false;
      this.btnNext.removeAttribute("disabled", true);
    }
  }

  setNumberPage(number) {
    for (let page = 1; page <= number; page++) {
      this.handleNumberPage(this.currentButtonValues.indexOf(page), page);
    }
    
  }

  resetToTheStart() {
    for (let i = 0; i < this.currentButtonValues.length; i++) {
      this.pageButtons[i].textContent = i + 1
    }
    this.currentButtonValues = [...this.initialButtonValues];
    this.prevPage = this.currentPage
    this.currentPage = 1;
    this.showActiveCurrentPage(this.currentPage);
  }
}


// Usage
const $btnNext = document.querySelector(".next");
const $btnBackToTheStart = document.querySelector(".start-page");
const $pageButtons = document.querySelectorAll(".page-number");
const $dots = document.querySelector(".dots");


const pagination = new Pagination({
  $btnNext,
  $btnBackToTheStart,
  $pageButtons,
  $dots
})


pagination.initPagination(20, 3);
const urlSearchParams = new URLSearchParams(location.search)
const page = urlSearchParams.get('page');



document.addEventListener('changePage', (e) => {
  console.log(e.detail);
  urlSearchParams.set('page', e.detail.page);
  const url = `${window.location.pathname}?page=${urlSearchParams.get('page')}`;
  history.replaceState({}, '', url);
})


pagination.setNumberPage(+page || 1);
