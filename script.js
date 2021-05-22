function init() {
	plot = 1;
	lemons = 14;
	money = 0;
	saplings = 0;
	trees = 0;
	keep_selling = false;
	currently_selling = false;
	trees_growing = false;
	console.log("Hi! What are you doing in the console?\n" +
	    "Thinking of cheating a bit? ...that's fine, I guess. Should be easy too.\n" +
	    "Could just go 'lemons = lemons + 1000' and stuff.\n\n" +
	    "This is a fully free game that tries to respect your time though, so maybe try it the regular way first? 😘"
    );

	lemonade_price = 1;
	lemon_price = 5;
	lemon_amount = 10;
	sapling_price = 25;
	lemon_rate_per_tree = 0.2;

	update();
}

function sell_lemonade() {
	lemons--;
	keep_selling = document.getElementById("keep_selling_lemonade").checked;
	document.getElementById("sell_lemonade_button").disabled = true;
	currently_selling = true;
	lemon_progress = 0;
	interval_selling_lemonade = setInterval(function () {
		document.getElementById("sell_lemonade_progress").value = lemon_progress;
		lemon_progress++;
		if (lemon_progress > 100) {
			lemon_progress = 0;
			money += lemonade_price;
			document.getElementById("sell_lemonade_progress").value = lemon_progress;
			keep_selling = document.getElementById("keep_selling_lemonade").checked;
			if (keep_selling && lemons > 0) {
				lemons--;
			} else {
				clearInterval(interval_selling_lemonade);
				currently_selling = false;
			}
			update();
		}
	}, 10)
	update();
}

function buy_lemons() {
	lemons += lemon_amount;
	money -= lemon_price;
	update();
}

function buy_sapling() {
	saplings ++;
	money -= sapling_price;
	document.getElementById("sapling_progress").hidden = false;
	update();
	if (trees_growing)
		return;
	tree_progress = 0;
	growing_tree = setInterval(function () {
	trees_growing = true;
		document.getElementById("sapling_progress").value = tree_progress;
		tree_progress++;
		if (tree_progress > 1000) {
			tree_progress = 0;
			trees++;
			if (trees == 1)
				start_lemon_growth();
			saplings--;
			document.getElementById("sapling_progress").value = tree_progress;
			if (saplings == 0) {
				trees_growing = false;
				document.getElementById("sapling_progress").hidden = true;
				clearInterval(growing_tree);
			}
			update();
		}
	}, 10)
}

function start_lemon_growth() {
	setTimeout(function (){
		lemons++;
		update();
		start_lemon_growth();
	}, 1000/(trees*lemon_rate_per_tree));
}

function update() {
    check_plot();
	document.getElementById("lemons_counter").innerHTML = (lemons > 0) ? "Lemons: " + lemons + "🍋" : "";
	document.getElementById("money_counter").innerHTML = (money > 0) ? "Money: " + money + "💶" : "";
	document.getElementById("sapling_counter").innerHTML = (saplings > 0) ? "Saplings: " + saplings + "🌱" : "";
	document.getElementById("tree_counter").innerHTML = (trees > 0) ? "Lemon Trees: " + trees + "🌳 (+" + (lemon_rate_per_tree * trees).toFixed(2) + "🍋/s)" : "";
	keep_selling = document.getElementById("keep_selling_lemonade").checked;
	if (currently_selling == false) {
		document.getElementById("sell_lemonade_button").disabled = lemons <= 0;
	}
	document.getElementById("buy_lemons_button").disabled = money < lemon_price;
	document.getElementById("buy_sapling_button").disabled = money < sapling_price;
}

function check_plot() {
    switch (plot) {
        case 1:
            // First post
            document.getElementById("plot1").style.display = "inline"
            setTimeout(function () {
                plot = 2;
                next_sale = null;
                update();
            }, 1500);
            break;
        case 2:
            // First interest
            document.getElementById("plot2").style.display = "inline";
            if (next_sale !== null) {break;}
            current_lemons = lemons;
            // Check if first sale happened
            next_sale = setInterval(function () {
                if (lemons == current_lemons) {return;}
                plot = 3;
                clearInterval(next_sale)
                update();
            }, 4000)
            break;
        case 3:
            // Respond to first sale
            document.getElementById("plot3").style.display = "inline";
            setTimeout(function () {
                            plot = 4;
                            update();
                        }, 2500);
            break;
        case 4:
            // Thank you for first sale
            document.getElementById("plot4").style.display = "inline";
            lemon_checker = null;
            setTimeout(function () {
                            if (plot == 4) {plot = 5;}
                            update();
                        }, 2500);
            break;
        case 5:
            // Timed further interest
            document.getElementById("plot5").style.display = "inline";
            if (lemon_checker !== null) {break;}
            // Set up a check for running out of lemons
            lemon_checker = setInterval(function () {
                if (lemons == 0) {
                    if (plot == 5) {plot = 6;}
                    clearInterval(lemon_checker)
                    lemon_checker = null;
                    update();
                }
            }, 100);
            break;
        case 6:
            // Run out of lemons
            document.getElementById("plot6").style.display = "inline";
            document.getElementById("buy_lemons_button").hidden = false;
            if (lemon_checker !== null) {break;}
            // Next check if lemons have been refilled
            lemon_checker = setInterval(function () {
                if (lemons > 0) {
                    plot = 7;
                    clearInterval(lemon_checker)
                    update();
                }
            }, 100);
            break;
        case 7:
            // Lemons back in stock
            document.getElementById("plot7").style.display = "inline";
            setTimeout(function () {
                            plot = 8;
                            update();
                        }, 2500);
            break;
        case 8:
            // Store-owner responds
            document.getElementById("plot8").style.display = "inline";
            setTimeout(function () {
                            plot = 9;
                            update();
                        }, 3500);
            break;
        case 9:
            // Another random response
            document.getElementById("plot9").style.display = "inline";
            setTimeout(function () {
                            plot = 10;
                            update();
                        }, 3500);
            break;
        case 10:
            // Conversation about saplings (1/7)
            document.getElementById("plot10").style.display = "inline";
            setTimeout(function () {
                            plot = 11;
                            update();
                        }, 3500);
            break;
        case 11:
            // Conversation about saplings (2/7)
            document.getElementById("plot11").style.display = "inline";
            setTimeout(function () {
                            plot = 12;
                            update();
                        }, 3500);
            break;
        case 12:
            // Conversation about saplings (3/7)
            document.getElementById("plot12").style.display = "inline";
            setTimeout(function () {
                            plot = 13;
                            update();
                        }, 3500);
            break;
        case 13:
            // Conversation about saplings (4/7)
            document.getElementById("plot13").style.display = "inline";
            setTimeout(function () {
                            plot = 14;
                            update();
                        }, 3500);
            break;
        case 14:
            // Conversation about saplings (5/7)
            document.getElementById("plot14").style.display = "inline";
            setTimeout(function () {
                            plot = 15;
                            update();
                        }, 3500);
            break;
        case 15:
            // Conversation about saplings (6/7)
            document.getElementById("plot15").style.display = "inline";
            setTimeout(function () {
                            plot = 16;
                            update();
                        }, 3500);
            break;
        case 16:
            // Conversation about saplings (6/7)
            document.getElementById("plot16").style.display = "inline";
            document.getElementById("buy_sapling_button").style.display = "inline";
            setTimeout(function () {
                            plot = 17;
                            update();
                        }, 3500);
            break;
        case 17:
            // Conversation about saplings (7/7)
            document.getElementById("plot17").style.display = "inline";
            setTimeout(function () {
                            plot = 18;
                            update();
                        }, 3500);
            break;
    }
}