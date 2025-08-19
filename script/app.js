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
        if (user) {
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

function renderExpenses(expenses) {
    //clear existing expenses
    expensesContainer.innerHTML = '';

    //filter expenses based on selected filters
    const categoryFilter = filterCategory.value;
    const monthFilter = filterMonth.value;

    let filteredExpenses = expenses;

    if (categoryFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter);
    }

    if (monthFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(exp => {
            const expenseDate = new Date(exp.date);
            return expenseDate.getMonth + 1 === parseInt(monthFilter);
        });
    }

    //sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredExpenses.forEach(expense => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        expenseElement.innerHTML = `
            <div class="expense-info">

                <div class="expense-icon ${expense.category}">
                    <i class="fas ${getCategoryIcon(expense.category)}"></i>
                </div>

                <div class="expense-details">
                    <h3>${expense.description}</h3>
                    <p>${formatDate(expense.date)} . 
                    ${expense.category.charAt(0).toUpperCase() +
            expense.category.slice(1)} </p>
                </div>
            </div>

            <div class="expense-amount">
            LKR ${parseFloat(expense.amount).toFixed(2)}</div>
            
            <div class="expense-action">
                <button class="edit-btn" data-id="${expense.id}">
                <i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${expense.id}">
                <i class="fas fa-trash"></i></button>
            </div>
        `;

        expensesContainer.appendChild(expenseElement);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const expenseId = e.currentTarget.getAttribute('data-id');
            updateExpense(expenseId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const expenseId = e.currentTarget.getAttribute('data-id');
            deleteExpense(expenseId);
        })
    })
}

function updateExpense(expenseId) {
    const userId = auth.currentUser.uid;

    database.ref('expenses/' + userId + '/' + expenseId).once('value')
        .then((snpashot) => {
            const expense = snpashot.val();

            //fill form with expense data
            document.getElementById('expense-amount').value = expense.amount;
            document.getElementById('expense-description').value = expense.description;
            document.getElementById('expense-category').value = expense.category;
            document.getElementById('expense-date').value = expense.date;

            const formButton = expenseForm.querySelector('button');
            formButton.textContent = 'Update Expense';

            //remove previous submit event listener
            expenseForm.replaceWith(expenseForm.cloneNode(true));
            document.getElementById('expense-form').addEventListener('submit', (e) => {
                e.preventDefault();

                const updatedAmount =
                    parseFloat(document.getElementById('expense-amount').value);
                const updatedDescription = document.getElementById('expense-description').value;
                const updatedCategory = document.getElementById('expense-category').value;
                const updatedDate = document.getElementById('expense-date').value;

                database.ref('expenses/' + userId + '/' + expenseId).update({
                    amount: updatedAmount,
                    description: updatedDescription,
                    category: updatedCategory,
                    date: updatedDate
                }).then(() => {
                    alert('ok');
                    expenseForm.reset();
                    formButton.textContent = 'Add Expense';
                    document.getElementById('expense-date').valueAsDate = new Date();
                })
                    .catch((error) => {
                        console.log(error.message);
                    });
            });
        });
}

function deleteExpense(expenseId) {
    if (confirm('Are you sure want to delete this expense?')) {
        const userId = auth.currentUser.uid;
        database.ref('expenses/' + userId + '/' + expenseId).remove()
            .then(() => {
                console.log('Expense deleted');
            })
            .catch((error) => {
                console.error("Error deleting expense: ", error);
            });
    }
}


//Helper function
function getCategoryIcon(category) {
    const icons = {
        food: 'fa-utensils',
        transport: 'fa-car',
        housing: 'fa-home',
        entertainment: 'fa-film',
        shopping: 'fa-shopping-bag',
        health: 'fa-user-md',
        other: 'fa-list'
    };
    return icons[category] || 'fa-list';
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}