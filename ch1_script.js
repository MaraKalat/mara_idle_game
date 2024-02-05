function ch1_init() {
    // Set the number formatting environment
    nFormat = new Intl.NumberFormat('en', {notation: "compact", maximumFractionDigits: 2});
    moneyFormat = new Intl.NumberFormat('en', {notation: "compact", minimumFractionDigits: 2, maximumFractionDigits: 2});

    // Update the title with the current chapter
    document.getElementById("game title").innerHTML = "A Zesty Day 🍋 Chapter 1: It Takes A Village";
    pending_plot = null;
    posted_plot = [];
    Papa.parse(
        "https://raw.githubusercontent.com/MaraKalat/mara_idle_game/master/plot.csv",
        {
            header: true,
            download: true,
            skipEmptyLines: true,
            complete: function(parsed_output) {
                plot_json = parsed_output.data;
                set_pending_plot('start1');
                ch1_update();
        	}
        }
    );

	lemons = 16;
	ice_max = 40;
	ice = ice_max;
	ice_producing = false;
	lemonade = 0;
	lemonade_sales = 0;
	money = 0;

	magic_potion = 0;
	saplings = 0;
	sapling_next_batch_size = 1;
	tree_progress = 0;
	trees = 0;
	organic_sapling_progress = 0;

	currently_making = false;
	currently_selling = false;
	trees_growing = false;
	upgrades = [];
	magic_upgrades_bought = 0;
	console.log("Hi! What are you doing in the console?\n" +
	    "Thinking of cheating a bit? ...that's fine, I guess. Should be easy too.\n" +
	    "Could just go 'lemons = lemons + 1000' and stuff.\n\n" +
	    "This is a fully free game that tries to respect your time though, so maybe try it the regular way first? 😘"
    );

	lemonade_price = 0.5;
	lemon_price = 4;
	lemon_amount = 12;
	sapling_price = 22;
	lemon_rate_per_tree = 0.35;
	potion_to_grow_tree = 40;
	glitter_pens_price = 6;
	ice_machine_price = 39;
	potion_price = 500;
	magic_speed_price = 1500;
	magic_spread_price = 2500;

	plot_speed = 4; // Default = 4, lower is faster

    // Initialise the collapsible notes
    for (collapsible of document.getElementsByClassName("collapsible")) {
      collapsible.addEventListener("click", function() {
        this.classList.toggle("active");
        content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.style.maxHeight = null;
          this.style.width = "30%";
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
          this.style.width = "94%";
        }
      })
      // Immediately fire a click event so it starts expanded, unless it shouldn't
      collapsible.click();
      if (collapsible.id == "player_guide") // collapsible that shouldn't auto-open
        collapsible.click();
    }

    // Close modals when clicking outside of content
    window.onclick = function(event) {
      if (event.target == document.getElementById("overlay_modal_ch1")) {
        document.getElementById("overlay_modal_ch1").style.display = "";
      }
    }

	ch1_update();
}

function make_lemonade(method = 'regular') {
    // Turn lemons into lemonade
    lemons -= method == 'magic' ? 4 : 1;
    use_ice();
    magic_potion -= method == 'magic' ? (upgrades.includes('🦠2') ? 0 : 1) : 0;

    keep_making_lemonade = document.getElementById("keep_making_lemonade" + (method == 'magic' ? '_magic' : '')).checked;
    currently_making = true;
    lemonade_making_progress = 0;
    interval_making_lemonade = setInterval(function () {
        document.getElementById("make_lemonade_progress" + (method == 'magic' ? '_magic' : '')).value = lemonade_making_progress;
        lemonade_making_progress++;
        if (lemonade_making_progress > 10) {
            lemonade_making_progress = 0;
            lemonade += method == 'magic' ? 8 : 2;
            document.getElementById("make_lemonade_progress" + (method == 'magic' ? '_magic' : '')).value = lemonade_making_progress;
            keep_making_lemonade = document.getElementById("keep_making_lemonade" + (method == 'magic' ? '_magic' : '')).checked;
            if (keep_making_lemonade
                && lemons >= (method == 'magic' ? 4 : 1)
                && ice > 0
                && magic_potion >= (method == 'magic' ? 1 : 0) * (upgrades.includes('🦠2') ? 0 : 1)
                )
            {
                lemons -= method == 'magic' ? 4 : 1;
                use_ice();
                magic_potion -= (method == 'magic' ? 1 : 0) * (upgrades.includes('🦠2') ? 0 : 1);
            } else {
                clearInterval(interval_making_lemonade);
                currently_making = false;
            }
            ch1_update();
        }
    }, 5)
    ch1_update();
}

