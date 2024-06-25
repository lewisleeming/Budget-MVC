'use strict'

const otherInput = document.getElementById("other");
const dropbox = document.getElementById("dropbox");
const dropboxOther = document.getElementById("other");

function checkvalue(value) {
   if (value === "others") {
       otherInput.style.display = "block";
       otherInput.required = true;
       otherInput.name = "category";  // Set the name to "category" when visible
   } else {
       otherInput.style.display = "none";
       otherInput.required = false;
       otherInput.name = "";  // Remove the name attribute when hidden
   }
}

function validateForm() {
   const selectCategory = dropbox.value;
   const otherCategory = dropboxOther.value;

   if (selectCategory === "others" && otherCategory.trim() === "") {
       alert("Please provide a category for 'others'.");
       return false;
   }

   // If "others" is not selected, set the dropdown value as the category
   if (selectCategory !== "others") {
       document.getElementById("dropbox").name = "category";
   }
   return true;
}

function deleteIncome(incomeId) {
    fetch(`/incomes/${incomeId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 204) {
            window.location.reload();
        } else {
            console.error('Failed to delete income', response);
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });
}

function deleteExpense(expenseId) {
    fetch(`/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status === 204) {
            window.location.reload();
        } else {
            console.error('Failed to delete expense', response);
        }
    })
    .catch(err => {
        console.error('Error:', err);
    });
}