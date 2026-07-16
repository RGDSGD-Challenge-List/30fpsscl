import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchChangelog, fetchEditors, fetchList, fetchdailylul } from "../content.js";

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
        <main v-else class="page-list">
            <div class="list-container">
            <input v-model="searchQuery" placeholder="Input text to Filter! here..." class="btn" type="text" id="filterForLevelName" style="width: 80%; margin-bottom: 0.5em;">   
                <table class="list" v-if="list && list.length">
                    <tr v-for="(item, i) in filteredListDisplay" :key="item.originalIndex">
                        <td class="rank">
                            <p v-if="i + 1 <= 101" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == i, 'error': !item.level }">
                            <button @click="selected = i">
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
                            <div class="type-title-sm">Length</div>
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
                    <h2>Welcome to the 30 FPS Spam Challenge List!</h2>
                    <p>Click the levels on the left side to see information about them!</p>
                    <p>For more information about the submission rules check the right side!</p>
                    <h2>le daily</h2>
                    <p>{{ leDaily[0][0].name }} ({{ leDaily[0][0].id }})</p>
                    <button class="btn" @click="selected = Math.ceil(Math.random() * list.length)">
                        <span class="type-label-lg">I'm feeling lucky</span>
                    </button>
                    <h2>Changelog</h2>
                    <main style="display: flex; flex-direction: column; align-items: left; gap: 24px; text-align: left; overflow: hidden; overflow-y: auto; max-height: 300px; width: 700px; border: 3px solid var(--color-primary); border-radius: 5px;">
                        <div style="display: flex; flex-direction: column; align-items: left; gap: 24px; overflow: visible; margin-left: 10px; margin-top: 12px">
                            <ul style="list-style-type: disc; padding-left: 2rem">
                                <template v-for="change in changelog">
                                    <h2 v-if="change.date" style="margin: 1rem; margin-left: -1rem; color: var(--accent);">{{ change.date }}</h2>
                                    <li v-if="change.action == 'a'" class="cl" style="margin: 0; font-family: 'Lexend Deca', sans-serif"><clw>{{ change.levelname }}</clw> has been placed at <clw>#{{ change.position }}</clw>, above <clw>{{ change.above }}</clw> and below <clw>{{ change.below }}</clw></li>
                                    <li v-if="change.action == 's'" class="cl" style="margin: 0; font-family: 'Lexend Deca', sans-serif"><clw>{{ change.levelname }}</clw> and <clw>{{ change.swapped }}</clw> have been swapped, with <clw>{{ change.levelname }}</clw> now sitting above at <clw>#{{ change.position }}</clw></li>
                                    <li v-if="change.action == 'm'" class="cl" style="margin: 0; font-family: 'Lexend Deca', sans-serif"><clw>{{ change.levelname }}</clw> has been raised from <clw>#{{ change.oldposition }}</clw> to <clw>#{{ change.position }}</clw>, above <clw>{{ change.above }}</clw> and below <clw>{{ change.below }}</clw></li>
                                    <li v-if="change.action == 'l'" class="cl" style="margin: 0; font-family: 'Lexend Deca', sans-serif"><clw>{{ change.levelname }}</clw> has been lowered from <clw>#{{ change.oldposition }}</clw> to <clw>#{{ change.position }}</clw>, above <clw>{{ change.above }}</clw> and below <clw>{{ change.below }}</clw></li>
                                    <li v-if="change.action == 'd'" class="cl" style="margin: 0; font-family: 'Lexend Deca', sans-serif"><clw>{{ change.levelname }}</clw> has been removed</li>
                                </template>
                            </ul>
                        </div>
                        <h3 style="text-align: center;" v-if="!changelog">Nothing here yet...</h3>  
                    </main>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>Error! (If this error doesn't go away after some time, please contact staff)</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">The Shitty List</a></p>
                        <br>
                        <p class="type-label-md">Certain features implemented by <a href="https://sgdlist.pages.dev/" target="_blank">The SGD List</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                    <p>
                        Your level <strong>must</strong> be under 30 seconds.
                    </p>
                    <p>
                        Level must be harder than the level at the lowest spot on the list.
                    </p>
                    <p>
                        No inappropriate levels, as this includes NSFW levels/videos.
                    </p>
                    <p>
                       Levels verified/beat with a cps cap will be placed separately.
                    </p>
                    <p>
                        Levels verified/beat with a method outside alternating will be placed separately.
                    </p>
                    <p>
                        Secret ways are <strong>absolutely</strong> prohibited.
                    </p>
                    <p>
                        Levels have to be 30fps Minimum cps is 10.
                    </p>
                    <p>
                        The difficulty must be spam.
                    </p>
                    <p>
                        Noclip is allowed as long as you have 0 deaths or 100% Accuracy.
                    </p>
                    <p>
                        Clicks must be heard. Click Sounds aren't allowed, or medal overlay is allowed as well if u dont have a mic.
                    </p>
                    <p>
                        You have to be on the latest version of Geometry Dash in order to get your completions/verifications accepted.
                    </p>
                      <p>
                        When submitting if you submit more than one level at a time it is prefered that you upload in a compilation
                    </p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: null,
        errors: [],
        roleIconMap,
        searchQuery: '',
        store
    }),
    computed: {
        level() {
            if (this.selected == null) {
                return 0;
            } else {
                return this.list[this.selected][0];
            }
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
            return (this.originalListWithIndex || []).filter(item => item.level?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();
        this.changelog = await fetchChangelog();
        this.leDaily = await fetchdailylul();
        console.log(this.leDaily);

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
