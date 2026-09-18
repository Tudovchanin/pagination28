export type ArgsPagination = {
  $btnNext: HTMLElement | null;
  $btnBackToTheStart: HTMLElement;
  $pageButtons: NodeListOf<HTMLElement> | HTMLElement[];
  $dots: HTMLElement;
};
export type PaginationAction = "next" | "start" | "number";

export type PaginationEvent = {
    page: number;
    oldPage: number;
    action: PaginationAction;
    totalPages: number;
}

export class Pagination {
  // DOM Elements
  btnNext;
  btnBackToTheStart;
  pageButtons;
  dots;

  // State
  pivotButtonIndex = 0;
  pivotButtonValue = 1;
  totalPages = 1;
  initialButtonValues: number[] = [];
  currentButtonValues: number[] = [];

  currentPage = 1;
  prevPage = 1;
  endPagination = false;

  // Event
  changePageEvent?: CustomEvent<PaginationEvent>;

  // HandlershandleBtnNext
  handleBtnNext?: () => void;
  handleNumberPage?: (indexClick: number, numberPage: number) => void;
  handleBackToTheStart?: () => void;
  buttonHandlers: ((e: Event) => void)[] = [];

  constructor({ $btnNext = null, $btnBackToTheStart, $pageButtons, $dots }: ArgsPagination) {
    this.btnNext = $btnNext;
    this.btnBackToTheStart = $btnBackToTheStart;
    this.pageButtons = $pageButtons;
    this.dots = $dots;
  }

  initPagination(totalPages: number, pivotIndex: number) {
    // Инициализация значений кнопок ui и наполнение текущего состояния currentButtonValues
    this.pageButtons.forEach((btn, index) => {
      btn.textContent = `${index + 1}`;
      this.currentButtonValues.push(index + 1);
    });

    this.initialButtonValues = [...this.currentButtonValues];
    this.totalPages = totalPages;
    this.pivotButtonIndex = pivotIndex;

    const targetButton = this.pageButtons[this.pivotButtonIndex];

    if (!targetButton) {
      throw new Error(`[Pagination Error]: Кнопка по индексу ${this.pivotButtonIndex} не найдена в DOM!`);
    }

    this.pivotButtonValue = Number(targetButton.textContent);

    // Обработчики
    if (this.btnNext) {
      console.log(this.btnNext);

      console.log(this.currentPage, this.totalPages);

      this.handleBtnNext = () => {
        if (this.currentPage >= this.totalPages) return;

        this.prevPage = this.currentPage;
        ++this.currentPage;
        document.dispatchEvent(this.createPageChangeEvent("next"));
        this.toggleBthGoToTheStart();

        const currentLastValue = this.currentButtonValues.at(-1) ?? 0;

        // Если последняя страница или значение равно или меньше pivot значения то переключаем страницу без смещения значений
        if (this.currentPage <= this.pivotButtonValue || currentLastValue === this.totalPages) {
          this.showActiveCurrentPage();
          return;
        }

        this.showNextPage();
      };
    }
    this.handleBackToTheStart = () => {
      this.resetToTheStart();
      document.dispatchEvent(this.createPageChangeEvent("start"));
    };
    this.handleNumberPage = (indexClick, numberPage) => {
      const count = Math.abs(indexClick - this.pivotButtonIndex);

      this.prevPage = this.currentPage;
      this.currentPage = numberPage;

      // Прокрутка ленты кнопок ВПРАВО (в сторону меньших чисел), если кликнули левее опорной точки(pivot)
      if (indexClick < this.pivotButtonIndex && this.prevPage > this.currentPage) {
        for (let index = 0; index < count; index++) {
          this.showPrevPage();
        }
      }

      if ((this.currentButtonValues.at(-1) ?? 0) >= this.totalPages) {
        this.showActiveCurrentPage();
        return;
      }

      // Прокрутка ленты кнопок ВЛЕВО (в сторону больших чисел), если кликнули правее опорной точки(pivot)
      if (this.currentPage > this.pivotButtonValue && this.currentPage > this.prevPage) {
        for (let index = 0; index < count; index++) {
          if ((this.currentButtonValues.at(-1) ?? 0) >= this.totalPages) {
            this.showActiveCurrentPage();
            return;
          }
          this.showNextPage();
        }
      }

      this.showActiveCurrentPage();
    };

    
    // Event listeners
    this.btnBackToTheStart.addEventListener("click", this.handleBackToTheStart);

    if (this.btnNext && this.handleBtnNext) {
      this.btnNext.addEventListener("click", this.handleBtnNext); 
    }

    this.pageButtons.forEach((el, index) => {
      const handler = (e: Event) => {
        const target = e.currentTarget as HTMLElement;
        // Если обработчик забыли инициализировать — бросаем понятное исключение
        if (!this.handleNumberPage) {
          throw new Error(
            "[Pagination Error]: Метод handleNumberPage не был инициализирован. Вызовите initPagination() перед кликом.",
          );
        }

        this.handleNumberPage(index, +target.textContent);
        document.dispatchEvent(this.createPageChangeEvent("number"));
      };
      el.addEventListener("click", handler);
      this.buttonHandlers.push(handler);
    });
  }

