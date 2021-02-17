var tableNumber = null;
var db = firebase.firestore();

AFRAME.registerComponent("markerhandler", {
  init: async function() {
    if (tableNumber === null) {
      this.askTableNumber();
    }

    var dishes = await this.getAllDishes();

    this.el.addEventListener("markerFound", () => {
      dishes.map(dish => {
        if (dish.id === this.el.id) {
          // Getting todays day
          var todaysDate = new Date();
          var todaysDay = todaysDate.getDay();
          // Sunday - Saturday : 0 - 6
          var days = [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday"
          ];
          // Checking dish availablity on day
          if (dish.unavailable_days.includes(days[todaysDay])) {
            swal({
              type: "warning",
              title: "Sorry",
              text: "This dish is not available today!!!",
              timer: 2500,
              showConfirmButton: false
            });
          } else {
            var model = document.querySelector(`#model-${dish.id}`);
            model.setAttribute("position", dish.model_geometry.position);
            model.setAttribute("rotation", dish.model_geometry.rotation);
            model.setAttribute("scale", dish.model_geometry.scale);

            this.handleMarkerFound(dish, this.el.id, tableNumber);
          }
        }
      });
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askTableNumber: function() {
    var imageUrl =
      "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";

    swal(
      {
        title: "Welcome to Hunger!!",
        imageUrl: imageUrl,
        type: "input",
        inputPlaceholder: "Type your table number"
      },
      function(inputValue) {
        tableNumber = inputValue;
      }
    );
  },
  getAllDishes: async function() {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerFound: function(dish, id, tableNumber) {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "flex";

    var ratingButton = document.getElementById("rating-button");
    var orderButtton = document.getElementById("order-button");

    // Handling Click Events
    ratingButton.addEventListener("click", function() {});

    orderButtton.addEventListener("click", () => {
      var tNumber;
      tableNumber <= 9 ? (tNumber = `T0${tableNumber}`) : `T${tableNumber}`;
      this.handleOrder(tNumber, dish);
      swal({
        title: "Thanks For Order !",
        text: "Your order will serve soon on your table!",
        imageUrl: "https://i.imgur.com/4NZ6uLY.jpg",
        timer: 2000,
        showConfirmButton: false
      });
    });
  },
  handleOrder: function(tNumber, dish) {
    // Reading currnt table order details
    db.collection("tables")
      .doc(tNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][dish.id]) {
          details["current_orders"][dish.id]["quantity"] += 1;
        } else {
          details["current_orders"][dish.id] = {
            dish_name: dish.dish_name,
            price: dish.price,
            quantity: firebase.firestore.FieldValue.increment(1)
          };
        }

        details.total_bill = firebase.firestore.FieldValue.increment(
          dish.price
        );

        // Updating Db
        db.collection("tables")
          .doc(doc.id)
          .update(details);
      });
  },
  handleMarkerLost: function() {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
