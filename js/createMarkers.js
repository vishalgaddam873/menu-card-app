AFRAME.registerComponent("create-markers", {
  init: async function() {
    var mainScene = document.querySelector("#main-scene");
    var dishes = await this.getAllDishes();

    dishes.map(item => {
      var markerEl = document.createElement("a-marker");
      markerEl.setAttribute("id", item.id);
      markerEl.setAttribute("type", "pattern");
      markerEl.setAttribute("url", item.marker_pattern_url);
      markerEl.setAttribute("cursor", {
        rayOrigin: "mouse"
      });
      markerEl.setAttribute("markerhandler", {});

      mainScene.appendChild(markerEl);

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
      if (!item.unavailable_days.includes(days[todaysDay])) {
        var modelEl = document.createElement("a-entity");
        modelEl.setAttribute("id", `model-${item.id}`);
        modelEl.setAttribute("position", item.position);
        modelEl.setAttribute("rotation", item.rotation);
        modelEl.setAttribute("scale", item.scale);
        modelEl.setAttribute("gltf-model", `url(${item.model_url})`);
        modelEl.setAttribute("gesture-handler", {});

        var modelTitleEl = document.createElement("a-entity");
        modelTitleEl.setAttribute("id", `model-title-${item.id}`);
        modelTitleEl.setAttribute("position", { x: 2.5, y: 0, z: -1.1 });
        modelTitleEl.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        modelTitleEl.setAttribute("text", {
          color: "#EF2D5E",
          align: "left",
          width: 5,
          font: "monoid",
          value: item.dish_name
        });

        var ingredientsTitleEl = document.createElement("a-entity");
        ingredientsTitleEl.setAttribute("id", `ingredients-title-${item.id}`);
        ingredientsTitleEl.setAttribute("position", { x: 2, y: 0, z: -0.8 });
        ingredientsTitleEl.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        ingredientsTitleEl.setAttribute("text", {
          color: "#ef9a9a",
          align: "left",
          width: 4,
          font: "monoid",
          value: "INGRADIENTS:"
        });

        var ingredientsEl = document.createElement("a-entity");
        ingredientsEl.setAttribute("id", `ingredients-${item.id}`);
        ingredientsEl.setAttribute("position", { x: 2, y: 0, z: 0.2 });
        ingredientsEl.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        ingredientsEl.setAttribute("text", {
          color: "#ffa726",
          align: "left",
          width: 4,
          font: "monoid",
          value: `${item.ingredients.join("\n")}\n\nPrice: ₹${item.price}`
        });

        markerEl.appendChild(modelEl);
        markerEl.appendChild(modelTitleEl);
        markerEl.appendChild(ingredientsTitleEl);
        markerEl.appendChild(ingredientsEl);
      }
    });
  },
  getAllDishes: async function() {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  }
});
