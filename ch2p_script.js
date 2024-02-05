function ch2p_init() {
    // Update the title with the current chapter
    document.getElementById("game title").innerHTML =
        "A Zesty Day 🍋 Chapter 2 Prologue: Before The Dawn";

    // Scroll to the top
    document.documentElement.scrollTop = 0;

    energy = 20;
    energy_income = 0;
    max_energy_income_gain = 1000;

    knowledge = 0;
    knowledge_income = 0;

    scan_progress_visual = 0;
    scan_progress_auditory = 0;
    scan_progress_olfactory = 0;
    scan_progress_senses = 0;
    defragmentation_progress = 0;
    factory_progress = 0;

    // initialise the prologue cards
    card_deck = [];
    card_deck.push(create_card('Energy Spike α', 0, '⚡', "Gain pow_x⚡ energy", "Boost base effect by pow_100y%", 5, 0.02, gain_energy, boost_effect, true));
    card_deck.push(create_card('Energy Spike β', 0, '⚡', "Gain pow_x⚡ energy", "Bonus card growth of pow_100y%", 5, 0.02, gain_energy, boost_growth, true));
    card_deck.push(create_card('Singular Focus', 0, '⚡', "No base effect", "Boost base effect by pow_100y%", 1, 0.2, "None", boost_effect))
    // In separate variables because they later get replaced
    defrag_card = create_card('Defragment "Brain"', 10, '⚡', "Gain pow_x% defrag progress", "No Combo", 3, 0, gain_defrag, "None");
    card_deck.push(defrag_card);
    sensor_card = create_card('Analyse Scanners', 5, '⚡', "Gain pow_x% sensor maintenance progress", "No Combo", 1, 0, gain_sensor, "None");
    card_deck.push(sensor_card);
    // Cards you can unlock later
    efficiency_card = create_card('Efficiency Tweak', 10, '⚡', "Gain pow_x🧠 knowledge", "Reduce cost by pow_1over_y%", 1, 0.01, gain_knowledge, boost_cost_reduce);
    sweep_card = create_card('Sensor Sweep', 25, '⚡', "Gain pow_x🧠 knowledge", "No Combo", 10, 0, gain_knowledge, "None");
    energy_omega_card = create_card('Energy Spike Ω', 2, '⚡', "Gain pow_x⚡ / cycle", "Pay up to pow_y⚡ less", 1, 5, gain_energy_income, boost_cost_discount);
    cupcake_card = create_card('Power The Factory', 400, '⚡', "Gain pow_x% boot sequence", "No Combo", 3, 0, gain_factory, "None");

    shuffle();

    drawn_cards = [];
    left = "None";
    right = "None";
    cycle_capacity = 4;

    cupcake_price_multiplier = 10000;
    total_recipe_cost = 0;

    // Knowledge purchase choices
    reactor_price = 50;
    document.getElementById("reactor_price_field").innerHTML = reactor_price + " 🧠";
    energy_spike_price = 60;
    document.getElementById("energy_spike_price_field").innerHTML = energy_spike_price + " 🧠";
    cupcake_factory_price = 100;
    document.getElementById("cupcake_factory_price_field").innerHTML = cupcake_factory_price + " 🧠";

    // collapse the operational manual again
    document.getElementById('operational_manual_dialogue').click();

    Papa.parse(
        "https://raw.githubusercontent.com/MaraKalat/mara_idle_game/master/cupcake_flavours.csv",
        {
            header: true,
            download: true,
            worker: true,
            skipEmptyLines: true,
            complete: function(parsed_output) {
                cupcakes_json = parsed_output.data;
                set_cupcake_table(cupcakes_json);
                update_cupcake_selection(); // Initialise the cupcake selector
                ch2p_update();
            }
        }
    );

    ch2p_update();

    // Set up the keyboard shortcut for drawing a command from the command stack
    shortcut.add("C",function() {
        if (document.getElementById("overlay_modal_ch2").style.display == "") {
            click_draw_pile();
        }
    });

    // Close modals when clicking outside of content
    window.onclick = function(event) {
      if (event.target == document.getElementById("overlay_modal_ch2")) {
        document.getElementById("overlay_modal_ch2").style.display = "";
      }
    }
}

