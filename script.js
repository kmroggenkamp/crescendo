$(document).ready(function(){

	var errorPage = function(){
		console.log("errorPage");
		$("#recipeHeading").addClass("hidden");
		$("#ingredientsSection").html("<h3>Oops!  We're Sorry!!" 
				+ "</h3><p>We seem to be experiencing issues. " 
				+ "<a href='index.html'>Please try again later.</a></p>");
		$("#directionsSection").addClass("hidden");
	}

	// assumes recipes.length is valid, calls specials api if needed
	var processRecipeList = function(){
		console.log("processRecipeList");

		if(recipes.length <= 0) {
			errorPage();
			return;
		} else if( recipes.length > 1) {
			var recList = "<h2>Recipes</h2><section>";
			for(var i=0; i < recipes.length; i++) {
				recList += "<h3 onclick='displayRecipe(" + i + ")'>" 
						+ "<img src=public" + recipes[i].images.small + ">"
						+ recipes[i].title + "</h3>";
			}
			recList += "</section>";
			$("#recipeList").html(recList);
		}

		if(specials) {
			defaultRecipes();
		} else {
			$.getJSON('http://localhost:3001/specials', function(specData) {
				specials = specData;
				sessionStorage.setItem("specials", JSON.stringify(specData));
			})
			.fail(function() {
				specials = [];
				console.log("specials api failed");
			})
			.always(function() {
				defaultRecipes();
			});	
		}
	}

	// only called if recipes.length >= 1 && specials.length is valid 
	var defaultRecipes = function(){
		console.log("defaultRecipes");
		if(!famousInd || !parseInt(famousInd) || famousInd < 0 || famousInd >= recipes.length) {
			famousInd = 0;
		}
		if(!secretInd || !parseInt(secretInd) || secretInd <= 0 || secretInd >= recipes.length) {
			secretInd = recipes.length - 1;
		} 
		
		var famDishStr = "Home of the world famous <a onclick='famousRecipe()'>"
				+ recipes[famousInd].title + "!!</a>";
		$("#famousDish").html(famDishStr);

		if(secretInd) {
			var secDishStr = " and try our <a onclick='secretRecipe()'>" 
					+ recipes[secretInd].title + "</a>";
			$("#secretDish").html(secDishStr);
		}

		displayRecipe(famousInd);
	}

	var specialIngredientHtml = function(param){
		console.log("specialIngredientHtml", param);
		var found = false;
		var specHtml = "";
		for(var i=0; !found && i < specials.length ; i++){
			found = param == specials[i].ingredientId;
			if(found){
				specHtml += "<li><b>* " 
						+ specials[i].title + "</b>"
						+ specials[i].text +	"</li>";
			}
		}
		return found ? specHtml : false;
	}

	// only called if ind is valid
	displayRecipe = function(ind) {
		console.log("displayRecipe", ind);
		var recInd = ind;
		
		$("#recipeTitle").text(recipes[recInd].title);
		$("#recipeImage").attr("src", "public" + recipes[recInd].images.medium);
		$("#recipeDescription").text(recipes[recInd].description);

		recDetStr = "<li>servings: " + recipes[recInd].servings
				+ "</li><li>recipe edited: " + new Date(recipes[recInd].editDate).toDateString()
				+ "</li><li>preparation time: " + recipes[recInd].prepTime
				+ "</li><li>cook time: " + recipes[recInd].cookTime
				+ "</li>";
		$("#recipeDetails").html(recDetStr);

		var ingUl = "", specUl = "";
		for(var i=0; i < recipes[recInd].ingredients.length; i++){
			var specHtml = specialIngredientHtml(recipes[recInd].ingredients[i].uuid);
			specUl += specHtml ? specHtml : "";
			// console.log(specHtml, recipes[recInd].ingredients[i].name);

			ingUl += "<li" + (specHtml ? " class='special'>* " : ">") 
					+ recipes[recInd].ingredients[i].amount + " "
					+ recipes[recInd].ingredients[i].measurement + " "
					+ recipes[recInd].ingredients[i].name + " "
					+ "</li>";
		}
		// console.log(ingUl);

		$("#recipeIngredients").html(ingUl);
		$("#recipeSpecials").html(specUl);

		var dirOl = "";
		for (var i=0; i < recipes[recInd].directions.length; i++){
			dirOl += "<li" 
					+ (recipes[recInd].directions[i].optional ? " class='optional'>" : ">") 
					+ recipes[recInd].directions[i].instructions + "</li>";
		}
		$("#recipeDirections").html(dirOl);
	}

	famousRecipe = function(){
		console.log("famousRecipe");
		displayRecipe(famousInd);
	}
	secretRecipe = function(){
		console.log("secretRecipe");
		displayRecipe(secretInd);
	}

	var famousInd = sessionStorage.getItem("famousInd");
	var secretInd = sessionStorage.getItem("secretInd");
	var recipes = JSON.parse(sessionStorage.getItem("recipes"))
	var specials = JSON.parse(sessionStorage.getItem("specials"));

	if(recipes){
		processRecipeList();
	} else {
		$.getJSON('http://localhost:3001/recipes', function(recData) {
			recipes = recData;
			// recipes = [recData[0]];
			sessionStorage.setItem("recipes", JSON.stringify(recData));
		})
		.fail(function() {
			recipes = [];
			console.log("recipes api failed");
		})
		.always(function() {
			processRecipeList();
		});
	}
});
