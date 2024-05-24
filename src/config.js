export default {
    PARSE_URL: "http://localhost:1337/parse",
    PARSE_APPID: "CLH",
    LEADERBOARD_NAMESPACE_DEFAULT: "leaderboard",

    GOLDEN_CMDS_COMMON_PER_LANG: 2, // Number of very common commands to include
    GOLDEN_CMDS_RANDOM_PER_LANG: 1, // Number of totally random commands to include per language
    GOLDEN_CMDS_MAX_LENGTH: 7, // Max string length that a golden command can be
    GOLDEN_CMDS_PREVIEW_TIME: 21300,
    SCORE_PER_COMMAND: 10,
    SCORE_OVERALL_MULTIPLIER: 100,
    SCORE_GOLDEN_COMMAND_MULTIPLIER: 10,
    GAME_DURATION: 60000,
    CHAR_APPEAR_DELAY: 20, // ms between characters appearing on screen
    CHAR_APPEAR_DELAY_FAST: 1, // ms between characters appearing on screen
    MAX_LEADER_NAME_LENGTH: 20, // max length of names on leaderboard

    // General Fire settings
    FIRE_DELAY_BEFORE: 5000, // Minimum time the game has be be running before fire can display,
    FIRE_CHECK_INTERVAL: 5000, // how often to check if fire should be turned up
    FIRE_CPS_THRESHOLD: 1.75, // Number of valid characters per-second a player must average to get fire
    FIRE_STAGE_ZERO: 0,
    FIRE_STAGE_ONE: 1,
    FIRE_STAGE_TWO: 2,
    FIRE_STAGE_THREE: 3,
    FIRE_STAGE_TWEEN_TIME: 2000, // how long to tween between fire stages

    // Default Fire properties for medium to high
    FIRE_COLOR_1: 0xf7cf78,
    FIRE_COLOR_2: 0xef702b,
    FIRE_COLOR_3: 0xf7a060,
    FIRE_WIND_VECTOR_Y: -0.25,
    FIRE_COLOR_BIAS: 0.25,
    FIRE_BURN_RATE: 2.6,
    FIRE_DIFFUSE: 5,
    FIRE_VISCOSITY: 0.5,
    FIRE_EXPANSION: 0.75,
    FIRE_SWIRL: 30,
    FIRE_DRAG: 0.0,
    FIRE_AIR_SPEED: 40.0,
    FIRE_SPEED: 500.0,
    FIRE_STAGE_ONE_SCALE: { x: 0.5, y: 0.5, z: 1 },
    FIRE_STAGE_TWO_SCALE: { x: 0.7, y: 0.7, z: 1 },
    FIRE_STAGE_THREE_SCALE: { x: 1, y: 1, z: 1 },

    // Fire Settings low FPS clients
    FIRE_LOW_FPS_COLOR_1: 0xf7cf78,
    FIRE_LOW_FPS_COLOR_2: 0xef702b,
    FIRE_LOW_FPS_COLOR_3: 0x420059,
    FIRE_LOW_FPS_WIND_VECTOR_Y: 0.4,
    FIRE_LOW_FPS_COLOR_BIAS: 0.1,
    FIRE_LOW_FPS_BURN_RATE: 5,
    FIRE_LOW_FPS_DIFFUSE: 5.0,
    FIRE_LOW_FPS_VISCOSITY: 0.5,
    FIRE_LOW_FPS_EXPANSION: 0.75,
    FIRE_LOW_FPS_SWIRL: 30.0,
    FIRE_LOW_FPS_DRAG: 0.0,
    FIRE_LOW_FPS_AIR_SPEED: 20.0,
    FIRE_LOW_FPS_SPEED: 200.0,
    FIRE_LOW_FPS_STAGE_ONE_SCALE: { x: 0.8, y: 0.8, z: 1 },
    FIRE_LOW_FPS_STAGE_TWO_SCALE: { x: 1.1, y: 1.1, z: 1 },
    FIRE_LOW_FPS_STAGE_THREE_SCALE: { x: 1.4, y: 1.3, z: 1 },

    MAX_FRAME_TIME: 1000 / 30, // 30 FPS
    MAX_SLOW_FRAMES: 300,

    RENDERER_POWER_PREFERENCE: "low-power",
    RENDERER_PRECISION: "highp", // Use lower precision; can be 'lowp', 'mediump', or 'highp'
    RENDERER_SHADOWS_ENABLED: true,
    RENDERER_ANTIALIASING_ENABLED: true,
    RENDERER_FIRE_ENABLED: false,
    RENDERER_AMBIENTLIGHT_ENABLED: true,
    RENDERER_SPOTLIGHTS_ENABLED: true,
    RENDERER_SPOTLIGHTS_SHADOWS_ENABLED: true,
    RENDERER_COMPUTER_ENABLED: true,
    RENDERER_COMPUTER_SHADOWS_ENABLED: true,
    RENDERER_CYC_ENABLED: true,
    RENDERER_CYC_SHADOWS_ENABLED: true,

    COLORS_COMPUTER: 0xD7BF83,
    //COLORS_COMPUTER: 0x638c94,
    COLORS_COMPUTER_ACCENT: 0x881111,
    COLORS_LIGHTS_CYC: 0x621b9c
};
