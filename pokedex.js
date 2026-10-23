const generations = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1025]
};

var pokedex = {};

let currentGeneration = null;
let selectedPokemon = null;

window.onload = function() {

    let tabs = document.querySelectorAll(".gen-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", async function() {

            let gen = Number(this.dataset.gen);

            if (gen === currentGeneration) return;

            currentGeneration = gen;

            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            resetPokemon();

            await loadGeneration(gen);
        });
    });
};

async function loadGeneration(gen) {

    let pokemonList = document.getElementById("pokemon-list");

    pokemonList.innerHTML = "Loading Pokémon...";

    let [start, end] = generations[gen];

    try {
        let url = "https://pokeapi.co/api/v2/generation/" + gen;

        let res = await fetch(url);

        if (!res.ok) {
            throw new Error("Failed to load generation " + gen);
        }

        let data = await res.json();

        let species = data["pokemon_species"].map(pokemon => {

            let parts = pokemon.url.split("/").filter(Boolean);

            return {
                "name": pokemon.name,
                "id": Number(parts[parts.length - 1])
            };
        });

        species = species
            .filter(pokemon =>
                pokemon.id >= start && pokemon.id <= end
            )
            .sort((a, b) => a.id - b.id);

        // Ignore results from an older tab.
        if (gen !== currentGeneration) return;

        pokemonList.innerHTML = "";

        for (let pokemonData of species) {

            let pokemon = document.createElement("div");

            pokemon.id = pokemonData.id;

            pokemon.innerText =
                pokemonData.id + ". " +
                pokemonData.name.toUpperCase();

            pokemon.classList.add("pokemon-name");

            pokemon.addEventListener("click", updatePokemon);

            pokemonList.append(pokemon);
        }

        pokemonList.scrollTop = 0;

    } catch (error) {
        console.error(error);

        if (gen === currentGeneration) {
            pokemonList.innerText = "Unable to load Pokémon.";
        }
    }
}

async function updatePokemon() {

    let id = this.id;

    selectedPokemon = id;

    try {
        await getPokemon(id);

        // Ignore outdated selections.
        if (selectedPokemon !== id) return;

        let pokemon = pokedex[id];

        document.getElementById("pokemon-img").src =
            pokemon["img"];

        let typesDiv = document.getElementById("pokemon-types");

        while (typesDiv.firstChild) {
            typesDiv.firstChild.remove();
        }

        let types = pokemon["types"];

        for (let i = 0; i < types.length; i++) {

            let type = document.createElement("span");

            type.innerText =
                types[i]["type"]["name"].toUpperCase();

            type.classList.add("type-box");

            type.classList.add(types[i]["type"]["name"]);

            typesDiv.append(type);
        }

        let description =
            document.getElementById("pokemon-description");

        description.innerText = pokemon["desc"];
        description.style.display = "block";

    } catch (error) {
        console.error("Error loading Pokémon:", error);
    }
}

async function getPokemon(num) {

    // Use cached data if available.
    if (pokedex[num]) return;

    let url = "https://pokeapi.co/api/v2/pokemon/" + num;

    let res = await fetch(url);

    if (!res.ok) {
        throw new Error("Failed to load Pokémon " + num);
    }

    let pokemon = await res.json();

    let pokemonName = pokemon["name"];
    let pokemonType = pokemon["types"];
    let pokemonImg = pokemon["sprites"]["front_default"];

    res = await fetch(pokemon["species"]["url"]);

    if (!res.ok) {
        throw new Error("Failed to load Pokémon description");
    }

    let pokemonSpecies = await res.json();

    let pokemonDesc = pokemonSpecies["flavor_text_entries"]
        .find(entry => entry.language.name === "en");

    let description = pokemonDesc
        ? pokemonDesc["flavor_text"].replace(/\s+/g, " ")
        : "No description available.";

    pokedex[num] = {
        "name": pokemonName,
        "img": pokemonImg,
        "types": pokemonType,
        "desc": description
    };
}
function resetPokemon() {

    selectedPokemon = null;
    document.getElementById("pokemon-img").src ="./images/pb-transparent.png";

    document.getElementById("pokemon-types").innerHTML = "";

    let description =
        document.getElementById("pokemon-description");

    description.innerText = "";
    description.style.display = "none";
}
