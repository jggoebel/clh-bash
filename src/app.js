import STATES from "./states.js";
import keyCodes from "./keycodes.js";
import consoleCanvas from "./console-canvas.js";
import * as cmds from "./cmds.js";
import config from "./config.js";

// create some handy aliases for keycodes, for use with Vue's v-on directive.
Vue.config.keyCodes = {
    enter: keyCodes.enter
};

let ctrl_down = false;

/**
 * @param {Number} kc the keyCode of the key pressed
 * @param {Array<String>} leftChars the character to the left of the cursor, used to
 * determine whether left arrow is valid (left arrow can't cross over a
 * newline)
 */
function validKeycode(ev, leftChars, state) {
    const kc = ev.keyCode;

    // if ctrl is held down, ignore everything
    if (kc == keyCodes.ctrl) {
        ctrl_down = true;
    }

    if (ctrl_down) {
        return false;
    }

    // valid keys are alpha, numeric, punctuation, underscore, hyphen, enter, and right-arrow.
    // left-arrow and backspace areonly accepted when they doesn't cross over a newline
    // (ie, would have made the cursor to up one line).
    const alphanumeric =
        _.inRange(kc, keyCodes.nums.start, keyCodes.nums.end + 1) ||
        _.inRange(kc, keyCodes.alpha.start, keyCodes.alpha.end + 1) ||
        _.inRange(kc, keyCodes.punct.start, keyCodes.punct.end + 1);

    const valid_other = [keyCodes.enter, keyCodes.right_arrow].includes(kc);

    const on_newline = leftChars[0] === "\n";
    const on_prompt = leftChars.reverse().join("") === "\n> ";
    const valid_backspace =
        kc === keyCodes.backspace && !(on_newline || on_prompt);

    // Allow spaces when people enter their name on high score list
    const valid_space = kc === keyCodes.space && state === STATES.highscore;

    return alphanumeric || valid_other || valid_backspace || valid_space;
}

