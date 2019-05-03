// BUDGET COTROLLER
var budgetController = (function () {

  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };


  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };


  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };


  var calculateTotal = function (type) {
    var sum = 0;
    data.allItemes[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };



  var data = {
    allItemes: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // create new id
      if (data.allItemes[type].length > 0) {
        ID = data.allItemes[type][data.allItemes[type].length - 1].id + 1;
      } else {
        ID = 0;
      }


      // create new item base on 'income' or 'exp'
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      };


      //push item to the arrays data structure
      data.allItemes[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var index;

      // id = 6
      //data.allItems[type][id];
      // ids = [1 2 4  8]
      //index = 3


      // pick up the current id 
      var ids = data.allItemes[type].map(function (current) {
        return current.id;
      });

      //current id pf index
      index = ids.indexOf(id);

      /*first it will pick index what we want to delet 
      2nd argument will how many item you want to delet so we want delet 1 
        */
      if (index !== -1) {
        data.allItemes[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // 1. calculate total income and budget
      calculateTotal('exp');
      calculateTotal('inc');


      // 2. calculate budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;


      // 3.calculate the persentage of income we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentage: function () {
      /*
       a=20
       b=10
       c=40
       income = 100
       a=20/100=20%
       b=10/100=10%
       c=40/100=40%
        */

      data.allItemes.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function () {
      var allper = data.allItemes.exp.map(function (cur) {
        return cur.getPercentage();
      });

      return allper;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalinc: data.totals.inc,
        totalexp: data.totals.exp,
        percentage: data.percentage
      }
    },

    test: function () {
      console.log(data);
    }
  };
})();


// UI controller
var UIController = (function () {
  //dom classes obj
  var DOMStrings = {
    type: ".add__type",
    description: ".add__description",
    value: ".add__value",
    input: ".add__btn",
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expPercLabel: '.item__percentage',
    getMoth: '.budget__title--month'
  };

  var fromatNumer = function (num, type) {
    var type, int, dec, numSplit;
    /*
     + or - befor number 
     exacly 2 decimal points 
     comma seprating the thousends

     2310.4567 => + 2,310.46
     2000  => 2,000.00
    */
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMStrings.type).value, // will be either increament or decreament
        description: document.querySelector(DOMStrings.description).value,
        value: parseFloat(document.querySelector(DOMStrings.value).value)
      };
    },


    addListItem: function (obj, type) {
      var html, newHtml, element;
      //crete html string with place holder


      if (type === 'inc') {
        element = DOMStrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div> </div>';
      } else if (type === 'exp') {
        element = DOMStrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div></div>';
      }

      // replace placeholder text with acual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', fromatNumer(obj.value, type));

      // insert html into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice */
      var fieldsArr, fields;

      // retrun this fields(description, SomeValue) 
      fields = document.querySelectorAll(DOMStrings.description + ', ' + DOMStrings.value);

      //conver list to an array => return fieldsArr = [descritopn, SomeValue];
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, value) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },


    displayBudget: function (obj) {
      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';
      document.querySelector(DOMStrings.budgetLabel).textContent = fromatNumer(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = fromatNumer(obj.totalinc, 'inc');
      document.querySelector(DOMStrings.expensesLabel).textContent = fromatNumer(obj.totalexp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }

    },

    displayPercentages: function (percentages) {

      var fields = document.querySelectorAll(DOMStrings.expPercLabel);


      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else if (percentages[index] < 0) {
          current.textContent = '---';
        }
      });

    },

    displayMonth: function () {
      var now, day, days, months, month, year;
      now = new Date();

      day = now.getDay();
      days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      months = ['January', 'Fabruary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.getMoth).textContent = months[month] + ' ' + days[day] + ' ' + year;
    },

    changeType: function () {
      var fields = document.querySelectorAll(
        DOMStrings.type + ',' +
        DOMStrings.description + ',' +
        DOMStrings.value
      );

      nodeListForEach(fields, function (current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.input).classList.toggle('red');

    },


    getDomStrings: function () {
      return DOMStrings;
    }
  };
})();



// global Controller
var controller = (function (budgetCtrl, UICtrl) {

  // all event lisenr goses here

  var setUpeventLisner = function () {
    var DOM = UICtrl.getDomStrings();

    document.querySelector(DOM.input).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.type).addEventListener('change', UICtrl.changeType);
  };


  var updateBudget = function () {

    // 1. calculate the buget
    budgetCtrl.calculateBudget();

    // 2. return budget
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the ui 
    UICtrl.displayBudget(budget);
  };

  var updatePercentage = function () {
    // 1. calculate percentages
    budgetCtrl.calculatePercentage();
    // 2. return budget 
    var percentage = budgetCtrl.getPercentage();
    // 3. Display the budget to the ui
    UICtrl.displayPercentages(percentage);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    // 1. get the filed input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      // 2. add item to the buget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. add item to the ui
      UICtrl.addListItem(newItem, input.type);

      // 4. clearing the input fields
      UICtrl.clearFields();

      // 5. Calculate budget and update
      updateBudget();

      // 6. update percentage 
      updatePercentage();
    }

  };

  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {

      //inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update percentages
      updatePercentage();
    };

  };


  // we care calling EVENTS from out side bc of clousers
  return {
    init: function () {
      console.log("Aplication running");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalinc: 0,
        totalexp: 0,
        percentage: -1
      });
      setUpeventLisner();
    }
  };

})(budgetController, UIController);

controller.init();