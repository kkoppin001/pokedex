const pokemonCount = 151;
var pokedex = {}; // {1 : {"name" : "bulbasaur", "img" : url, "type" : ["grass, poison"], "des" : ...}}


window.onload = async function() {

    for (let i = 1; i <= pokemonCount; i++) {
        await getPokemon(i);

        let pokemon = document.createElement("div");
        pokemon.id = i;
        pokemon.innerText = i.toString() + ". " + pokedex[i]["name"].toUpperCase();
        pokemon.classList.add("pokemon-name");
        pokemon.addEventListener("click", updatePokemon);

        document.getElementById("pokemon-list").append(pokemon);
    }

    console.log(pokedex);
}

function updatePokemon() {
    document.getElementById("pokemon-img").src = pokedex[this.id]["img"];
}


async function getPokemon(num) {
    let url = "https://pokeapi.co/api/v2/pokemon/" + num.toString();

    let res = await fetch(url);
    let pokemon = await res.json();
    console.log(pokemon);

    let pokemonName = pokemon["name"];
    let pokemonType = pokemon["types"];
    let pokemonImg = pokemon["sprites"]["front_default"];

    res = await fetch(pokemon["species"]["url"]);
    let pokemonDesc = await res.json();
    console.log(pokemonDesc)

    pokemonDesc = pokemonDesc["flavor_text_entries"][9]["flavor_text"];

    pokedex[num] = {"name" : pokemonName, "img" : pokemonImg, "types" : pokemonType, "desc" : pokemonDesc};
}