const app = new Vue({
    el: "#game",
    data: {
        state: STATES.loading,
        isMobile: isMobile.any,
        showTitle: false,
        showScore: false,
        cmd: "",
        cmdDoneWritingFunc: _.noop,
        languages: cmds.getLanguages(),
        typingPosition: 0,
        displayCmd: "",
        commands: [],
        displayScore: false,
        gameDuration: config.GAME_DURATION,
        timer: 0,
        allowTyping: false,
        score: 0,
        charDelay: config.CHAR_APPEAR_DELAY,
        count: {
            js: 0,
            bash: 0,
            html: 0,
            py: 0,
            kubernetes: 0,
            recentValidCharacters: 0,
            totalValidCharacters: 0,
            totalValidCommands: 0
        }
    },
    watch: {
        displayCmd: function(val, oldVal) {
            // if receiving user input and on a newline, add a prompt to the main cmd
            if (this.allowTyping && val[val.length - 1] === "\n") {
                this.cmd += "> ";
            }
        },
        cmd: function(val, oldVal) {
            // if typing is enabled, copy this directly into displayCmd and update typingPosition
            if (this.allowTyping) {
                this.displayCmd = _.clone(this.cmd);
                this.typingPosition = this.cmd.length;
            }
            // if the screen was blanked out, reset typing position
            if (!this.cmd.includes(oldVal)) {
                this.typingPosition = 0;
            }
        }
    },
    methods: {
        toState: function(state) {
            const change = { from: this.state, to: state };
            this.state = state;
            this.titleState = state === STATES.title;
            this.onStateChange(change);
        },
        handlePaste: function(ev) {
            // disable pasting into the textarea
            ev.preventDefault();
        },
        // this keypress handler can be overridden and changed based on the state of the game.
        onKeyPress: _.noop,
        // this keypress handler is the primary one which controls interaction with the textarea.
        handleKeypress: function(ev) {
            // give onKeyPress first crack at this event
            this.onKeyPress(ev);

            if (!this.allowTyping) {
                ev.preventDefault();
                return;
            }
            // first get the char to the left of the cursor (it's used when
            // left arrow is pressed to determine if left arrow is valid; left
            // arrow is valid except when it would cross over a newline and
            // move the cursor to the line above)
            const textarea = this.$el.querySelector("#cmd");
            const leftChars = [
                this.cmd[textarea.selectionStart - 1],
                this.cmd[textarea.selectionStart - 2],
                this.cmd[textarea.selectionStart - 3]
            ];

            // if it's enter, test the input and return.  also, preventDefault
            // so enter doesn't add a newline.  Instead, add the newline
            // ourselves.  This prevents Enter from splitting a word in half if
            // the cursor is inside a word, like hitting enter on "ca|t" would
            // result in "ca\nt".
            if (ev.keyCode === Vue.config.keyCodes.enter) {
                ev.preventDefault();
                const result = this.testCmd(ev);
                result.lang.forEach(lang => app.count[lang]++);

                if (result.cmd.length !== 0) {
                    // scroll to bottom of the textarea
                    // gameplay, it just makes the textarea look nicer when the
                    // textarea itself is visible during debugging)
                    this.$nextTick(() => {
                        textarea.blur();
                        textarea.focus();
                    });
                }
                return;
            }

            // if keycode is invalid, drop the event.
            if (!validKeycode(ev, leftChars, this.state)) {
                ev.preventDefault();
            }
        },
        handleKeyup: function(ev) {
            if (ev.keyCode === keyCodes.ctrl) {
                ctrl_down = false;
            }
        },
        testCmd: function(ev) {
            const cmd = _(this.cmd)
                .split("\n")
                .last()
                .trim()
                .replace(/^\> /, ""); // ignore the prompt
            const { cmd: matchedCmd, lang } = cmds.find(cmd);
            const result = { cmd, valid: !!matchedCmd, matchedCmd, lang };
            this.$nextTick(() => {
                this.onResult(result);
            });
            return result;
        },
        onResult: _.noop,
        onStateChange: function(change) {
            console.log(
                `state changing from "${change.from}" to "${
                    change.to
                }" but no handler is registered.`
            );
        },

        /**
         * This function returns a json object with the set of golden command for this game
         */
        pickGoldenCommands: function() {
            // General rules for golden commands
            //   1. 10 char or less
            //   2. don't start with _
            //   3. don't end with ()
            //   4. Pull from a list of well known commands for each lang
            //   5. pick configurable amount of commands from each language type that meet the above rules

            const filterCmds = function(cmds) {
                // filter by length
                let filteredCmds = cmds.filter(
                    cmd => cmd.length <= config.GOLDEN_CMDS_MAX_LENGTH
                );

                // Filter out starting with underscore
                filteredCmds = filteredCmds.filter(cmd => !Array.isArray(cmd) && !cmd.startsWith("_"));

                // Filter out ending with parens )
                filteredCmds = filteredCmds.filter(cmd => !Array.isArray(cmd) && !cmd.endsWith(")"));

                return filteredCmds;
            };

            let goldenLanguages = [];
            let languagesAvailable = cmds.getLanguageKeys();
            let goldenLanguagesCount = 4;
            let goldenCommands = {};
            let cn = config.GOLDEN_CMDS_COMMON_PER_LANG;
            let rn = config.GOLDEN_CMDS_RANDOM_PER_LANG;

            // Check if there are enough languages to choose from
            if (languagesAvailable.length < goldenLanguagesCount) {
                console.error("Not enough languages available to select 4 unique ones.");
            } else {
                // Shuffle the array of languages randomly
                let shuffledLanguages = languagesAvailable.sort(() => 0.5 - Math.random());

                // Select the first 4 languages from the shuffled array
                goldenLanguages = shuffledLanguages.slice(0, goldenLanguagesCount);
            }


            console.log(goldenLanguages);

            // Iterate over each golden language
            goldenLanguages.forEach(lang => {
                let allCmds = filterCmds(cmds.getLanguageById(lang).cmds);  // Retrieve all commands for the language
                let commonCmds = cmds.getLanguageById(lang).commonCmds;  // Retrieve common commands for the language

                // Sample commands using lodash
                goldenCommands[lang] = _.sampleSize(commonCmds, cn).concat(
                    _.sampleSize(_.xor(commonCmds, allCmds), rn)
                );
            });

            // Combine all golden commands into one array
            goldenCommands.all = [];
            goldenLanguages.forEach(lang => {
                goldenCommands.all = goldenCommands.all.concat(goldenCommands[lang]);
            });

            return goldenCommands;
        },
        /**
         * Get the golden commands for the console canvas.
         */
        printGoldenCommands: function() {
            let out = "";

            const halfScreen = Math.floor(
                consoleCanvas.conf.PLAY_CHARS_PER_LINE / 2
            );
            const goldCmds = app.goldenCommands;
            const langs = _.keys(goldCmds).filter((key) => key != "all");

            // Function to safely retrieve the first command or option
            function getFirstCommand(cmd) {
                if (Array.isArray(cmd)) {
                    return cmd[0];  // Return the first option if it's an array
                }
                return cmd;  // Return the command if it's not an array
            }

            // Process each pair of languages
            for (let i = 0; i < langs.length; i += 2) {
                if (langs[i]) {  // Check if the first language in the pair exists
                    // Display the name of the first language
                    out += cmds.getLanguageById(langs[i]).name.padEnd(halfScreen);
                }
                if (langs[i + 1]) {  // Check if there is a second language in the pair
                    // Display the name of the second language
                    out += cmds.getLanguageById(langs[i+1]).name + "\n";
                } else {
                    // If there's no second language, ensure the line breaks correctly
                    out += "\n";
                }

                // Get the longer of the two command lists to align the loop
                const maxLength = Math.max(
                    goldCmds[langs[i]] ? goldCmds[langs[i]].length : 0,
                    goldCmds[langs[i + 1]] ? goldCmds[langs[i + 1]].length : 0
                );

                // Interleave commands of the two languages
                for (let j = 0; j < maxLength; j++) {
                    if (goldCmds[langs[i]] && goldCmds[langs[i]][j]) {
                        out += ` - ${getFirstCommand(goldCmds[langs[i]][j])}`.padEnd(halfScreen);
                    } else {
                        out += " ".repeat(halfScreen);  // Fill space if there are no commands to display
                    }
                    if (goldCmds[langs[i + 1]] && goldCmds[langs[i + 1]][j]) {
                        out += ` - ${getFirstCommand(goldCmds[langs[i + 1]][j])}\n`;
                    } else if (j < maxLength) {
                        out += "\n";  // Ensure line breaks align properly if there are no commands
                    }
                }
                out += "\n";  // Extra line break after each pair
            }

            return out;
        },
        printHighScores: function(leaders) {
            if (leaders.isEmpty) {
                return "";
            }

            let out = "";

            // Only display the top 10 leaders
            leaders = leaders.slice(0, 10);

            // inject headings
            let leaderContent = _.concat(
                { name: "NAME", score: "SCORE", tribe: "TRIBE" },
                { name: "----", score: "-----", tribe: "-----" },
                leaders
            );

            let longestScoreLength = leaders[0].score.toString().length;
            let longestTribeLength = _(leaderContent)
                .map("tribe")
                .maxBy(n => n.length).length;

            leaderContent.forEach(leader => {
                // pad for column formatting
                let score = leader.score
                    .toString()
                    .padEnd(longestScoreLength + 1);
                let tribe = leader.tribe.padEnd(longestTribeLength + 1);

                out += `${score}  ${tribe}  ${leader.name}\n`;
            });

            return out;
        },
        updateConsole: _.noop,
        writeToConsole: function() {
            this.$nextTick(() => {
                let args = [_.clone(this.displayCmd)];
                const showCursor =
                    this.allowTyping && performance.now() % 1200 < 600;
                if (showCursor) {
                    args[0] += "█";
                }
                if (this.showScore) {
                    args.push(this.score);
                    args.push(this.timer);
                }
                consoleCanvas.write(...args);
            });
        },
        typingLoop: function() {
            let delay = this.typingTimeChar(
                this.cmd[this.typingPosition], this.cmd[this.typingPosition] ?? ""
            );

            if (!this.allowTyping) {
                this.displayCmd = this.cmd.substr(0, this.typingPosition);
            }else{
                this.typingPosition = this.cmd.length;
                this.displayCmd = this.cmd;
            }

            // increment typing position but don't exceed the length of cmd
            this.typingPosition = Math.min(
                this.typingPosition + 1,
                this.cmd.length
            );

            if(this.typingPosition == this.cmd.length){
                app.cmdDoneWritingFunc();
                app.cmdDoneWritingFunc = _.noop;
            }

            setTimeout(this.typingLoop, delay);
        },
        // how long will it take to display the given character
        typingTimeChar: function(str, nextChar) {

            let delay = app.charDelay;

            // Whitespace characters can be displayed faster
            if (/\s/.test(str)) {
                delay /= 10;

                // set delay to 0 if next char is also a whitespace
                if(/\s/.test(nextChar)){
                    delay = 0;
                }
            }

            return delay;
        },
        // how long will it take to display the given string
        typingTime: function(str) {
            str = str.replace(/\s+/g, " ")
            return (
                //Filter out non-whitespace Chars - array equals only whitespace characters, these can be typed faster
                (app.charDelay / 10) * str.replace(/\S/g, "").length +

                //Filter out whitespace Chars - array equals only non-whitespace characters, these can be typed in normal speed
                (app.charDelay) * str.replace(/\s/g, "").length
            );
        },
        resetState: function() {
            // Reset the score and other stat between games:
            this.timer = 0;
            this.allowTyping = false;
            this.score = 0;
            this.count.js = 0;
            this.count.bash = 0;
            this.count.html = 0;
            this.count.py = 0;
            this.count.kubernetes = 0;
            this.count.recentValidCharacters = 0;
            this.count.totalValidCharacters = 0;
            this.count.totalValidCommands = 0;
        }
    },
    mounted: function() {
        // after the entire view has rendered
        this.$nextTick(function() {
            // put focus on the text input
            this.$refs.cmd.focus();
            // and also refocus on the input if the user clicks anywhere with
            // the mouse
            document.body.addEventListener("click", () =>
                this.$refs.cmd.focus()
            );
        });
    }
});

window.app = app;

export default app;
