<template>
    <div>
        <div style="display: flex; justify-content: center; align-items: center; gap: 2rem;">
            <h1>Type Matchups</h1>
            <div>
                <select id="saveFilter" v-model="selectedSaveFilter">
                    <option value="">All Saves</option>
                    <option value="1">Save A</option>
                    <option value="2">Save B</option>
                    <option value="3">Save C</option>
                    <option value="4">Save D</option>
                    <option value="5">Save E</option>
                    <option value="6">Save F</option>
                </select>
            </div>
        </div>
        <div class="type-effectiveness-table">
            <table>
                <thead>
                    <tr>
                        <th>DEF \ ATK</th>
                        <th v-for="atkType in types" :key="`atk-${atkType.id}`">{{ atkType.name.slice(0, 3) }}</th>
                        <th>-</th>
                        <th>+</th> 
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="defType in types" :key="`def-${defType.id}`">
                        <td @click="toggleSelectedType(defType.id)" 
                            :class="{ 'selectedType': selectedTypeId === defType.id }" 
                            style="cursor: pointer;">
                            {{ defType.name }}
                        </td>
                        <td @click="addPokemon(defType.id)" v-for="atkType in types" :key="`match-${defType.id}-${atkType.id}`"
                            :style="getCellStyle(getMatchupMultiplier(atkType.id, defType.id, selectedTypeId))">
                            {{ getMatchupMultiplier(atkType.id, defType.id, selectedTypeId).display }}
                        </td>
                        <td>{{ weaknesses.find(w => w.typeId === defType.id)?.count || '0' }}</td>
                        <td>{{ strengths.find(s => s.typeId === defType.id)?.count || '0' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <div v-if="filteredPokemon.length > 0" class="type-effectiveness-table">
        <table>
            <thead>
                <tr>
                    <th>POKE \ ATK</th>
                    <th v-for="atkType in types" :key="`atk-${atkType.id}`">{{ atkType.name.slice(0, 3) }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="p in filteredPokemon" :key="`pokemon-${p.id}`">
                    <td>
                        {{ p.name }}  ({{ getSaveLetter(p.save) }})
                        <div>
                            {{ getTypeIdName(p.firstTypeId) }} / {{ getTypeIdName(p.secondTypeId) }}
                        </div>
                    </td>
                    <td @click="deletePokemon(p.id)" v-for="atkType in types" :key="`type-match-${p.id}-${atkType.id}`" :style="getCellStyle(displayTypeMatch(p.firstTypeId, p.secondTypeId, atkType.id, p.levitate))">
                        {{ displayTypeMatch(p.firstTypeId, p.secondTypeId, atkType.id, p.levitate).display }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div v-if="showModal" class="modal">
        <div class="modal-content">
            <span class="close" @click="showModal = false">&times;</span>
            <h2>Create Pokémon</h2>
            <form @submit.prevent="createPokemon">
            <div style="display: flex; justify-content: space-between; width: 50%; margin: 1rem auto 0;">
                <div style="display: flex; flex-direction: column; width: 50%; align-items: start; margin: 0 auto;">
                    <label for="pokemonName">Name:</label>
                    <input id="pokemonName" v-model="newPokemon.name" required>
                </div>
                <div style="display: flex; flex-direction: column; width: 50%; align-items: start; margin: 0 auto;">
                    <label for="pokemonLevitate">Levitate:</label>
                    <input id="pokemonLevitate" type="checkbox" v-model="newPokemon.levitate">
                </div>
                <div style="display: flex; flex-direction: column; width: 50%; align-items: start; margin: 0 auto;">
                    <label for="pokemonGroup">Save:</label>
                    <!-- dropdown -->
                    <select id="pokemonGroup" v-model="newPokemon.save" required>
                        <option value="1">Save A</option>
                        <option value="2">Save B</option>
                        <option value="3">Save C</option>
                        <option value="4">Save D</option>
                        <option value="5">Save E</option>
                        <option value="6">Save F</option>
                    </select>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; width: 50%; margin: 1rem auto 0;">
                <label>First Type: {{ getTypeIdName(secondTypeId) }}</label>
                <label v-if="getTypeIdName(selectedTypeId) != 'None'">Second Type: {{ getTypeIdName(selectedTypeId) }}</label>
                <div v-else />
            </div>
            <button type="submit">Create</button>
            </form>
        </div>
    </div>

    <div v-if="showDeleteModal" class="modal">
        <div class="modal-content">
            <span class="close" @click="showDeleteModal = false">&times;</span>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this Pokémon?</p>
            <button @click="confirmDelete">Yes</button>
            <button @click="showDeleteModal = false">No</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

const selectedSaveFilter = ref('');
const types = ref([])
const selectedTypeId = ref(0);
const matches = ref([])
const pokemon = ref([])

const filteredPokemon = computed(() => {
    // If no filter is selected, return all Pokémon
    if (!selectedSaveFilter.value) {
        return pokemon.value;
    }
    // Otherwise, filter the Pokémon by the selected save
    return pokemon.value.filter(p => p.save.toString() === selectedSaveFilter.value);
});

const getTypes = async () => {
  const { data, error } = await supabase.from('Types').select('*')

  if (error) console.error('Error fetching data:', error)
  else types.value = data
}

const getMatches = async () => {
  const { data, error } = await supabase.from('TypeMatchups').select('*')

  if (error) console.error('Error fetching data:', error)
  else matches.value = data
}

const getPokemon = async () => {
    const { data, error } = await supabase.from('Pokemon').select('*')

    if (error) console.error('Error fetching data:', error)
    else pokemon.value = data
}

const getMatchupMultiplier = (attackingTypeId, defendingTypeId, additionalDefendingTypeId) => {
    let baseMultiplier = findMultiplier(attackingTypeId, defendingTypeId);
    let additionalMultiplier = additionalDefendingTypeId > 0 ? findMultiplier(attackingTypeId, additionalDefendingTypeId) : 1;

    // Handling immunity
    if (baseMultiplier === 0 || additionalMultiplier === 0) {
        return { value: 0, display: '0' }; // Immunity
    }

    let combinedMultiplier = 0;
    if (defendingTypeId === selectedTypeId.value) {

        combinedMultiplier = baseMultiplier
    }
    else {

        combinedMultiplier = baseMultiplier * additionalMultiplier;
    }
    return { value: combinedMultiplier, display: formatMultiplier(combinedMultiplier) };
};

const findMultiplier = (attackingTypeId, defendingTypeId) => {
    const match = matches.value.find(m => m.AttackingTypeID === attackingTypeId && m.DefendingTypeID === defendingTypeId);
    return match ? match.Multiplier : 1; // Return 1 if no specific multiplier is found, indicating neutral effect
};

const formatMultiplier = (multiplier) => {
    switch (multiplier) {
        case 0.5:
            return '½';
        case 0.25:
            return '¼';
        case 0.75:
            return '¾';
        case 4:
            return '4'; // Handle the case for a 4x multiplier
        case 0:
            return '0'; // Immunity
        case 1:
            return ''; // No text for neutral effect
        default:
            return multiplier.toString();
    }
};

const getCellStyle = (multiplierObj) => {
  const multiplier = multiplierObj.value;
  if (multiplier === null) {
    return {};
  }
  if (multiplier === 0) {
    return {
      backgroundColor: 'gray',
      color: 'white',
    };
  } else if (multiplier === 0.25) { // Darker red for 1/4
    return {
      backgroundColor: '#990000', // Darker red
      color: 'white',
    };
  } else if (multiplier < 1) {
    return {
      backgroundColor: 'red',
      color: 'white',
    };
  } else if (multiplier === 4) { // Darker green for 4
    return {
      backgroundColor: '#004d00', // Darker green
      color: 'white',
    };
  } else if (multiplier > 1) {
    return {
      backgroundColor: 'green',
      color: 'white',
    };
  }
  // Default styling
  return {
    color: 'black',
  };
};

const calculateCombinedMultiplier = (attackingTypeId, defendingTypeId, additionalDefendingTypeId) => {

    let baseMultiplier = findMultiplier(attackingTypeId, defendingTypeId);
    let additionalMultiplier = additionalDefendingTypeId > 0 ? findMultiplier(attackingTypeId, additionalDefendingTypeId) : 1;
    let combinedMultiplier = baseMultiplier * additionalMultiplier;

    return combinedMultiplier;
};

const weaknesses = computed(() => {
  return types.value.map(defType => {
    const weakAgainstCount = types.value.reduce((count, atkType) => {
      // Avoid self-comparison
      if (defType.id !== atkType.id) {
        const combinedMultiplier = calculateCombinedMultiplier(atkType.id, defType.id, selectedTypeId.value);
        if (combinedMultiplier > 1) count++;
      }
      return count;
    }, 0);
    return { typeId: defType.id, count: weakAgainstCount };
  });
});

const strengths = computed(() => {
  return types.value.map(defType => {
    const strongAgainstCount = types.value.reduce((count, atkType) => {
      // Avoid self-comparison
      if (defType.id !== atkType.id) {
        const combinedMultiplier = calculateCombinedMultiplier(atkType.id, defType.id, selectedTypeId.value);
        // Considering both resistance and immunity as strengths
        if (combinedMultiplier < 1) count++;
      }
      return count;
    }, 0);
    return { typeId: defType.id, count: strongAgainstCount };
  });
});

const toggleSelectedType = (typeId) => {
    if (selectedTypeId.value === typeId) {
        selectedTypeId.value = 0; // Deselect if the same type is clicked again
    } else {
        selectedTypeId.value = typeId; // Select the clicked type
    }
};

onMounted(async () => {
    await getTypes()
    await getMatches()
    await getPokemon()
})

const showModal = ref(false);
const secondTypeId = ref(0);
const newPokemon = ref({ name: '', save: 1, levitate: false});

const addPokemon = (typeId) => {
    secondTypeId.value = typeId;
    showModal.value = true;
};

const createPokemon = async () => {
    const { data, error } = await supabase
        .from('Pokemon')
        .insert([
            {
                name: newPokemon.value.name,
                save: newPokemon.value.save,
                firstTypeId: selectedTypeId.value,
                secondTypeId: secondTypeId.value,
                levitate: newPokemon.value.levitate,
            },
        ]);

    if (error) {
        console.error('Error inserting data:', error);
    } else {
        console.log('Inserted data:', data);
        // Reset form or perform additional actions upon successful insertion
        showModal.value = false;
        newPokemon.value = { name: '', type: null, levitate: false };
        selectedTypeId.value = 0;
        secondTypeId.value = 0;
        await getPokemon();
    }
};

const displayTypeMatch = (firstTypeId, secondTypeId, attackingTypeId, levitate = false) => {
    let firstTypeMultiplier = findMultiplier(attackingTypeId, firstTypeId);
    let secondTypeMultiplier = secondTypeId ? findMultiplier(attackingTypeId, secondTypeId) : 1; // Assume neutral if no second type

    // Correctly calculate the combined multiplier
    let combinedMultiplier = firstTypeMultiplier * secondTypeMultiplier;

    // Handling immunity or other specific rules if needed
    if (firstTypeMultiplier === 0 || secondTypeMultiplier === 0) {
        combinedMultiplier = 0; // Immune
    }

    if (levitate != false && attackingTypeId === 9) {
        combinedMultiplier = 0;
    }

    // Return the calculated combinedMultiplier as part of an object
    // This matches what getCellStyle expects
    return { value: combinedMultiplier, display: formatMultiplier(combinedMultiplier) };
};

const getTypeIdName = (typeId) => {
    return types.value.find(t => t.id === typeId)?.name || 'None';
};

const getSaveLetter = (saveValue) => {
    const mapping = {
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D',
        5: 'E',
        6: 'F',
    };

    return mapping[saveValue] || 'Unknown'; 
};

const showDeleteModal = ref(false);
const pokemonToDeleteId = ref(null);

const deletePokemon = (id) => {
    pokemonToDeleteId.value = id;
    showDeleteModal.value = true;
};

const confirmDelete = async () => {
    
    if (pokemonToDeleteId.value) {
        
        const { data, error } = await supabase
            .from('Pokemon')
            .delete()
            .eq('id', parseInt(pokemonToDeleteId.value, 10));

        if (error) {
            console.error('Error deleting data:', error);
        } else {
            await getPokemon();
        }
    }

    showDeleteModal.value = false;
    pokemonToDeleteId.value = null;
};
</script>

<style>
.type-effectiveness-table table {
  width: 100%;
  border-collapse: collapse;
}

.type-effectiveness-table th,
.type-effectiveness-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.type-effectiveness-table th {
  background-color: #f4f4f4;
  color: darkgrey;
}

.selectedType {
  background-color: #e0e0e0; 
  color: black;
}

/* Highlight row on hover */
.type-effectiveness-table tr:hover {
  background-color: #474747;
  cursor: pointer;
}
.modal {
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.752);
    color: #474747;
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: none;
    border-radius: 8px;
    width: 80%;
}

.modal-content button {
    margin: 10px;
    padding: 5px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.modal-content button:hover {
    opacity: 0.8;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>