function use_ice() {
    // Use up 1 ice
    ice--;

    // Start ice production if it wasn't already running
    if (ice_producing == false) {
        ice_producing = true;
        ice_progress = 0;
        interval_ice_production = setInterval(function () {
            document.getElementById("ice_progress").value = ice_progress;
            ice_progress += upgrades.includes('❄️') ? 3 : 1;
            if (ice_progress > 200) {
                ice++;
                ice_progress = 0;
                if (ice >= ice_max) {
                    clearInterval(interval_ice_production);
                    ice_producing = false;
                }
            }
            ch1_update();
        }, 1);
    }
}

function sell_lemonade() {
    // Main thing to do in chapter 1 of the game, sell your lemonade
	keep_selling = document.getElementById("keep_selling_lemonade").checked;
	document.getElementById("sell_lemonade_button").disabled = true;
	currently_selling = true;
	lemonade_selling_progress = 0;

	interval_selling_lemonade = setInterval(function () {
		lemonade_selling_progress += (upgrades.includes('🖍️') ? 2 : 1) * (upgrades.includes('🧪1') ? 3 : 1);
		document.getElementById("sell_lemonade_progress").value = lemonade_selling_progress;

		if (lemonade_selling_progress > 100) {
		    lemonade--;
		    money += lemonade_price;
		    lemonade_sales++;
			lemonade_selling_progress = 0;

			document.getElementById("sell_lemonade_progress").value = lemonade_selling_progress;
			keep_selling = document.getElementById("keep_selling_lemonade").checked;
			if (keep_selling && lemonade > 0) {
				// do nothing, just keep going.
			} else {
				clearInterval(interval_selling_lemonade);
				currently_selling = false;
			}
			ch1_update();
		}
	}, 10);
	ch1_update();
}

function buy_lemons(count = 1) {
    // Buy a specific amount of lemons
	lemons += lemon_amount * count;
	money -= lemon_price * count;
	ch1_update();
}

function buy_glitter_pens() {
    // Buy the glitter pens upgrade and then change and disable the button
    upgrades.push('🖍️');
    money -= glitter_pens_price;
    document.getElementById("buy_glitter_pens").innerHTML = "[BOUGHT]";
    ch1_update();
}

function buy_ice_machine() {
    // Buy the ice machine, increase the ice cap and disable the buy button for the upgrade
    upgrades.push('❄️');
    money -= ice_machine_price;
    ice++;
    use_ice();
    ice_max += 160;
    document.getElementById("buy_ice_machine").innerHTML = "[SOLD OUT]";
    ch1_update();
}

