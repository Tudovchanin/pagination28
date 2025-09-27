
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


  // Handlers
  handleBtnNext
  handleNumberPage

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


    // Event listeners
    this.btnBackToTheStart.addEventListener('click', () => {
      this.resetToTheStart();
    });
    this.btnNext.addEventListener("click", this.handleBtnNext);

    this.pageButtons.forEach((el, index) => {
      el.addEventListener('click', (e) => {
        this.handleNumberPage(index, +e.target.textContent);
      })
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
      console.log('showNextPage');
      for (let i = 0; i < this.currentButtonValues.length; i++) {
        ++this.currentButtonValues[i];
        this.pageButtons[i].textContent = this.currentButtonValues[i];
      }
    }
    this.toggleDots();
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
    this.handleNumberPage(this.currentButtonValues.indexOf(number), number);
    this.currentPage = number;
    this.prevPage = this.currentPage - 1
  }

  resetToTheStart() {
    for (let i = 0; i < this.currentButtonValues.length; i++) {
      this.pageButtons[i].textContent = i + 1
    }
    this.currentButtonValues = [...this.initialButtonValues];
    this.currentPage = 1;
    this.prevPage = 1;
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
pagination.setNumberPage(1)