export default class BudgetTracker {
  constructor(querySelectorString) {
    this.root = document.querySelector(querySelectorString);
    this.root.innerHTML = BudgetTracker.html();

    this.root.querySelector(".new-entry").addEventListener("click", () => {
      this.onNewEntryBtnClick();
    });

    // Load initial data from Local Storage
    this.load();
  }
  // We can write HTML code inside js by using ` HTML code here..... `

  static html() {
    return `
            <table class="budget-tracker">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody class="entries"></tbody>
                <tbody>
                    <tr>
                        <td colspan="5" class="controls">
                            <button type="button" class="new-entry">New Entry</button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" class="summary">
                            <strong>Total:</strong>
                            <span class="total">$0.00</span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `;
  }

  static entryHtml() {
    return `
            <tr>
                <td>
                    <input class="input input-date" type="date">
                </td>
                <td>
                    <input class="input input-description" type="text" placeholder="Add a Description (e.g. wages, bills, etc.)">
                </td>
                <td>
                    <select class="input input-type">
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="input input-amount">
                </td>
                <td>
                    <button type="button" class="delete-entry">&#10005;</button>
                </td>
            </tr>
        `;
  }

  load() {
    const entries = JSON.parse(
      localStorage.getItem("budget-tracker-entries-dev") || "[]"
    );

    /*

   for (const entry of entries) {
      this.addEntry(entry);
    }

    CLEAN CODE USING MAP FUNCTION 
      */

    entries.map((entry) => {
      this.addEntry(entry);
    });

    this.updateSummary();
  }

  // .reduce is an array method, that take an array as and extract the
  // SINGLE value from the so many field and parameter

  updateSummary() {
    const total = this.getEntryRows().reduce((total, row) => {
      const amount = row.querySelector(".input-amount").value;
      const isExpense = row.querySelector(".input-type").value === "expense"; // type checking weather value is isExpense or NOT
      const modifier = isExpense ? -1 : 1; // Turnary to check either to add or sub

      return total + amount * modifier; // Decide the value to be positive or negative
    }, 0);

    const totalFormatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(total);

    this.root.querySelector(".total").textContent = totalFormatted; //Stored value will rendered in textContent
  }

  save() {
    const data = this.getEntryRows().map((row) => {
      return {
        date: row.querySelector(".input-date").value,
        description: row.querySelector(".input-description").value,
        type: row.querySelector(".input-type").value,
        amount: parseFloat(row.querySelector(".input-amount").value),
      };
    });

    localStorage.setItem("budget-tracker-entries-dev", JSON.stringify(data));
    this.updateSummary();
    //Update summary each time after applying SAVE
  }

  addEntry(entry = {}) {
    this.root
      .querySelector(".entries")
      .insertAdjacentHTML("beforeend", BudgetTracker.entryHtml());

    const row = this.root.querySelector(".entries tr:last-of-type");

    row.querySelector(".input-date").value =
      entry.date || new Date().toISOString().replace(/T.*/, "");
    row.querySelector(".input-description").value = entry.description || "";
    row.querySelector(".input-type").value = entry.type || "income";
    row.querySelector(".input-amount").value = entry.amount || 0;
    row.querySelector(".delete-entry").addEventListener("click", (e) => {
      this.onDeleteEntryBtnClick(e);
    });

    row.querySelectorAll(".input").forEach((input) => {
      input.addEventListener("change", () => this.save());
    });
  }

  getEntryRows() {
    return Array.from(this.root.querySelectorAll(".entries tr"));
  }

  onNewEntryBtnClick() {
    this.addEntry();
  }

  onDeleteEntryBtnClick(e) {
    e.target.closest("tr").remove();
    this.save();
    //After removing the tr parent, only AFTER saving we can see the changes
  }
}