function buy_sapling(count = 1, for_free = false) {
	// Buy a number of lemon tree saplings
	saplings += count;
	if (!for_free)
	    money -= sapling_price * count;
	ch1_update();

	// Set up tree growth if it isn't already going and you have enough magic potion
	if (trees_growing || magic_potion < potion_to_grow_tree || saplings <= 0)
		return;
	tree_progress = 0;
	sapling_next_batch_size = (upgrades.includes('🦠2') ? saplings : 1);
	magic_potion -= potion_to_grow_tree;
	growing_tree = setInterval(function () {
	    trees_growing = true;
		tree_progress += (upgrades.includes('🧪1') ? 3 : 1) * (upgrades.includes('🧪2') ? 5 : 1);
		if (tree_progress >= 1000) {
			tree_progress = 0;
			trees += sapling_next_batch_size;
			if (trees == 1)
				start_lemon_growth();
			saplings -= sapling_next_batch_size;
			if (saplings <= 0 || magic_potion < potion_to_grow_tree) {
				trees_growing = false;
				clearInterval(growing_tree);
			} else {
			    magic_potion -= potion_to_grow_tree;
			}
			// Determine how many saplings are growing in the batch, default of 1 when you don't have the second spread upgrade
			sapling_next_batch_size = (upgrades.includes('🦠2') ? saplings : 1);
		}
		ch1_update();
	}, 10)
}

function buy_potion(count = 1) {
    lemons -= potion_price * count;
    // If the player is fully out of potion, give them a bit more when refilling to ensure the correct story events trigger
    if (magic_potion == 0)
        magic_potion += 200;
    magic_potion += 1000 * count;

    // sneakily piggyback off the buy_sapling function to start growth when necessary
    buy_sapling(0);
}

function buy_magic_speed(number) {
    // Buy the magic speed upgrade and then change and disable the button
    upgrades.push('🧪' + number);
    lemons -= magic_speed_price * Math.pow(number, 2);
    document.getElementById("buy_magic_speed" + number).innerHTML = "[UPGRADED]";
    magic_upgrades_bought++;

    // Update the potion price and price display if it's the first one
    if (number == 1) {
        potion_price = potion_price / 2;
        document.getElementById("potion_price").innerHTML = potion_price + " 🍋";
        document.getElementById("magic_speed_upgrade_row2").hidden = false;
    }
    ch1_update();
}

function buy_magic_spread(number) {
    // Buy the magic spread upgrade and then change and disable the button
    upgrades.push('🦠' + number);
    lemons -= magic_spread_price * Math.pow(number, 2);
    document.getElementById("buy_magic_spread" + number).innerHTML = "[UPGRADED]";
    magic_upgrades_bought++;

    // Update the potion price and price display if it's the first one
    if (number == 1) {
        potion_price = potion_price / 2;
        document.getElementById("potion_price").innerHTML = potion_price + " 🍋";
        document.getElementById("magic_spread_upgrade_row2").hidden = false;
    }
    // Remove the potion component of growing saplings into trees
    if (number == 2) {
        potion_to_grow_tree = 0;
    }
    ch1_update();
}

function buy_unicorn() {
    // Buy the Unicorn!
    upgrades.push('🦄');
    lemons -= 1000000;
    document.getElementById("buy_unicorn").innerHTML = "[✔]";
    ch1_update();
}

function start_lemon_growth() {
    // Self-looping function that grows lemons when you have trees
	setTimeout(function (){
		lemons += trees * (upgrades.includes('🦠1') ? 4 : 1) * (upgrades.includes('🧪2') ? 3 : 1);
		organic_sapling_progress += (upgrades.includes('🦠1') ? 1 : 0) + (upgrades.includes('🦠2') ? 7 : 0);
		if (organic_sapling_progress > 100) {
		    organic_sapling_progress -= 100;
		    buy_sapling(trees, true);
		}
		ch1_update();
		start_lemon_growth();
	}, 1000/(lemon_rate_per_tree * (upgrades.includes('🧪1') ? 2 : 1)));
}

