import { store } from "../main.js";
import { embed, getYoutubeIdFromUrl } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList, fetchPacks } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list" style="grid-template-columns: auto minmax(16rem, 0.4fr) 1fr;">
            <div class="list-container">
                <table class="list" v-if="packs && packs.length">
                    <tr v-for="([pack, err], i) in filteredPacksDisplay">
                        <td class="level" :class="{ 'active': packSelected === i }">
                            <button @click="packSelected = i" :class="{ 'active': packSelected === i, 'error': !pack }" >
                                <span class="type-label-lg">{{ pack.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
                <p v-if="list && list.length > 0 && filteredListDisplay && filteredListDisplay.length === 0" class="type-body-lg">
                    No levels found matching your search.
                </p>
            </div>
            <div class="list-container">
                <table class="list" v-if="list && list.length">
                    <tr v-for="(item, i) in filteredListPackDisplay" :key="item.originalIndex">
                        <td class="rank">
                            <p v-if="item.originalIndex + 1 <= 150" class="type-label-lg">#{{ item.originalIndex + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == item.originalIndex, 'error': !item.level }">
                            <button @click="selected = item.originalIndex">
                                <span class="type-label-lg">{{ item.level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
                <p v-if="list && list.length > 0 && filteredListDisplay && filteredListDisplay.length === 0" class="type-body-lg">
                    No levels found matching your search.
                </p>
            </div>
            <div class="level-container">
                <div class="level" v-if="level || selected != null">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1, 100, level.percentToQualify) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Method</div>
                            <p>{{ level.enjoyment || 'None (0)' }}</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p v-if="selected + 1 <= 75"><strong>{{ level.percentToQualify }}%</strong> or better to qualify</p>
                    <p v-else-if="selected +1 <= 150"><strong>100%</strong> or better to qualify</p>
                    <p v-else>This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz }}Enj</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else-if="!selected" class="level" style="height: 100%; display: flex; justify-content: center; align-items: center; text-align: center;">
                    	<h3>Select a pack to see its levels!</h3>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>Error! (If this error doesn't go away after some time, please contact staff)</p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: null,
        packSelected: null,
        engineSelected: "All",
		grat: "../assets/levels/",
        ideae: ".webp",
        levelSearch: null,
        searchQuery: '',
        ii: 0,
        blt: 0,
        errors: [],
        roleIconMap,
        store
    }),
    computed: {
        level() {
            if (this.selected == null) {
            	return null;
            } else {
                return this.list[this.selected][0];
            }
        },
        showPacks() {
            if (this.packSelected) {
            console.error(this.packs[this.packSelected][0].levels);
            return this.packs[this.packSelected][0].levels;
            }
            console.error(this.packs[0][0].levels);
            return this.packs[0][0].levels;
        },
        originalListWithIndex() {
            return (this.list || []).map(([level, err], index) => ({
                level,
                err,
                originalIndex: index,
            }));
        },
        filteredListDisplay() {
            if (!this.searchQuery.trim()) {
                return this.originalListWithIndex;
            }
            const searchTerm = this.searchQuery.toLowerCase();
            console.error((this.originalListWithIndex || []).filter(item => item.level?.name?.toLowerCase().includes(searchTerm) && item.level?.engine?.includes(this.engineAsked)));
            return (this.originalListWithIndex || []).filter(item => item.level?.name?.toLowerCase().includes(searchTerm) && item.level?.engine?.includes(this.engineAsked));
		},
        filteredListPackDisplay() {
            if (this.packSelected || this.packSelected == 0) {
                return (this.originalListWithIndex || []).filter(item => this.packs[this.packSelected][0].levels.includes(item.level?.name));
            }
            return 0;
		},
        originalPacksWithIndex() {
            console.error(this.packs);
            return this.packs;
        },
        filteredPacksDisplay() {
            return this.originalPacksWithIndex;
		},

        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.packs = await fetchPacks();
        this.editors = await fetchEditors();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
    },
};