function ch2p_update() {
    // Update the unicorn resources
    document.getElementById("energy_counter").innerHTML = "Energy: " + nFormat.format(energy) + "⚡"
        + ((energy_income > 0) ? " (+" + nFormat.format(energy_income) + " / cycle)" : "");
    document.getElementById("knowledge_counter").innerHTML = knowledge == 0 ? "" : "Knowledge: " + nFormat.format(knowledge) + "🧠"
        + ((knowledge_income > 0) ? " (+" + nFormat.format(energy_income) + " / cycle)" : "");

    scan_progress_senses = (scan_progress_visual + scan_progress_auditory + scan_progress_olfactory) / 3;
    maintenance_progress = (scan_progress_senses + defragmentation_progress + factory_progress) / 3;
    document.getElementById("maintenance_counter").innerHTML =
        "<progress value=" + maintenance_progress + " max='100'></progress>  " +
        "Maintenance Cycle Completion: " + nFormat.format(maintenance_progress) + "%";
    document.getElementById("sensor_counter").innerHTML =
        "<progress value=" + scan_progress_senses + " max='100'></progress>  " +
        "Sensor Maintenance: " + nFormat.format(scan_progress_senses) + "%";
    document.getElementById("sensor_visual_counter").innerHTML =
        "<progress value=" + scan_progress_visual + " max='100'></progress>  " +
        "Visual Sensors: " + nFormat.format(scan_progress_visual) + "%";
    document.getElementById("sensor_auditory_counter").innerHTML =
        "<progress value=" + scan_progress_auditory + " max='100'></progress>  " +
        "Auditory Sensors: " + nFormat.format(scan_progress_auditory) + "%";
    document.getElementById("sensor_olfactory_counter").innerHTML =
        "<progress value=" + scan_progress_olfactory + " max='100'></progress>  " +
        "Olfactory Sensors: " + nFormat.format(scan_progress_olfactory) + "%";
    document.getElementById("defragment_counter").innerHTML =
        "<progress value=" + defragmentation_progress + " max='100'></progress>  " +
        'Neural Defragmentation: ' + nFormat.format(defragmentation_progress) + "%";
    document.getElementById("factory_counter").innerHTML =
            "<progress value=" + factory_progress + " max='100'></progress>  " +
            'Cupcake Factory Boot Sequence: ' + nFormat.format(factory_progress) + "%";
    document.getElementById("end_maintenance_button").disabled = maintenance_progress < 100;


    // Update the knowledge purchases based on various things
    document.getElementById("knowledge_upgrades").hidden = knowledge <= 0;
    document.getElementById("reaction_purchases_line").hidden = energy_income == 0;
    document.getElementById("reactor_income_boost").innerHTML = "Automatically gain +" + nFormat.format(Math.min(max_energy_income_gain, energy_income * 0.1)) + "⚡ / cycle";
    document.getElementById("buy_income_button").disabled = knowledge < reactor_price;
    document.getElementById("buy_5_income_button").disabled = knowledge < 5 * reactor_price;
    document.getElementById("buy_energy_spike_omega").disabled = knowledge < energy_spike_price || energy_omega_card.bought;
    document.getElementById("buy_cupcake_command").disabled = knowledge < cupcake_factory_price || cupcake_card.bought;
}

// Finish the maintenance cycle, unlocking cupcake production
function finish_maintenance_cycle() {
    document.getElementById("maintenance_resources").hidden = true;
    document.getElementById("cupcake_factory").hidden = false;
}