function ch1_update() {
    // Create a new button if the pending plot is a player message
    if (pending_plot !== null) {
        switch (pending_plot.status) {
            case 'button pending':
                pending_plot.status = 'awaiting player input';
                post_message = document.createElement("button");
                post_message.id = "send_message";
                post_message.className = "button";
                post_message.innerHTML = "💬 Send Message";
                post_message.style.float = "right";
                post_message.style.marginBottom = "10px";
                post_message.onclick = message_button_clicked;
                document.getElementById("plot-box").insertBefore(
                    post_message,
                    document.getElementById("plot-header").nextSibling
                );
                break;
            case 'message pending':
                pending_plot.status = 'person typing';
                setTimeout(function () {
                    is_typing_notification = document.createElement("div");
                    is_typing_notification.id = "is_typing_notification";
                    is_typing_notification.className = get_bubble_class_from_colour(pending_plot.colour);
                    is_typing_notification.innerHTML = pending_plot.avatar + " is typing...";
                    document.getElementById("plot-box").insertBefore(
                        is_typing_notification,
                        document.getElementById("plot-header").nextSibling
                    );
                    setTimeout(function () {
                        add_plot(pending_plot);
                        document.getElementById("is_typing_notification").remove();
                    }, 750 * plot_speed);
                }, (pending_plot.colour == 'green' || pending_plot.colour == 'white') ? 0 : 750 * plot_speed);
        }
    }
    check_plot_progress();

    document.getElementById("upgrades").innerHTML = (upgrades.length > 0) ? "Upgrades: " + upgrades : "";
	document.getElementById("lemons_counter").innerHTML = (lemons > 0) ? "Lemons: " + nFormat.format(lemons) + "🍋" : "";
	document.getElementById("ice_counter").innerHTML = (ice >= 0) ? "Ice: " + nFormat.format(ice) + "🧊 / " + ice_max + " <progress id='ice_progress' value=" + ice_progress + " max='200'></progress>": "";
	document.getElementById("lemonade_counter").innerHTML = (lemonade > 0) ? "Lemonade: " + nFormat.format(lemonade) + "🍹" : "";
	document.getElementById("money_counter").innerHTML = (money > 0) ? "Money: " + moneyFormat.format(money) + "💶" : "";
	document.getElementById("magic_potion_counter").innerHTML = (magic_potion > 0) ? "Magic Potion: " + magic_potion + "mL ⚗️" : "";
	document.getElementById("sapling_counter").innerHTML = (saplings > 0) ? "Saplings: " + nFormat.format(saplings) + "🌱" + "<progress id='sapling_progress' value=" + tree_progress + " max='1000'></progress>": "";
	document.getElementById("tree_counter").innerHTML =
	    (trees > 0) ? "Lemon Trees: " + nFormat.format(trees) + "🌳 (+" +
	    nFormat.format(lemon_rate_per_tree * trees * (upgrades.includes('🧪1') ? 2 : 1) * (upgrades.includes('🧪2') ? 3 : 1) * (upgrades.includes('🦠1') ? 4 : 1)) + "🍋/s" +
	    (upgrades.includes('🦠1') ? " & +" + nFormat.format(lemon_rate_per_tree * trees * (upgrades.includes('🧪1') ? 2 : 1) * (upgrades.includes('🦠2') ? 8 : 1)/ 100) + "🌱/s" : "") + ")" : "";

	// Check what actions are currently happening and disable buttons based on that
    document.getElementById("sell_lemonade_button").disabled = lemonade <= 0 || currently_selling;
    document.getElementById("make_lemonade_button").disabled = lemons <= 0 || ice <= 0 || currently_making;
    document.getElementById("make_lemonade_button_magic").disabled = lemons <= 3 || ice <= 0 || magic_potion <= 0 || currently_making;

	// Check what items you can currently afford and disable buy buttons based on that
	document.getElementById("buy_lemons_button").disabled = money < lemon_price;
	document.getElementById("buy_lemons_button5").disabled = money < lemon_price * 5 || posted_plot.includes('worried_store1');
	document.getElementById("buy_sapling_button").disabled = money < sapling_price;
	document.getElementById("buy_sapling_button5").disabled = money < sapling_price * 5;
	document.getElementById("buy_glitter_pens").disabled = upgrades.includes('🖍️') || money < glitter_pens_price
    document.getElementById("buy_ice_machine").disabled = upgrades.includes('❄️') || money < ice_machine_price
    document.getElementById("buy_potion").disabled = lemons < potion_price;
    document.getElementById("buy_potion5").disabled = lemons < potion_price * 5;
    document.getElementById("buy_magic_speed1").disabled = upgrades.includes('🧪1') || lemons < magic_speed_price;
    document.getElementById("buy_magic_speed2").disabled = upgrades.includes('🧪2') || lemons < magic_speed_price * 4;
    document.getElementById("buy_magic_spread1").disabled = upgrades.includes('🦠1') || lemons < magic_spread_price;
    document.getElementById("buy_magic_spread2").disabled = upgrades.includes('🦠2') || lemons < magic_spread_price * 4;
    document.getElementById("buy_unicorn").disabled = upgrades.includes('🦄') || lemons < 1000000;
}

