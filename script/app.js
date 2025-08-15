// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expensesContainer = document.getElementById('expenses-container');
const totalAmountElement = document.getElementById('total-amount');
const monthlyAmountElement = document.getElementById('monthly-amount');
const topCategoryElement = document.getElementById('top-category');
const filterCategory = document.getElementById('filter-category');
const filterMonth = document.getElementById('filter-month');

let expenseChart;

//initialize the app when DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('expense-date').valueAsDate = new Date();

    //load expenses when user is logged in
    auth.onAuthStateChanged((user) => {
        if(user){
            loadExpenses();
        }
    });
});

//Add new expense
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById('expense-amount').value);
    const description = document.getElementById('expense-description').value;
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;

    if (!amount || !description || !category || !date) {
        alert('Please fill all fields');
        return;
    }

    const userId = auth.currentUser.uid;
    const newExpenseRef = database.ref('expenses/' + userId).push();

    newExpenseRef.set({
        amount: amount,
        description: description,
        category: category,
        date: date
    })
        .then(() => {
            //clear form
            expenseForm.reset();
            document.getElementById('expense-date').valueAsDate = new Date();
        })
        .catch((error) => {
            console.error('Error in adding expense: ', error);
        });

});

//Load expenses from firebase
function loadExpenses() {
    const userId = auth.currentUser.uid;
    database.ref('expenses/' + userId).on('value', (snpashot) => {
        const expenses = [];
        snpashot.forEach((childSnapshot) => {
            expenses.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });

        renderExpenses(expenses);
    });
}

function renderExpenses(expenses){}