// Fade out a specific element of the UI then clear it
function fade(element) {
    clearInterval(element.timer);
    var op = 1;  // initial opacity
    element.timer = setInterval(function () {
        if (op <= 0.1) {
            clearInterval(element.timer);
            element.innerHTML = "";
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= 0.1;
    }, 100);
}

function fading_income(changing_resource, amount, suffix="") {
    text = document.getElementById(changing_resource+"_change");
    if (amount > 0)
        text.style.color = "green";
    else
        text.style.color = "red";
    text.innerHTML = (amount > 0 ? " +" : "") + nFormat.format(amount) + suffix;
    fade(text);
}

function create_card(name, cost, cost_currency, effect_text, combo_text, power_x=0, power_y=0, activation, combo, gains_energy=false) {
    return {
        name: name,
        cost: cost,
        cost_discount: 0,
        cost_currency: cost_currency,
        effect_text: effect_text,
        combo_text: combo_text,
        power_x: power_x,
        power_y: power_y,
        power_multi: 1,
        growth_multi: 1,
        gains_energy: gains_energy,
        drawn_index: 0,
        validation: "None",
        bought: false,
        purge_next_cycle: false,
        activate: function() {
            return_text = "";
            if (activation != "None")
                return_text = activation(
                    Math.max(0, this.cost - this.cost_discount),
                    this.power_x * this.power_multi,
                    this.power_y * this.power_multi
                );
            // Cards organically get stronger with every activation
            this.power_x = this.power_x * 1.02 * this.growth_multi;
            this.power_y = this.power_y * 1.02 * this.growth_multi;

            this.validation = document.getElementsByClassName("card_" + this.drawn_index + "_valid")[0];
            this.validation.innerHTML = "✅";

            // Update everything that needs updating
            ch2p_update();
            return return_text;
        },
        combo: function(card, power) {
            if (combo != "None")
                combo(card, power);
        },
        toString: function() {
            return this.name + " (" + this.cost + this.cost_currency + ")";
        }
    };
}

function shuffle() {
    card_deck = card_deck
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

function click_draw_pile() {
    draw_pile_text = document.getElementById("draw_pile_text");
    // Draw a card if there's still capacity for more cards
    if (cycle_capacity > drawn_cards.length) {
        drawn_card = card_deck.shift();
        drawn_cards.push(drawn_card);
        drawn_card.drawn_index = drawn_cards.length;
        if (left == "None")
            left = drawn_card;
        else
            right = drawn_card;
        card_element = document.getElementById("card_" + drawn_cards.length);
        fill_in_HTML_card(card_element, drawn_card, (right == "None" ? "left" : "right"));

        // Activate and resolve the pair if it is complete
        if (right != "None")
            activate_pair();

        // Change the hover text when the cycle is full
        if (cycle_capacity == drawn_cards.length) {
            draw_pile_text.style.background = "red";
            draw_pile_text.innerHTML = "Next Cycle";
        }
    // End the cycle if not!
    } else {
        // Gain the end-of-cycle resources
        if (energy_income != 0) {
            gain_energy(0, energy_income, 0);
            fading_income("energy", energy_income);
        }

        // Reset the deck mechanically
        for (card of drawn_cards)
            if (card.purge_next_cycle != true)
                card_deck.push(card);
        drawn_cards = [];
        shuffle();

        // Empty out the slots visually
        card_slots = document.getElementById("ch2p").querySelectorAll(".drawn_card");
        for (card_slot of card_slots) {
            card_slot.innerHTML = "";
            card_slot.style.border = "0px";
            card_slot.style.borderBottom = "2px outset black";
            card_slot.style.background = "transparent";
        }

        // Clear all the result elements
        for (element_class_name of ["card_1_valid", "card_2_valid", "card_3_valid", "card_4_valid", "pair_1_result", "pair_2_result"]) {
            document.getElementsByClassName(element_class_name)[0].innerHTML = "";
        }

        // Change the hover text back to the default
        draw_pile_text.style.background = "green";
        draw_pile_text.innerHTML = "Draw Command";
    }
}

// Fill in the details of a drawn card
function fill_in_HTML_card(card_element, drawn_card, position="middle") {
    card_element.innerHTML =
        // Card Title
        "<div style='font-weight: bold'>" + drawn_card.name + "</div>" +
        // Line + card cost
        "<hr style='margin-top: 15px'>" +
        "<div style='margin-top: -20px; margin-bottom:10px;'>" +
            "<span style='background-color: #efffec; padding: 5px'>" +
                nFormat.format(drawn_card.cost) + drawn_card.cost_currency +
            "</span>" +
        "</div>" +
        // Card effect, translated to fill in the blanks
        text_substitutions(drawn_card.effect_text, drawn_card.power_x * drawn_card.power_multi, drawn_card.power_y * drawn_card.power_multi) +
        // Card combo effect, equally translated
        "<br><div style='background-color: #f1c543; margin: 0px -10px; padding: 0px 10px 50px;max-height: 100%;'>" +
        "<div style='font-size: smaller; color: #8f6e0b; margin-top: 10px; text-align:center';>" +
            "<i class='arrow left'" + (position == "left" ? " style='border-color:transparent;'" : "") +  "></i>" +
            "COMBO" +
            "<i class='arrow right'" + (position == "right" ? " style='border-color:transparent;'" : "") + "></i>" +
        "</div>" +
        text_substitutions(drawn_card.combo_text, drawn_card.power_x * drawn_card.power_multi, drawn_card.power_y * drawn_card.power_multi) + "</div>";
    // Set the border and background
    card_element.style.border = "2px outset black";
    card_element.style.background = "#efffec";
}

function text_substitutions(text, x, y) {
    return text
        .replace("pow_x", nFormat.format(x))
        .replace("pow_y", nFormat.format(y))
        .replace("pow_100x", nFormat.format(x * 100))
        .replace("pow_100y", nFormat.format(y * 100))
        .replace("pow_1over_y", nFormat.format(100 - (1 / (1 + y)) * 100));
}

function activate_pair() {
    left.combo(right, left.power_y);
    right.combo(left, right.power_y);

    left_cost = Math.max(0, left.cost - left.cost_discount) - (left.gains_energy ? left.power_x * left.power_multi: 0);
    right_cost = Math.max(0, right.cost - right.cost_discount) - (right.gains_energy ? right.power_x * right.power_multi: 0);
    total_cost = left_cost + right_cost;
    spent_energy = 0;
    result_text = "";

    // Play both cards if you can afford them
    if (total_cost <= energy) {
        result_text += left.activate();
        result_text += right.activate();
        spent_energy = -total_cost;
    } else {
        // Play the right card if it's more expensive than the left or you can't afford the left.
        if (right_cost <= energy && (right_cost > left_cost || left_cost > energy)) {
            result_text += right.activate();
            spent_energy = -right_cost;
            left.validation = document.getElementsByClassName("card_" + left.drawn_index + "_valid")[0];
            left.validation.innerHTML = "❌";
        } else {
            // Play the left card if you can afford it.
            if (left_cost <= energy) {
                result_text += left.activate();
                spent_energy = -left_cost;
                right.validation = document.getElementsByClassName("card_" + right.drawn_index + "_valid")[0];
                right.validation.innerHTML = "❌";
            } else {
                // You can't afford any of the cards!
                left.validation = document.getElementsByClassName("card_" + left.drawn_index + "_valid")[0];
                left.validation.innerHTML = "❌";
                right.validation = document.getElementsByClassName("card_" + right.drawn_index + "_valid")[0];
                right.validation.innerHTML = "❌";
            }
        }
    }

    if (spent_energy != 0) {
        result_text = (spent_energy > 0 ? '+' : '') + nFormat.format(spent_energy) + "⚡ energy<br> " + result_text;
        fading_income("energy", spent_energy);
    }

    result_text = "<b>Total Effect:</b><br>" + (result_text == "" ? "Nothing. 🤷‍♀️" : result_text);
    result_element = document.getElementsByClassName(left.drawn_index == 1 ? "pair_1_result" : "pair_2_result")[0];
    result_element.innerHTML = result_text;

    // Reinitialise the two cards
    for (card of [left, right]) {
        card.cost_discount = 0;
        card.power_multi = 1;
        card.growth_multi = 1;
    }
    left = "None";
    right = "None";
}

// Gain a new command and add it to the command deck
function gain_card(new_card, cost) {
    card_deck.push(new_card);
    shuffle();
    new_card.bought = true;
    if (cost > 0)
        gain_knowledge(0, -cost, 0);

    // Also give a pop-up to explain that this happened!
    deck_change_modal_popup("None", new_card);
    ch2p_update();
}

// Set a command to be deleted at the start of the cycle
function delete_card(old_card) {
    old_card.purge_next_cycle = true;
    // Also give a pop-up to explain that this happened!
    deck_change_modal_popup(old_card, "None");
}

// Gain a new card and remove an old card
function replace_card(old_card, new_card) {
    gain_card(new_card, 0);
    delete_card(old_card);
    // Also give a pop-up to explain that this happened!
    deck_change_modal_popup(old_card, new_card);
}

// Give a nice modal pop-up that shows the change in your card pool
function deck_change_modal_popup(old_card, new_card) {
    modal = document.getElementById("overlay_modal_ch2");
    modal.style.display = "block";

    old_card_element = document.getElementById("modal_old_card");
    if (old_card == "None") {
        old_card_element.hidden = true;
        old_card_element.nextElementSibling.hidden = true;
    } else {
        old_card_element.hidden = false;
        old_card_element.nextElementSibling.hidden = false;
        fill_in_HTML_card(old_card_element, old_card);
    }

    new_card_element = document.getElementById("modal_new_card");
    if (new_card == "None") {
        new_card_element.hidden = true;
        new_card_element.nextElementSibling.hidden = true;
    } else {
        new_card_element.hidden = false;
        new_card_element.nextElementSibling.hidden = false;
        fill_in_HTML_card(new_card_element, new_card);
    }

    modal_text_element = document.getElementById("modal_text_ch2");
    if (old_card == "None") {
        modal_text_element.innerHTML = "You have gained a new Command, it has been shuffled into your Command Deck:";
    } else {
        if (new_card == "None") {
            modal_text_element.innerHTML = "The following Command has been removed from your Command Deck:";
        } else {
            modal_text_element.innerHTML = "A Command in your Command Deck has been replaced:";
        }
    }
}

// Set the huge cupcake table's contents
function set_cupcake_table(cupcakes_json) {
    for (cupcake_part of cupcakes_json) {
        if (cupcake_part.type != "wrapper") {
            row = document.getElementById("factory_list_" + cupcake_part.type);
            row.innerHTML += '<div class="selection"><input type="' + (cupcake_part.type == 'topping' ? 'checkbox' : 'radio') + '" id="selected_' + cupcake_part.type + '_' + cupcake_part.name + '" name="chosen_' + cupcake_part.type + '" value="' + cupcake_part.name + '">' +
            '<label for="selected_' + cupcake_part.type + '_' + cupcake_part.name + '"' +
            (cupcake_part.name.includes('*') ? ' title="*: Non-alcoholic substitute."' : '') +
            '>' + cupcake_part.name + ' <span style="float: right;">' + nFormat.format(cupcake_part.energy_cost * cupcake_price_multiplier) + '⚡</span></label></div><div style="line-height:30%;"><br></div>'
        }
    }
}

function update_cupcake_selection() {
    selected_parts = {};
    total_recipe_cost = 0;
    unselected_parts = 0;
    for (part of ['cake', 'filling', 'frosting']) {
        try {
            selected_part = cupcakes_json.find((element) => element.type == part &&
                element.name == document.querySelector('input[name="chosen_' + part + '"]:checked').value);
        } catch {
            selected_part = {type: part, name: "[No " + part + " selected]", energy_cost: "0" }
            unselected_parts++;
        }
        selected_parts[part] = selected_part;
        total_recipe_cost += Number(selected_part.energy_cost);
    }
    try {
        selected_toppings = Array.from(document.querySelectorAll('input[name="chosen_topping"]:checked')).map(
            x => cupcakes_json.find((element) => element.type == "topping" && element.name == x.value));
    } catch {selected_toppings = []; }
    selected_parts['topping'] = selected_toppings;

    prompt_text =
        "Produce " + (selected_parts["cake"].name.match('^[AaIiEeOoUu].*') ? "an " : "a ") + selected_parts["cake"].name +
         " Cupcake " +
         ((selected_parts["filling"].name != "No" || selected_parts["frosting"].name != "No" || selected_parts["topping"].length > 0) ? "with " : "") +
         (selected_parts["filling"].name == "No" ? "" : selected_parts["filling"].name + " Filling") +
         (selected_parts["frosting"].name == "No" ? "" : ", " + selected_parts["frosting"].name + " Frosting");
    for (topping of selected_parts['topping']) {
        total_recipe_cost += Number(topping.energy_cost);
        prompt_text += (prompt_text.endsWith(" ") ? "" : ", ") + topping.name;
    }
    // Remove any free-floating commas
    prompt_text = prompt_text.replaceAll(' , ', ' ');
    // Change the final comma to an ampersand
    final_comma_is_at = prompt_text.lastIndexOf(',');
    if (final_comma_is_at != -1)
        prompt_text =
            prompt_text.substring(0, final_comma_is_at) + " & " +
            prompt_text.substring(final_comma_is_at+2);
    prompt_text += " for " + nFormat.format(total_recipe_cost * cupcake_price_multiplier) + "⚡?";
    document.getElementById("cupcake_selection_text").innerHTML = prompt_text;

    // Change the button as appropriate
    cupcake_button = document.getElementById("start_cupcake_button");
    if (unselected_parts > 0) {
        cupcake_button.disabled = true;
        cupcake_button.innerHTML = "Select all components";
    } else {
        if (total_recipe_cost * cupcake_price_multiplier >= energy) {
            cupcake_button.disabled = true;
            cupcake_button.innerHTML = "Can't afford selected cupcake";
        } else {
            cupcake_button.disabled = false;
            cupcake_button.innerHTML = "Start Production";
        }
    }
}

// Produce the first cupcake, progressing the plot
function produce_selected_cupcake() {
    gain_energy(0, -total_recipe_cost * cupcake_price_multiplier, 0);
    ch2p_update();
    deck_change_modal_popup("None", "None");
    document.getElementById("modal_text_ch2").innerHTML =
        "<div style='display: flex'>" +
        "<div class='bubble yellow'><div style='font-size:30px; float:left'>🌳</div>" +
        "Hello again! This is the end of the Chapter 2 prologue, thank you so much for playing it!<br>" +
        "It's quite different from the first chapter, but I hope you still had fun.<br>" +
        "Please let me know if you did!<br><br>" +
        "Chapter 2 will be back to Carmo's perspective as she explores her now overgrown and deserted town.<br>" +
        "I hope you'll join her for that!</div></div>";
}

// Gain an amount of energy
function gain_energy(c, x, y) {
    energy += x;
    update_cupcake_selection();
    return "";
}

function gain_energy_income(c, x, y) {
    energy_income += x;
    return "+" + nFormat.format(x) + "⚡ energy income / cycle<br>";
}

// Gain an amount of energy income based on a percentage
function gain_energy_income_percent(c, x, y) {
    // Check if this is the quintuple purchase
    times_five = reactor_price * 5 == c;
    gain_knowledge(0, -c, y);
    energy_income_gain = Math.min(max_energy_income_gain * (times_five ? 5 : 1), energy_income * x);
    energy_income += energy_income_gain;
    ch2p_update();
}

// Gain an amount of knowledge
function gain_knowledge(c, x, y) {
    gain_energy(0, -c, 0);
    knowledge += x;
    fading_income("knowledge", x);
    return (x > 0 ? " +" : "") + nFormat.format(x) + "🧠 knowledge<br>";
}

// Gain a random amount of progress for each remaining sensor type
function gain_sensor(c, x, y) {
    gain_energy(0, -c, 0);
    return_text = "";

    visual_amount = Math.min(
        (scan_progress_auditory+scan_progress_olfactory < 200 ? Math.random() : 1) * x,
        100-scan_progress_visual
    );
    auditory_amount = Math.min(
        (scan_progress_olfactory < 100 ? Math.random() : 1) * (x - visual_amount),
        100-scan_progress_auditory
     );
    olfactory_amount = Math.min(x-visual_amount-auditory_amount, 100-scan_progress_olfactory);

    if (visual_amount > 0) {
        return_text += (visual_amount > 0 ? " +" : "") + nFormat.format(visual_amount) + "% visual sensor progress<br>";
        scan_progress_visual += visual_amount;
        fading_income("sensor_visual", visual_amount, "%");
    }
    if (auditory_amount > 0) {
        return_text += (auditory_amount > 0 ? " +" : "") + nFormat.format(auditory_amount) + "% auditory sensor progress<br>";
        scan_progress_auditory += auditory_amount;
        fading_income("sensor_auditory", auditory_amount, "%");
    }
    if (olfactory_amount > 0) {
    	return_text += (olfactory_amount > 0 ? " +" : "") + nFormat.format(olfactory_amount) + "% olfactory sensor progress<br>";
    	scan_progress_olfactory += olfactory_amount;
    	fading_income("sensor_olfactory", olfactory_amount, "%");
    }
    if (visual_amount + auditory_amount + olfactory_amount > 0) {
        fading_income("sensor", (visual_amount + auditory_amount + olfactory_amount) / 3, "%");
    }
    if (scan_progress_visual + scan_progress_auditory + scan_progress_olfactory == 300)
        replace_card(sensor_card, sweep_card);
    return return_text;
}

// Gain an amount of defragmentation progress
// Also replaces the defrag card once defragmentation is done.
function gain_defrag(c, x, y) {
    x = Math.min(x, 100 - defragmentation_progress);
    gain_energy(0, -c, 0);
    defragmentation_progress += x;
    fading_income("defragment", x, "%");
    if (defragmentation_progress == 100) {
        replace_card(defrag_card, efficiency_card);
    };
    return (x > 0 ? " +" : "") + nFormat.format(x) + "% defrag progress<br>";
}

function gain_factory(c, x, y) {
    x = Math.min(x, 100 - factory_progress);
    gain_energy(0, -c, 0);
    factory_progress += x;
    fading_income("factory", x, "%");
    if (factory_progress == 100) {
        delete_card(cupcake_card);
    };
    return (x > 0 ? " +" : "") + nFormat.format(x) + "% factory startup progress<br>";
}

function boost_effect(c, p) {
    c.power_multi = 1 + p;
}
function boost_growth(c, p) {
    c.growth_multi = 1 + p;
}
function boost_cost_discount(c, p) {
    c.cost_discount = p;
}
function boost_cost_reduce(c, p) {
    c.cost = c.cost * 1 / (1 + p);
}