function modal_popup(message) {
    document.getElementById("overlay_modal_ch1").style.display = "block";
    document.getElementById("modal_text_ch1").innerHTML = message;
}

function message_button_clicked() {
    document.getElementById("send_message").remove();
    pending_plot.status = 'message pending';
    ch1_update();
}

function get_plot(code) {
    return plot_json.find(function(value, index, array) {
        return value["code"] == code;
    })
}

function get_bubble_class_from_colour(colour) {
    switch (colour) {
        case "green":
            return "bubble bubble-alt green";
        case "":
            return "bubble";
        default:
            return "bubble " + colour;
    }
}

function add_plot(plot_row) {
    plot_bubble = document.createElement("div");
    // Correctly set the type of bubble based on the provided colour
    plot_bubble.className = get_bubble_class_from_colour(plot_row["colour"]);
    message = plot_row["message"];
    // Translate the newlines to the HTML tags for newlines
    message = message.replaceAll("\n", "<br>");
    // Insert the correct dynamic values for any placeholders
    message = message.replace("money_amount", moneyFormat.format(money) + "💶");
    // Translate the mentions to also highlight
    message = message.replace(/(@[^\s \.,\!\?]+)([\s \.,!\?])/gm, "<highlight>$1</highlight>$2");
    // Add any new guide points to the guide message
    guide_update = plot_row["guide_update"];
    if (guide_update != "") {
        guide_element = document.getElementById("player_guide_content");
        guide_element.innerHTML = guide_element.innerHTML.replace("<br><br>", "<br>❧ " + guide_update + "<br><br>");
        if (!!guide_element.style.maxHeight) // check if not null
            guide_element.style.maxHeight = guide_element.scrollHeight + "px";
    }

    // Fill in the speech bubble with the correct avatar and message
    if (plot_row["colour"] == 'green')
        plot_bubble.innerHTML = "<div style='font-size:30px; float:right'>"+plot_row["avatar"]+"</div>" + message;
    else
        plot_bubble.innerHTML = "<div style='font-size:30px; float:left'>"+plot_row["avatar"]+"</div>" + message;
    document.getElementById("plot-box").insertBefore(
        plot_bubble,
        document.getElementById("plot-header").nextSibling
    );

    // Log that this plot has now been posted
    posted_plot.push(plot_row['code']);

    // Check if there is a direct next step in the plot and line that up as pending if so
    next_step = plot_row.next;
    if (next_step !== null) {
        set_pending_plot(next_step);
    }

    ch1_update();
}

function set_pending_plot(code) {
    pending_plot = get_plot(code);
    if (pending_plot === undefined) {
        pending_plot = null;
        return;
    }
    if (pending_plot.colour == 'green') {
        pending_plot.status = 'button pending';
    } else {
        pending_plot.status = 'message pending';
    }
    ch1_update();
}