  destroyListeners() {
    if (this.btnNext && this.handleBtnNext) {
      this.btnNext.removeEventListener("click", this.handleBtnNext);
    }

    if (this.btnBackToTheStart && this.handleBackToTheStart) {
      this.btnBackToTheStart.removeEventListener("click", this.handleBackToTheStart);
    }
    if (this.buttonHandlers[0]) {
      this.buttonHandlers.forEach((handler, index) => {
        this.pageButtons[index]?.removeEventListener("click", handler);
      });
      this.buttonHandlers = [];
    }
  }

  createPageChangeEvent(action: PaginationAction) {
    return new CustomEvent("changePage", {
      detail: {
        page: this.currentPage,
        oldPage: this.prevPage,
        action: action,
        totalPages: this.totalPages,
      },
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
    if (this.btnNext) {
      this.toggleBtnNext();
    }
    this.toggleBthGoToTheStart();
    this.toggleDots();
  }

  showNextPage() {
    if (!this.endPagination) {
      for (let i = 0; i < this.currentButtonValues.length; i++) {
        ++this.currentButtonValues[i]!;
        this.pageButtons[i]!.textContent = String(this.currentButtonValues[i]);
      }
    }
    this.toggleDots();
  }

  showPrevPage() {
    if (this.currentButtonValues[0] === 1) return;
    for (let i = 0; i < this.currentButtonValues.length; i++) {
      --this.currentButtonValues[i]!;
      this.pageButtons[i]!.textContent = String(this.currentButtonValues[i]);
    }
  }

  toggleBthGoToTheStart() {
    if (this.currentPage > this.pivotButtonValue) {
      this.btnBackToTheStart.removeAttribute("disabled");
    } else {
      this.btnBackToTheStart.setAttribute("disabled", "true");
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
    if (!this.btnNext) {
      throw new Error(
        "[Pagination Error]: Метод toggleBtnNext вызван, но кнопка btnNext не была передана в конструктор!",
      );
    }
    if (this.currentPage >= this.totalPages) {
      this.endPagination = true;
      this.btnNext.setAttribute("disabled", "true");
    } else {
      this.endPagination = false;
      this.btnNext.removeAttribute("disabled");
    }
  }

  setNumberPage(number: number) {
    if (!this.handleNumberPage) {
      throw new Error(
        `[Pagination Error]: Невозможно вызвать setNumberPage(${number}). Метод handleNumberPage не инициализирован. Сначала вызовите initPagination().`,
      );
    }
    // сдвинет или переключит number итераций
    for (let page = 1; page <= number; page++) {
      this.handleNumberPage(this.currentButtonValues.indexOf(page), page);
    }
  }

  resetToTheStart() {
    for (let i = 0; i < this.currentButtonValues.length; i++) {
      this.pageButtons[i]!.textContent = `${i + 1}`;
    }
    this.currentButtonValues = [...this.initialButtonValues];
    this.prevPage = this.currentPage;
    this.currentPage = 1;
    this.showActiveCurrentPage();
  }
}