function check_plot_progress() {
    // If there's already pending plot, do nothing
    if (pending_plot !== null) {
        return;
    }
    // Un-hide the sale button when first lemonade is made
    if (!posted_plot.includes('sale1') && lemonade > 0) {
        document.getElementById("sell_line").hidden = false;
    }
    // Reveal the sapling shop option then check if a sapling has been bought
    // TODO This is kind of messy at the moment... the interval is fired several times
    if (!posted_plot.includes('saplings10') && posted_plot.includes('saplings9')) {
        document.getElementById("sapling_price").innerHTML = sapling_price + ' 💶';
        document.getElementById("sapling_row").hidden = false;
        // Check regularly if a sapling has been bought and fire a response based on that
        sapling_bought_check = setInterval(function () {
            if (saplings > 0 && pending_plot === null) {
                if (!posted_plot.includes('saplings10'))
                    set_pending_plot('saplings10');
                clearInterval(sapling_bought_check);
            }
        }, 500);
    }
    // First feedback message from sales
    if (!posted_plot.includes('sale1') && lemonade_sales > 0) {
        set_pending_plot('sale1');
        return;
    }
    // Introduce shopping when the player is out of lemons and lemonade
    if (!posted_plot.includes('out_of_lemons1') && lemonade == 0 && lemons == 0) {
        set_pending_plot('out_of_lemons1');
        return;
    }
    // Actually reveal the shopping elements
    if (posted_plot.includes('out_of_lemons1') && !posted_plot.includes('bought_lemons1')) {
        document.getElementById("shopping_tabs").hidden = false;
        document.getElementById("🏪 button").click();
        document.getElementById("lemon_price").innerHTML = lemon_price + ' 💶';
        document.getElementById("lemon_amount").innerHTML = 'A net containing ' + lemon_amount + ' lemons.';
    }
    // Feedback on bought lemons and some related talks
    if (posted_plot.includes('out_of_lemons1') && !posted_plot.includes('bought_lemons1') && lemons > 0) {
        set_pending_plot('bought_lemons1');
        // Check regularly if the plot has progressed far enough to un-hide the mentioned upgrades.
        pen_and_ice_check = setInterval(function () {
            if (posted_plot.includes('bought_lemons_final')) {
                document.getElementById("glitter_pens_row").hidden = false;
                document.getElementById("glitter_pens_price").innerHTML = glitter_pens_price + ' 💶';
                document.getElementById("ice_machine_row").hidden = false;
                document.getElementById("ice_machine_price").innerHTML = ice_machine_price + ' 💶';
                clearInterval(pen_and_ice_check);
            }
        }, 500);
        return;
    }
    // Check if the ice machine upgrade is bought
    if (!posted_plot.includes('bought_ice_machine1') && upgrades.includes('❄️')) {
        set_pending_plot('bought_ice_machine1');
        return;
    }
    // Check if the glitter pen upgrade is bought
    if (!posted_plot.includes('bought_glitter_pens1') && upgrades.includes('🖍️')) {
        set_pending_plot('bought_glitter_pens1');
        return;
    }
    // Check if the ice machine or glitter pen upgrade is bought and start the sapling plot
    if (!posted_plot.includes('saplings1') &&
        (posted_plot.includes('bought_glitter_pens1') || posted_plot.includes('bought_ice_machine1'))) {
        set_pending_plot('saplings1');
        return;
    }
    // Catch the break in the sapling plot where the new note is delivered to you
    if (!posted_plot.includes('saplings7') && posted_plot.includes('saplings6')) {
        set_pending_plot('saplings7');
        modal_popup(
            "A thin figure in a long coat approaches Carmo's stand.<br>" +
            "A gloved hand puts a thin-glassed bottle and a note on the counter<br>" +
            "The bottle is labeled 'Magic  Pot ion' in sloppy handwriting, its content shimmering in the sun.<br><br>" +
            "Is this the figure Carmo had just been talking to? Huh. Guess they aren't much of a conversationalist.<br>"
        );
        document.getElementById("magic_potion_note").hidden = false;
        document.getElementById("magic_potion_note_content").hidden = false;
        document.getElementById("magic_potion_note").click();
        document.getElementById("magic_potion_note").click();
        document.getElementById("make_magically_line").hidden = false;
        magic_potion += 1000;
        document.documentElement.scrollTop = 0;
        return;
    }
    // Asking for more magic potion as it starts running out
    if (!posted_plot.includes('more_potion1') && magic_potion > 0 && magic_potion < 401) {
        set_pending_plot('more_potion1');
        potion_chat_done = setInterval(function () {
            if (posted_plot.includes('more_potion5')) {
                document.getElementById("🏚️ button").hidden = false;
                document.getElementById("🏚️ button").click();
                clearInterval(potion_chat_done);
            }
        }, 500);
        return;
    }
    // Ask for more magic options after the first time the player buys potion
    if (!posted_plot.includes('more_magic1') && magic_potion > 1000) {
        set_pending_plot('more_magic1');
        return;
    }
    // Un-hide the new upgrade options when the more_magic conversation has progressed far enough
    if (!posted_plot.includes('more_magic7') && posted_plot.includes('more_magic6')) {
        set_pending_plot('more_magic7');
        document.getElementById('magic_speed_upgrade_row1').hidden = false;
        document.getElementById('magic_spread_upgrade_row1').hidden = false;
        document.getElementById('🏚️ button').click();
        return;
    }
    // Un-hide the unicorn option when the more_magic conversation has progressed far enough
    if (!posted_plot.includes('more_magic25') && posted_plot.includes('more_magic24')) {
        set_pending_plot('more_magic25');
        document.getElementById('unicorn_row').hidden = false;
        document.getElementById('🏚️ button').click();
        return;
    }
    // Messages replying to buying magic upgrades
    if (!posted_plot.includes('magic_speed1_bought') && upgrades.includes('🧪1')) {
        set_pending_plot('magic_speed1_bought');
        return;
    }
    if (!posted_plot.includes('magic_speed2_bought') && upgrades.includes('🧪2')) {
        set_pending_plot('magic_speed2_bought');
        return;
    }
    if (!posted_plot.includes('magic_spread1_bought') && upgrades.includes('🦠1')) {
        set_pending_plot('magic_spread1_bought');
        return;
    }
    if (!posted_plot.includes('magic_spread2_bought') && upgrades.includes('🦠2')) {
        set_pending_plot('magic_spread2_bought');
        document.getElementById('potion_buy_line').hidden = true;
        return;
    }
    // Incremental progress updates about the unicorn
    if (!posted_plot.includes('magic_upgrade_bought1') && magic_upgrades_bought > 0 && !upgrades.includes('🦄')) {
        set_pending_plot('magic_upgrade_bought1');
        return;
    }
    if (!posted_plot.includes('magic_upgrade_bought2') && magic_upgrades_bought > 1 && !upgrades.includes('🦄')) {
        set_pending_plot('magic_upgrade_bought2');
        return;
    }
    if (!posted_plot.includes('magic_upgrade_bought3') && magic_upgrades_bought > 2 && !upgrades.includes('🦄')) {
        set_pending_plot('magic_upgrade_bought3');
        return;
    }
    if (!posted_plot.includes('magic_upgrade_bought4') && magic_upgrades_bought > 3 && !upgrades.includes('🦄')) {
        set_pending_plot('magic_upgrade_bought4');
        return;
    }
    // Some more feedback banter, increasingly frantic
    if (!posted_plot.includes('misc1') && lemonade_sales > 250 - magic_upgrades_bought * 100) {
            set_pending_plot('misc1');
            return;
        }
    if (!posted_plot.includes('misc2') && lemonade_sales > 400 - magic_upgrades_bought * 100 && magic_potion > 0) {
            set_pending_plot('misc2');
            return;
        }
    if (!posted_plot.includes('misc3') && lemonade_sales > 550 - magic_upgrades_bought * 100 && posted_plot.includes('misc2')) {
            set_pending_plot('misc3');
            return;
        }
    if (!posted_plot.includes('misc4') && lemonade_sales > 700 - magic_upgrades_bought * 100 && posted_plot.includes('misc3')) {
            set_pending_plot('misc4');
            return;
        }
    if (!posted_plot.includes('misc5') && lemonade_sales > 850 - magic_upgrades_bought * 100 && posted_plot.includes('misc4')) {
            set_pending_plot('misc5');
            return;
        }
    // And the start of the worried store plot in between
    if (!posted_plot.includes('worried_store1') && lemonade_sales > 1000 - magic_upgrades_bought * 100) {
            set_pending_plot('worried_store1');
            return;
        }
    if (!posted_plot.includes('misc6') && lemonade_sales > 1150 - magic_upgrades_bought * 100 && posted_plot.includes('misc5')) {
            set_pending_plot('misc6');
            return;
        }
    if (!posted_plot.includes('misc7') && lemonade_sales > 1300 - magic_upgrades_bought * 100 && posted_plot.includes('misc6')) {
            set_pending_plot('misc7');
            return;
        }
    if (!posted_plot.includes('misc8') && lemonade_sales > 1450 - magic_upgrades_bought * 100 && posted_plot.includes('misc7')) {
            set_pending_plot('misc8');
            return;
        }
    if (!posted_plot.includes('misc9') && lemonade_sales > 1600 - magic_upgrades_bought * 100 && posted_plot.includes('misc8')) {
            set_pending_plot('misc9');
            return;
        }
    if (!posted_plot.includes('misc10') && lemonade_sales > 1750 - magic_upgrades_bought * 100 && posted_plot.includes('misc9')) {
            set_pending_plot('misc10');
            return;
        }
    // And finally even close the standard store
    if (!posted_plot.includes('misc11') && posted_plot.includes('misc10') && magic_upgrades_bought > 0) {
            set_pending_plot('misc11');
            document.getElementById('🏚️ button').click();
            document.getElementById('🏪 button').hidden = true;
            return;
        }
    // Start the plot line where you stop selling lemonade
    if (!posted_plot.includes('no_more_selling1') && posted_plot.includes('misc11') && magic_upgrades_bought > 2) {
        set_pending_plot('no_more_selling1');
        return;
    }
    // And finalise it, including the disabling of the shopping actions
    if (!posted_plot.includes('no_more_selling_final') && posted_plot.includes('no_more_selling_penultimate')) {
        set_pending_plot('no_more_selling_final');
        clearInterval(interval_making_lemonade);
        currently_making = false;
        lemonade = 0;
        document.getElementById('action_table').hidden = true;
        document.getElementById('ice_counter').hidden = true;
        return;
    }
    // The unicorn has been bought!
    if (!posted_plot.includes('unicorn_bought1') && upgrades.includes('🦄')) {
        set_pending_plot('unicorn_bought1');
        document.getElementById('shopping_tabs').hidden = true;
        return;
    }
}

function switch_shop_tab(evt, tab_name) {
  // Declare all variables
  var i, tab_content, tab_links;

  // Get all elements with class="tab_content" and hide them
  tab_content = document.getElementsByClassName("tab_content");
  for (i = 0; i < tab_content.length; i++) {
    tab_content[i].style.display = "none";
  }

  // Get all elements with class="tab_links" and remove the class "active"
  tab_links = document.getElementsByClassName("tab_links");
  for (i = 0; i < tab_links.length; i++) {
    tab_links[i].className = tab_links[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(tab_name).style.display = "block";
  evt.currentTarget.className += " active";
}

function prompt_chapter_two() {
    if(confirm('Are you sure you want to skip the first chapter and go straight to chapter 2?'))
        start_chapter_two();
}

function start_chapter_two() {
    document.getElementById('ch1').hidden = true;
    document.getElementById('ch2p').hidden = false;
    document.getElementById('skip_chapter1').hidden = true;
    // No, I'm not sure why the following is needed. *shrugs*
    document.getElementById('sleep_cycle_dialogue').click();
    document.getElementById('sleep_cycle_dialogue').click();
    ch2p_init();
}